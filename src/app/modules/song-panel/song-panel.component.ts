import { Component, OnChanges, SimpleChange, OnInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ActivatedRoute, Router } from '@angular/router';
import { Song } from 'src/app/core/models/song';
import { SongsRepositoryService } from 'src/app/core/services/songs-repository/songs-repository.service';

declare var MIDIjs: any;

@Component({
    selector: "song-panel",
    templateUrl: './song-panel.component.html',
    styleUrls: ['./song-panel.component.scss']
})
export class SongPanelComponent implements OnChanges, OnInit {
    songId: number
    song: Song
    sliderMax = 100
    sliderStep = 1
    sliderDefaultValue = 50
    scale = 1
    svgBoxWidth = 1000
    svgBoxHeight = 400
    viewBox: string
    xDisplacement = 0
    yDisplacement = 0


    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private songService: SongsRepositoryService
    ) {

    }
    ngOnInit() {
        this.redrawSvgBox()
        this.activatedRoute.paramMap.subscribe(params => {
            this.songId = +params.get('songId');
            this.songService.getSongById(this.songId).subscribe(data => {
                console.log(data)
            })
        });
    }

    changeScale(event: MatSliderChange): void {
        this.scale = this.sliderDefaultValue / event.value
        this.redrawSvgBox()
    }
    moveHorizontal(event: MatSliderChange): void {
        this.xDisplacement = -(event.value - this.sliderDefaultValue) * (50/ this.scale)
        this.redrawSvgBox()
    }
    moveVertical(event: MatSliderChange): void {
        this.yDisplacement = (event.value - this.sliderDefaultValue) * (50 / this.scale)
        this.redrawSvgBox()
    }
    redrawSvgBox(): void {
        console.log(`scale=${this.scale}`)
        console.log(`xDisplacement=${this.xDisplacement}`)
        console.log(`yDisplacement=${this.yDisplacement}`)
        this.viewBox = `${this.xDisplacement} ${this.yDisplacement} ${this.scale * this.svgBoxWidth} ${this.scale * this.svgBoxHeight}`
    }

    async ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    }

}

