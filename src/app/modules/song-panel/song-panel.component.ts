import { Component, OnChanges, SimpleChange, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild } from '@angular/core'
import { MatSliderChange } from '@angular/material/slider'
import { Song } from 'src/app/core/models/song'
import { TrackComponent } from './track/track.component'

declare var MIDIjs: any

@Component({
  selector: "dc-song-panel",
  templateUrl: './song-panel.component.html',
  styleUrls: ['./song-panel.component.scss']
})
export class SongPanelComponent implements OnInit {
  @Input() songId: number
  @Input() song: Song
  tracks: number[]
  sliderMax = 100
  sliderStep = 1
  sliderDefaultValue = 50
  scaleX = 1
  xDisplacement = 0
  svgBoxWidth = 1200
  svgBoxHeight = 200
  simplification = 0
  svgBoxIdPrefix = "svgTrack"
  progressBarIdPrefix = "progBarTrack"
  @ViewChildren(TrackComponent) childrenTracks: QueryList<TrackComponent>
  @ViewChild('slider') slider

  ngOnInit() {
    this.tracks = Array(this.song.songSimplifications[0].numberOfVoices).fill(0).map((x, i) => i + 1)

  }

  changeScale(value: number): void {
    this.scaleX = this.scaleX * value
  }
  moveHorizontal(event: MatSliderChange): void {
    this.xDisplacement = (event.value - this.sliderDefaultValue) * (80 / this.scaleX)
  }

  reset() {
    this.scaleX = 1
    this.xDisplacement = 0
    this.childrenTracks.forEach(x => x.reset())
    this.slider.value = 50
  }
}

