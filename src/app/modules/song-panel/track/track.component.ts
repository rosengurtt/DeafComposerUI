import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild } from '@angular/core'
import { MatSliderChange } from '@angular/material/slider'
import { Instrument } from 'src/app/core/models/midi/midi-codes/instrument.enum'
import { Song } from 'src/app/core/models/song'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { DrawingService } from '../services/drawing.service'

declare var MIDIjs: any

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
  @Input() xScale: number
  @Input() xDisplacement: number
  @Input() svgBoxWidth: number
  @Input() svgBoxHeight: number
  @Input() sliderMax: number
  @Input() sliderStep: number
  @Input() sliderDefaultValue: number
  @Input() simplification: number
  scaleY = 128
  viewBox: string
  yDisplacement = 0
  svgBox: any
  instrument: string
  @ViewChild('slider') slider

  constructor(private drawingService: DrawingService) {

  }
  ngAfterViewInit(): void {
    const svgBoxId = `${this.svgBoxIdPrefix}_${this.songId}_${this.trackId}`
    const progressBarId = this.progressBarIdPrefix + this.trackId;
    const simplification = 0
    const songIsPlaying = false
    this.drawingService.drawTrackGraphic(this.trackId, svgBoxId, this.song, simplification, songIsPlaying, progressBarId);

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

  moveVertical(event: MatSliderChange): void {
    this.yDisplacement = -(event.value - this.sliderDefaultValue) * (2 / this.xScale)
    this.redrawSvgBox()
  }
  redrawSvgBox(): void {
    const scaleFactorX = this.xScale * this.song.songStats.numberOfTicks
    this.viewBox = `${this.xDisplacement} ${this.yDisplacement} ${scaleFactorX} ${this.scaleY}`
  }
  changeScale(scale: number) {
    this.scaleY *= scale
    this.redrawSvgBox()
  }

  reset() {
    this.yDisplacement = 0
    this.scaleY = 128
    this.redrawSvgBox()
    this.slider.value = 50
  }


}


