import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { Instrument } from 'src/app/core/models/midi/midi-codes/instrument.enum'
import { Song } from 'src/app/core/models/song'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { DrawingService } from '../services/drawing.service'


@Component({
  selector: 'dc-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() svgBoxIdPrefix: string
  @Input() progressBarIdPrefix: string
  @Input() songId: number
  @Input() trackId: number
  @Input() song: Song
  @Input() scale: number
  @Input() displacement: Coordenadas
  @Input() svgBoxWidth: number
  @Input() svgBoxHeight: number
  @Input() sliderMax: number
  @Input() sliderStep: number
  @Input() sliderDefaultValue: number
  @Input() simplification: number
  @Input() resetEvent: Observable<void>
  @Input() moveProgressBarEvent: Observable<number>
  @Output() displaceChange = new EventEmitter<Coordenadas>()
  @Output() muteStatusChange = new EventEmitter<{ track: number, status: boolean }>()

  resetEventSubscritpion: Subscription
  moveProgressBarEventSubscritpion: Subscription
  viewBox: string
  svgBox: any
  instrument: string
  isDragActive = false
  lastXrecorded: number | null
  lastYrecorded: number | null
  muteIcon = "volume_up"

  constructor(private drawingService: DrawingService) {

  }
  ngAfterViewInit(): void {
    const svgBoxId = `${this.svgBoxIdPrefix}_${this.songId}_${this.trackId}`
    const progressBarId = `${this.progressBarIdPrefix}${this.songId}_${this.trackId}`
    const simplification = 0
    const songIsPlaying = false
    this.drawingService.drawTrackGraphic(this.trackId, svgBoxId, this.song, simplification, songIsPlaying, progressBarId);
    this.resetEventSubscritpion = this.resetEvent.subscribe(() => this.reset())
    this.moveProgressBarEventSubscritpion = this.moveProgressBarEvent.subscribe(x => this.moveProgressBar(x))
  }

  ngOnInit() {
    this.redrawSvgBox()
    let typescriptSacamela = new SongSimplification(this.song.songSimplifications[0])
    let instrumentCode = typescriptSacamela.getInstrumentOfVoice(this.trackId)
    this.instrument = Instrument[instrumentCode]
  }




  ngOnChanges(changes: SimpleChanges): void {
    this.redrawSvgBox()
  }


  redrawSvgBox(): void {
    const scaleFactorX = this.scale * this.song.songStats.numberOfTicks
    const scaleFactorY = this.scale * 128
    this.viewBox = `${this.displacement.x} ${this.displacement.y} ${scaleFactorX} ${scaleFactorY}`
  }


  reset(): void {
    this.muteIcon = "volume_up"
    this.redrawSvgBox()
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
      this.muteStatusChange.emit({ track: this.trackId, status: false })
    }
    else {
      this.muteIcon = "volume_up"
      this.muteStatusChange.emit({ track: this.trackId, status: true })
    }
  }

  moveProgressBar(secondsElapsed: number): void {
    const svgBoxId = `${this.svgBoxIdPrefix}_${this.songId}_${this.trackId}`
    let numberOfTicks: number
    if (secondsElapsed)
      numberOfTicks = (secondsElapsed * this.song.songStats.numberOfTicks) / this.song.songStats.durationInSeconds
    else
      numberOfTicks = null
    const progressBarId = `${this.progressBarIdPrefix}${this.songId}_${this.trackId}`
    console.log("estoy en el track y llamo a drawing")
    console.log(`${svgBoxId}, ${progressBarId}, ${numberOfTicks}`)
    this.drawingService.createProgressBar(svgBoxId, progressBarId, numberOfTicks)
  }
}


