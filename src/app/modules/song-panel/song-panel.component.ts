import { Component, OnChanges, SimpleChange, OnInit } from '@angular/core';
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

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private songService: SongsRepositoryService
    ) {

    }
    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(params => {
            this.songId = +params.get('songId');
            this.songService.getSongById(this.songId).subscribe(data => {
                console.log(data)
            })
        });
    }



    async ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

    }

}

