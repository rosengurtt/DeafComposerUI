import { Component, OnChanges, SimpleChange, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList, ViewChild, SimpleChanges } from '@angular/core'
import { MatSliderChange } from '@angular/material/slider'
import { Song } from 'src/app/core/models/song'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { TrackComponent } from './track/track.component'

declare var MIDIjs: any

@Component({
  selector: "dc-song-panel",
  templateUrl: './song-panel.component.html',
  styleUrls: ['./song-panel.component.scss']
})
export class SongPanelComponent implements OnInit, OnChanges {
  @Input() songId: number
  @Input() song: Song
  @Input() xDisplacement: number
  @Input() xScale

  @Output() xDisplacementChanged = new EventEmitter<number>()
  @Output() xScaleChanged = new EventEmitter<number>()

  tracks: number[]
  sliderMax = 100
  sliderStep = 1
  sliderDefaultValue = 50

  svgBoxWidth = 1200
  svgBoxHeight = 200
  simplification = 0
  svgBoxIdPrefix = "svgTrack"
  progressBarIdPrefix = "progBarTrack"
  @ViewChildren(TrackComponent) childrenTracks: QueryList<TrackComponent>
  @ViewChild('slider') slider

  ngOnInit() {
    this.setTracks()
  }

  setTracks():void{
    let typescriptSacamela = new SongSimplification(this.song.songSimplifications[0])
    this.tracks = typescriptSacamela.voicesWithNotes
  }

  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (propName == "song")  this.setTracks()
    }
  }
  changeScale(value: number): void {
    this.xScaleChanged.emit(value * this.xScale)
  }
  moveHorizontal(event: MatSliderChange): void {

  }

  reset() {
    this.xScaleChanged.emit(1)
    this.xDisplacementChanged.emit(0)
    this.slider.value = 50
  }

  play(): void {
    MIDIjs.play(`https://localhost:9001/api/song/${this.song.id}/midi`)
  }

  stop(): void {
    MIDIjs.stop()
  }

}

