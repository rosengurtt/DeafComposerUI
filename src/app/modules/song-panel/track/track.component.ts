import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core'
import { MatSliderChange } from '@angular/material/slider'
import { Song } from 'src/app/core/models/song'

declare var MIDIjs: any

@Component({
  selector: 'dc-track',
  templateUrl: './track.component.html',
  styleUrls: ['./track.component.scss']
})
export class TrackComponent implements OnInit, OnChanges {

  @Input() songId: number
  @Input() trackId: number
  @Input() song: Song
  @Input() scale: number
  @Input() xDisplacement: number
  @Input() svgBoxWidth: number
  @Input() svgBoxHeight: number
  @Input() sliderMax: number
  @Input() sliderStep: number
  @Input() sliderDefaultValue: number
  @Input() simplification: number
  viewBox: string
  yDisplacement = 0



  ngOnInit() {
    this.redrawSvgBox()
    console.log(this.song)
    console.log(this.songId)
    console.log(this.trackId)

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.redrawSvgBox()
  }

  moveVertical(event: MatSliderChange): void {
    this.yDisplacement = (event.value - this.sliderDefaultValue) * (10 / this.scale)
    this.redrawSvgBox()
  }
  redrawSvgBox(): void {
    this.viewBox = `${this.xDisplacement} ${this.yDisplacement} ${this.scale * this.svgBoxWidth} ${this.scale * this.svgBoxHeight}`
  }



}


