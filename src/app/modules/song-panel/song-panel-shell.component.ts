import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { Song } from '../../core/models/song'
import { Store } from '@ngrx/store'
import { State } from '../../core/state/app.state'
import { getDisplacementBySongId, getPlayingSong, getScaleBySongId, getSongUnderAnalysisById } from './state'
import { Observable, Subscription, timer } from 'rxjs'
import { SongPanelPageActions } from './state/actions'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { PlayingSong } from 'src/app/core/models/playing-song'

@Component({
    templateUrl: './song-panel-shell.component.html'
})
export class SongPanelShellComponent implements OnInit {
    songId: number
    song$: Observable<Song>
    displacement$: Observable<Coordenadas>
    scale$: Observable<number>
    songTimer$: Observable<number>
    playingSong$: Observable<PlayingSong>
    timerSubscription: Subscription

    constructor(
        private mainStore: Store<State>,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.activatedRoute.paramMap.subscribe(params => {
            this.songId = +params.get('songId');

            this.song$ = this.mainStore.select(getSongUnderAnalysisById, { id: this.songId })
            this.displacement$ = this.mainStore.select(getDisplacementBySongId, { id: this.songId })
            this.scale$ = this.mainStore.select(getScaleBySongId, { id: this.songId })
            this.playingSong$ = this.mainStore.select(getPlayingSong)
        })
    }
    displacementChanged(value: Coordenadas): void {
        this.mainStore.dispatch(SongPanelPageActions.displacementChange({ songId: this.songId, displacement: value }))
    }

    scaleChanged(value: number): void {
        this.mainStore.dispatch(SongPanelPageActions.scaleChange({ songId: this.songId, scale: value }))
    }

    songStartedPlaying(songStarted: PlayingSong) {
        this.mainStore.dispatch(SongPanelPageActions.startPlayingSong({ playingSong: songStarted }))
        this.songTimer$ = timer(0, 1000)
        this.timerSubscription = this.songTimer$.subscribe(x => { this.mainStore.dispatch(SongPanelPageActions.elapsedSecondPlayingSong()) })
    }
    songStoppedPlaying() {
        this.mainStore.dispatch(SongPanelPageActions.stopPlayingSong())
        this.timerSubscription.unsubscribe()
    }
    songPaused(){
        this.mainStore.dispatch(SongPanelPageActions.pausePlayingSong())
        this.timerSubscription.unsubscribe()
    }
    songResumed(){
        this.mainStore.dispatch(SongPanelPageActions.resumePlayingSong())
        this.timerSubscription = this.songTimer$.subscribe(x => { this.mainStore.dispatch(SongPanelPageActions.elapsedSecondPlayingSong()) })
    }

}