import { Component, OnChanges, SimpleChange, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { MatSliderChange } from '@angular/material/slider'
import { Song } from 'src/app/core/models/song'

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
    scale = 1
    xDisplacement = 0
    svgBoxWidth = 1200
    svgBoxHeight = 200
    simplification = 0


    ngOnInit() {
        this.tracks = Array(this.song.songSimplifications[0].numberOfVoices).fill(0).map((x, i) => i)

    }

    changeScale(value: number): void {
        this.scale = this.scale * value
      }
      moveHorizontal(event: MatSliderChange): void {
        this.xDisplacement = -(event.value - this.sliderDefaultValue) * (50 / this.scale)
      }
}

