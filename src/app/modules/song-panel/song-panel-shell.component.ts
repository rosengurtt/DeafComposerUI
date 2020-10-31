import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Song } from '../../core/models/song'
import { Store } from '@ngrx/store'
import { State } from '../../core/state/app.state'
import {  getSongUnderAnalysisById, getXdisplacementBySongId, getXscaleBySongId } from './state'
import { Observable } from 'rxjs'
import { SongPanelPageActions } from './state/actions'

@Component({
    templateUrl: './song-panel-shell.component.html'
})
export class SongPanelShellComponent implements OnInit {
    songId: number
    song$: Observable<Song>
    xDisplacement$: Observable<number>
    xScale$: Observable<number>

    constructor(
        private mainStore: Store<State>,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(params => {
            this.songId = +params.get('songId');

            this.song$ = this.mainStore.select(getSongUnderAnalysisById, { id: this.songId })
            this.xDisplacement$ = this.mainStore.select(getXdisplacementBySongId, { id: this.songId })
            this.xScale$ = this.mainStore.select(getXscaleBySongId, { id: this.songId })
           

        })
    }
    xDisplacementChanged(value:number):void{
        this.mainStore.dispatch(SongPanelPageActions.xDisplacementChange({  songId: this.songId, displacement: value }))
    }

    xScaleChanged(value:number):void{
        this.mainStore.dispatch(SongPanelPageActions.xScaleChange({  songId: this.songId, scale: value }))
    }

}