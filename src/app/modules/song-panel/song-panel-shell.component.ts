import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Song } from '../../core/models/song'
import { Store } from '@ngrx/store'
import { filter, mergeMap, first } from 'rxjs/operators'
import { State } from '../../core/state/app.state'
import { getSongById, getSongsUnderAnalysis } from './state'
import { Observable } from 'rxjs'

@Component({
    templateUrl: './song-panel-shell.component.html'
})
export class SongPanelShellComponent implements OnInit {
    songId: number
    song$: Observable<Song>

    constructor(
        private mainStore: Store<State>,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(params => {
            this.songId = +params.get('songId');

            this.song$ = this.mainStore.select(getSongById, { id: this.songId })
        })
    }

}