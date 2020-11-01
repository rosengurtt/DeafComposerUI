import { Component, OnChanges, SimpleChange, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild, SimpleChanges } from '@angular/core'
import { Song } from 'src/app/core/models/song'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { TrackComponent } from './track/track.component'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { matExpansionAnimations } from '@angular/material/expansion'
import { PlayingSong } from 'src/app/core/models/playing-song'

declare var MIDIjs: any

@Component({
  selector: "dc-song-panel",
  templateUrl: './song-panel.component.html',
  styleUrls: ['./song-panel.component.scss']
})
export class SongPanelComponent implements OnInit, OnChanges {
  @Input() songId: number
  @Input() song: Song
  @Input() displacement: Coordenadas
  @Input() scale
  @Input() playingSong: PlayingSong



  @Output() displacementChanged = new EventEmitter<Coordenadas>()
  @Output() scaleChanged = new EventEmitter<number>()
  @Output() songStartedPlaying = new EventEmitter<PlayingSong>()
  @Output() songStoppedPlaying = new EventEmitter()
  @Output() songPaused = new EventEmitter()
  @Output() songResumed = new EventEmitter()

  tracks: number[]
  sliderMax: number
  sliderStep = 1

  svgBoxWidth = 1200
  svgBoxHeight = 200
  simplification = 0
  svgBoxIdPrefix = "svgTrack"
  progressBarIdPrefix = "progBarTrack"
  @ViewChildren(TrackComponent) childrenTracks: QueryList<TrackComponent>
  @ViewChild('slider') slider

  ngOnInit() {
    this.setTracks()
    this.sliderMax = this.song.songStats.durationInSeconds
  }

  setTracks(): void {
    let typescriptSacamela = new SongSimplification(this.song.songSimplifications[0])
    this.tracks = typescriptSacamela.voicesWithNotes
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (propName == "song") this.setTracks()
      if (propName == "playingSong" && this.slider) this.slider.value = this.playingSong?.elapsedSeconds
    }
  }
  changeScale(value: number): void {
    this.scaleChanged.emit(value * this.scale)
  }


  reset() {
    this.scaleChanged.emit(1)
    this.displacementChanged.emit(new Coordenadas(0, 0))
    this.slider.value = 0
  }

  play(): void {
    if (this.playingSong && this.playingSong.isPaused) {
      MIDIjs.resume()
      this.songResumed.emit()
    }
    else {
      MIDIjs.play(`https://localhost:9001/api/song/${this.song.id}/midi`)
      MIDIjs.message_callback = this.getPlayingStatus.bind(this)
    }
  }
  pause(): void {
    MIDIjs.pause()
    this.songPaused.emit()
  }

  stop(): void {
    MIDIjs.stop()
    this.songStoppedPlaying.emit()
  }
  displaceChange(value: Coordenadas) {
    this.displacementChanged.emit(new Coordenadas(-value.x * 50 + this.displacement.x, -value.y + this.displacement.y))
  }
  // This is called by midijs when the song starts to play
  getPlayingStatus(mes) {
    if (mes.includes('Playing')) {
      let playingSong = new PlayingSong(this.songId, 0, this.song.songStats.durationInSeconds)
      this.songStartedPlaying.emit(playingSong)
    }
  };

}

