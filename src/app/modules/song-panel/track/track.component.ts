import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core'
import { Observable, Subscription } from 'rxjs'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { Instrument } from 'src/app/core/models/midi/midi-codes/instrument.enum'
import { Song } from 'src/app/core/models/song'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'
import { DrawingPianoRollService } from '../services/drawing-piano-roll.service'
import { DrawingRythmService } from '../services/drawing-rythm.service'


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
  @Output() displaceChange = new EventEmitter<Coordenadas>()
  @Output() muteStatusChange = new EventEmitter<{ track: number, status: boolean }>()

  resetEventSubscritpion: Subscription
  moveProgressBarEventSubscritpion: Subscription
  viewBox: string = '0 0 8045 128'
  svgBox: any
  instrument: string
  isDragActive = false
  lastXrecorded: number | null
  lastYrecorded: number | null
  muteIcon = "volume_up"
  songViewType: typeof SongViewType = SongViewType

  constructor(private drawingService: DrawingPianoRollService,
    private drawingRythmService: DrawingRythmService) {

  }
  ngAfterViewInit(): void {
    const svgBoxId = `${this.svgBoxIdPrefix}_${this.songId}_${this.trackId}`
    this.drawingService.drawPianoRollGraphic(this.trackId, svgBoxId, this.song, this.simplification);
    this.updateSvgBox()
    this.resetEventSubscritpion = this.resetEvent.subscribe(x => this.reset(x))
    this.moveProgressBarEventSubscritpion = this.moveProgressBarEvent.subscribe(x => this.moveProgressBar(x))
  }

  ngOnInit() {
    console.log(`estoy en onInit en voice ${this.trackId} y simplification es ${this.simplification}`)
    let typescriptSacamela = new SongSimplification(this.song.songSimplifications[this.simplification])
    let instrumentCode = typescriptSacamela.getInstrumentOfVoice(this.trackId)
    this.instrument = Instrument[instrumentCode]
  }




  ngOnChanges(changes: SimpleChanges): void {
    var redrawSvgBox = false

    for (const propName in changes) {
      if (propName == "viewType") {
        const svgBoxId = `${this.svgBoxIdPrefix}_${this.songId}_${this.trackId}`
        if (this.viewType == SongViewType.pianoRoll) {
          console.log(`estoy en voice ${this.trackId}   y voy a llamar a drawPianoRollGraphic`)
          this.drawingService.drawPianoRollGraphic(this.trackId, svgBoxId, this.song, this.simplification);
        }
        else {
          this.drawingRythmService.drawMusicNotationGraphic(this.trackId, svgBoxId, this.song, this.simplification, 1, 20);
        }
        redrawSvgBox = true
      }
      switch (propName) {
        case 'displacement':
        case 'scale':
        case 'songId':
        case 'viewType':
          var redrawSvgBox = true
      }
    }
    if (redrawSvgBox)
      this.updateSvgBox()
  }


  updateSvgBox(): void {
    const svgBoxId = `${this.svgBoxIdPrefix}_${this.songId}_${this.trackId}`
    const svgBox = document.getElementById(svgBoxId)
    if (!svgBox) return
    let minX: number
    let minY: number
    let width: number
    let height: number
    let style: string
    switch (this.viewType) {
      case SongViewType.pianoRoll:
        minX = this.displacement.x
        minY = this.displacement.y
        width = this.scale * this.song.songStats.numberOfTicks
        height = this.scale * 128
        break;
      case SongViewType.rythmMusicNotation:
        minX = this.displacement.x
        minY = this.displacement.y
        width = 1200 * this.scale * 1.3
        height = 128 * this.scale * 1.3
        break;
    }
    this.viewBox = `${minX} ${minY} ${width} ${height}`
  }


  reset(unmuteAllTracks: boolean): void {
    if (unmuteAllTracks) this.muteIcon = "volume_up"
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
    this.drawingService.createProgressBar(progressBarId, numberOfTicks)
  }


}


