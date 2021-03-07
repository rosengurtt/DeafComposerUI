import { Component, OnChanges, SimpleChange, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild, SimpleChanges, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core'
import { Song } from 'src/app/core/models/song'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { TrackComponent } from './track/track.component'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { PlayingSong } from 'src/app/core/models/playing-song'
import { MatSliderChange } from '@angular/material/slider'
import { Subject } from 'rxjs'
import { Router } from '@angular/router'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'
import { getSupportedInputTypes } from '@angular/cdk/platform'
import { FormControl } from '@angular/forms'

declare var MIDIjs: any

@Component({
  selector: "dc-song-panel",
  templateUrl: './song-panel.component.html',
  styleUrls: ['./song-panel.component.scss']
})
export class SongPanelComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {


  @Input() songId: number
  @Input() song: Song
  @Input() displacement: Coordenadas
  @Input() scale
  @Input() playingSong: PlayingSong
  @Input() mutedTracks: number[]
  @Input() viewType: SongViewType
  @Input() songSimplificationVersion: number
  @Input() songSliderPosition: number

  @Output() closePage = new EventEmitter<Song>()
  @Output() displacementChanged = new EventEmitter<Coordenadas>()
  @Output() scaleChanged = new EventEmitter<number>()
  @Output() songStartedPlaying = new EventEmitter<PlayingSong>()
  @Output() songStoppedPlaying = new EventEmitter()
  @Output() songPaused = new EventEmitter()
  @Output() songResumed = new EventEmitter()
  @Output() muteStatusChanged = new EventEmitter<{ songId: number, track: number, status: boolean }>()
  @Output() unmuteAllTracks = new EventEmitter()
  @Output() songViewTypeChanged = new EventEmitter<SongViewType>()
  @Output() songSimplificationChanged = new EventEmitter<number>()
  @Output() songSliderPositionChanged = new EventEmitter<number>()

  resetEventSubject: Subject<boolean> = new Subject<boolean>()
  moveProgressBarSubject: Subject<number> = new Subject<number>()

  tracks: number[]
  sliderMax: number
  sliderStep = 1
  sliderHasBeenMoved = false
  songViewType: typeof SongViewType = SongViewType
  tempoBox = new FormControl()


  svgBoxWidth = 1200
  svgBoxHeight = 128
  svgBoxIdPrefix = "svgTrack"
  progressBarIdPrefix = "progBarTrack"
  @ViewChildren(TrackComponent) childrenTracks: QueryList<TrackComponent>
  @ViewChild('slider') slider

  constructor(private cdr: ChangeDetectorRef,
    private router: Router,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('piano', sanitizer.bypassSecurityTrustResourceUrl('assets/images/piano.svg'))
    iconRegistry.addSvgIcon('metronome', sanitizer.bypassSecurityTrustResourceUrl('assets/images/metronome.svg'))
  }

  ngOnInit() {
    this.reset(false)
    this.setTracks()
    const tempoInMicrosecondsPerBeat = this.song.tempoChanges[0].microsecondsPerQuarterNote
    const tempoInBeatsPerMinute = Math.round(120 * 500000 / tempoInMicrosecondsPerBeat)
    this.tempoBox.setValue(tempoInBeatsPerMinute)
  }
  ngAfterViewInit(): void {
    this.slider.max = this.song.songStats.durationInSeconds
    this.cdr.detectChanges();
  }
  ngOnDestroy(): void {
    this.stop()
  }
  setTracks(): void {
    let typescriptSacamela = new SongSimplification(this.song.songSimplifications[this.songSimplificationVersion])
    this.tracks = typescriptSacamela.voicesWithNotes.sort((a, b) => a - b)
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (propName == "song" || propName == "songSimplificationVersion") this.setTracks()
      if (propName == "playingSong" && this.slider) {
        this.slider.value = this.playingSong ? this.playingSong.elapsedMilliSeconds / 1000 : null
        this.moveProgressBarSubject.next(this.playingSong?.elapsedMilliSeconds / 1000)
     //   this.songSliderPositionChangeSubject.next(this.slider.value)
      }
    }
  }
  changeScale(value: number): void {
    this.scaleChanged.emit(value * this.scale)
  }

  getSongTempoInBeatsPerMinute(song: Song) {
    const tempoInMicrosecondsPerBeat = song.tempoChanges[0].microsecondsPerQuarterNote
    return Math.round(120 * 500000 / tempoInMicrosecondsPerBeat)
  }

  reset(unmuteAlltracks = true) {
    MIDIjs.stop()
    this.scaleChanged.emit(1)
    this.displacementChanged.emit(new Coordenadas(0, 0))
    this.sliderHasBeenMoved = true
    this.songSliderPositionChanged.emit(0)
    if (unmuteAlltracks) this.unmuteAllTracks.emit()
    this.songStoppedPlaying.emit()
    this.resetEventSubject.next(unmuteAlltracks)
    if (this.slider) this.slider.value = 0 // during onInit we do a reset, but the slider doesn't exist yet
    // Reset tempo
    const tempoInBeatsPerMinute = this.getSongTempoInBeatsPerMinute(this.song)
    this.tempoBox.setValue(tempoInBeatsPerMinute)
  }


  play(): void {
    if (this.playingSong && this.playingSong.isPaused && !this.sliderHasBeenMoved) {
      MIDIjs.resume()
      this.songResumed.emit()
    }
    else {
      let mutedTracksParam = this.mutedTracks.length > 0 ? `&mutedTracks=${this.mutedTracks.join(",")}` : ""
      const midiUrl = `https://localhost:9001/api/song/${this.song.id}/midi?simplificationVersion=${this.songSimplificationVersion}&startInSeconds=${this.slider.value}${mutedTracksParam}&tempoInBeatsPerMinute=${this.tempoBox.value}`
      MIDIjs.play(midiUrl)
      MIDIjs.message_callback = this.getPlayingStatus.bind(this)
    }
    // reset this flag
    this.sliderHasBeenMoved = false
  }
  pause(): void {
    MIDIjs.pause()
    this.songPaused.emit()
  }

  stop(): void {
    this.displacementChanged.emit(new Coordenadas(0, 0))
    this.sliderHasBeenMoved = true
    this.songSliderPositionChanged.emit(0)
    MIDIjs.stop()
    this.songStoppedPlaying.emit()
  }
  // This is used for moving the image inside the svg boxes
  displaceChange(value: Coordenadas) {
    this.displacementChanged.emit(new Coordenadas(-value.x * 50 + this.displacement.x, -value.y + this.displacement.y))
  }
  // This is called by midijs when the song starts to play
  getPlayingStatus(mes) {
    if (mes.includes('Playing')) {
      let playingSong = new PlayingSong(this.songId, this.slider.value, this.song.songStats.durationInSeconds, this.tempoBox.value / this.getSongTempoInBeatsPerMinute(this.song))
      this.songStartedPlaying.emit(playingSong)
    }
  };
  sliderMoved(event: MatSliderChange): void {
    this.sliderHasBeenMoved = true
    // when the user moves the slider we want to move the display (specially in music notation) to show that part of the song
    this.songSliderPositionChanged.emit(event.value)
  }
  muteStatusChange(muteChange) {
    this.reset(false)
    this.muteStatusChanged.emit(muteChange)
  }
  closePanel() {
    this.closePage.emit(this.song)
    this.router.navigate(['songs-library'])
  }

  switchViewType(type: SongViewType) {
    this.songViewTypeChanged.emit(type)
  }

  changeSimplification(value) {
    this.songSimplificationChanged.emit(value)
    this.cdr.detectChanges();
  }
  getMuteStatus(trackId: number) {
    if (this.mutedTracks.filter(x => x == trackId).length > 0) return true
    return false
  }
}

