import { ThrowStmt } from '@angular/compiler'
import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, Output, EventEmitter, ComponentFactoryResolver } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { Instrument } from 'src/app/core/models/midi/midi-codes/instrument.enum'
import { Song } from 'src/app/core/models/song'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'
import { DrawingPianoRollService } from '../services/drawing-piano-roll.service'
import { DrawingMusicalNotationTrackService } from '../services/drawing-musical-notation-track.service'
import { DrawingMusicalNotationGlobalService } from '../services/drawing-musical-notation-global.service'
import { PlayingSong } from 'src/app/core/models/playing-song'


@Component({
  selector: 'dc-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss'],
  providers: [
    DrawingPianoRollService,
    DrawingMusicalNotationTrackService
  ]
})
export class TrackComponent implements OnChanges, AfterViewInit {

  @Input() svgBoxIdPrefix: string
  @Input() progressBarIdPrefix: string
  @Input() songId: number
  @Input() trackId: number
  @Input() song: Song
  @Input() viewType: SongViewType
  @Input() scale: number
  @Input() displacement: Coordenadas
  @Input() svgBoxWidth: number
  @Input() svgBoxHeight: number
  @Input() sliderMax: number
  @Input() sliderStep: number
  @Input() sliderDefaultValue: number
  @Input() simplification: number
  @Input() resetEvent: Observable<boolean>
  @Input() moveProgressBarEvent: Observable<number>
  @Input() songSliderPosition: number
  @Input() muteStatus: number
  @Input() playingSong: PlayingSong
  @Output() displaceChange = new EventEmitter<Coordenadas>()
  @Output() muteStatusChange = new EventEmitter<{ songId: number, track: number, status: boolean }>()

  svgBoxId: string
  progressBarId: string
  resetEventSubscritpion: Subscription
  moveProgressBarEventSubscritpion: Subscription
  viewBox: string
  svgBox: any
  instrument: string
  isDragActive = false
  lastXrecorded: number | null
  lastYrecorded: number | null
  muteIcon = "volume_up"
  songViewType: typeof SongViewType = SongViewType
  totalVoices: number
  totalWidthOfRythmDrawing: number
  mustRedrawSvgBox: boolean = false
  averageYofNotes: number = 0

  constructor(private drawingPianoRollService: DrawingPianoRollService,
    private drawingMusicalNotationTrackService: DrawingMusicalNotationTrackService,
    private drawingMusicalNotationGlobalService: DrawingMusicalNotationGlobalService) {

  }
  ngAfterViewInit(): void {
    this.initializePage()
  }


  initializePage() {
    if (this.muteStatus) this.muteIcon = "volume_off"
    else this.muteIcon = "volume_up"
    let typescriptSacamela = new SongSimplification(this.song.songSimplifications[this.simplification])
    let instrumentCode = typescriptSacamela.getInstrumentOfVoice(this.trackId)
    this.instrument = Instrument[instrumentCode]
    this.totalVoices = typescriptSacamela.numberOfVoices

    this.svgBoxId = `${this.svgBoxIdPrefix}_${this.trackId}`
    this.progressBarId = `${this.progressBarIdPrefix}${this.songId}_${this.trackId}`
    this.drawingPianoRollService.drawPianoRollGraphic(this.trackId, this.svgBoxId, this.song, this.simplification);
    this.updateSvgBox()
    this.resetEventSubscritpion = this.resetEvent.subscribe(x => this.reset(x))
    this.moveProgressBarEventSubscritpion = this.moveProgressBarEvent.subscribe(x => this.moveProgressBar(x))
  }



  ngOnChanges(changes: SimpleChanges): void {
    var redrawSvgBox = false

    for (const propName in changes) {

      if (propName == "songId") {
        this.initializePage()
      }
      if (propName == "viewType" || propName == "simplification" || this.mustRedrawSvgBox) {
        if (this.viewType == SongViewType.pianoRoll) {
          this.drawingPianoRollService.drawPianoRollGraphic(this.trackId, this.svgBoxId, this.song, this.simplification)
        }
        else {
          // the variable eventsToDraw is needed by all tracks and is expensive to compute, so we use a singleton service to
          // calculate it
          let eventsToDraw = this.drawingMusicalNotationGlobalService.getEventsToDrawForSong(this.song, this.simplification);

          // if the svg box hasn't been created by the browser yet, we save that fact in the variable mustRedrawSvgBox
          // and the next times onChanges run, if the value is still set and the svg box has become available, it will draw
          [this.totalWidthOfRythmDrawing, this.averageYofNotes] = this.drawingMusicalNotationTrackService.drawMusicNotationGraphic(this.trackId, this.svgBoxId, this.song, this.simplification, eventsToDraw);
          if (this.totalWidthOfRythmDrawing == -1) this.mustRedrawSvgBox = true
          else this.mustRedrawSvgBox = false
        }
        redrawSvgBox = true
      }
      switch (propName) {
        case 'songSliderPosition':
        case 'displacement':
        case 'scale':
        case 'songId':
        case 'viewType':
          var redrawSvgBox = true
      }
    }
    if (redrawSvgBox) {
      this.updateSvgBox()
    }
  }


  updateSvgBox(): void {
    const svgBox = document.getElementById(this.svgBoxId)
    let minX: number; let minY: number; let width: number; let height: number
    if (!svgBox) return
    switch (this.viewType) {
      case SongViewType.pianoRoll:
        minX = (this.songSliderPosition / this.song.songStats.durationInSeconds) * (this.scale * this.song.songStats.numberOfTicks)
        if (this.displacement.y >= 0 && this.displacement.y <= 128 - this.scale * 128)
          minY = this.displacement.y
        else if (this.displacement.y < 0)
          minY = 0
        else
          minY = 128 - this.scale * 128
        width = this.scale * this.song.songStats.numberOfTicks
        height = this.scale * 128

        break;
      case SongViewType.rythmMusicNotation:
        if (this.playingSong && this.displacement)
          minX = this.displacement.x
        else
          minX = this.songSliderPosition / this.song.songStats.durationInSeconds * this.totalWidthOfRythmDrawing
        minY = -30 + this.averageYofNotes / 2
        width = width == null ? 1200 * this.scale * 2.2 : width
        height = height == null ? 128 * this.scale * 2.2 : height
        break;
    }
    this.viewBox = `${minX} ${minY} ${width} ${height}`
  }


  reset(unmuteAllTracks: boolean): void {
    if (unmuteAllTracks) this.muteIcon = "volume_up"
    this.drawingMusicalNotationTrackService.paintAllNotesBlack()
    this.updateSvgBox()
  }
  dragStarted(event): void {
    this.isDragActive = true
    this.lastXrecorded = event.offsetX
    this.lastYrecorded = event.offsetY
  }
  dragFinished(): void {
    this.isDragActive = false
  }

  drag(event): void {
    if (this.isDragActive && this.lastXrecorded) {
      let coor = new Coordenadas(event.offsetX - this.lastXrecorded, event.offsetY - this.lastYrecorded)
      this.displaceChange.emit(coor)
      this.lastXrecorded = event.offsetX
      this.lastYrecorded = event.offsetY
    }
  }
  changeMuteStatus(): void {
    if (this.muteIcon === "volume_up") {
      this.muteIcon = "volume_off"
      this.muteStatusChange.emit({ songId: this.songId, track: this.trackId, status: false })
    }
    else {
      this.muteIcon = "volume_up"
      this.muteStatusChange.emit({ songId: this.songId, track: this.trackId, status: true })
    }
  }

  moveProgressBar(secondsElapsed: number): void {
    console.log(`estoy en track comp y me llego este valor de secondsElapsed: ${secondsElapsed}`)
    let numberOfTicks: number
    let adjustment = 0
    if (secondsElapsed)
      numberOfTicks = ((secondsElapsed - adjustment) * this.song.songStats.numberOfTicks) / this.song.songStats.durationInSeconds
    else
      numberOfTicks = null

    if (this.viewType == SongViewType.pianoRoll) {
      this.drawingPianoRollService.createProgressBar(numberOfTicks)
    }
    else {
      const displacement = this.drawingMusicalNotationTrackService.paintNotesBeingPlayed(numberOfTicks)
      // We don't want to raise a displacement event for each voice, but a single one for each elapsed second
      if (this.trackId > 0) return
      // We don't want to move continuosly the staff, because it would be unpleasant to follow, we want to freeze
      // the staf while the time moves from the notes in the left to the one in the right, and then we move 
      // "one page", so the viewer starts looking again in the left
      // that is why we use tolerance. The value of 2000 was obtained experimenting
      let tolerance = 2000
      if (displacement && displacement > this.displacement.x + tolerance) {
        let coor = new Coordenadas(-(displacement - this.displacement.x - tolerance / 2) / 50, 0)
        this.displaceChange.emit(coor)
      }
    }
  }


}


