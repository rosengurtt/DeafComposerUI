import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

/* NgRx */
import { Store } from '@ngrx/store';
import {
    getBands,
    getStyles,
    getSongs,
    SongsLibraryState,
    getErrorStyles,
    getErrorBands,
    getSongsCurrentPage,
    getBandsCurrentPage,
    getErrorSongs,
    getStylesCurrentPage,
    getTotalStyles,
    getTotalBands,
    getTotalSongs,
    getStyleSelected,
    getBandSelected,
    getSongSelected
} from './state';

import { MatTableDataSource } from '@angular/material/table';
import { MusicStyle } from '../../core/models/music-style';
import { Band } from '../../core/models/band';
import { Song } from '../../core/models/song';
import { SongsLibraryPageActions } from './state/actions';
import { map } from 'rxjs/operators';

import { State } from '../../core/state/app.state'
import { SongPanelPageActions } from '../song-panel/state/actions'

@Component({
    templateUrl: './songs-library-shell.component.html'
})
export class SongsLibraryShellComponent implements OnInit {

    stylesDatasource$: Observable<MatTableDataSource<MusicStyle>>
    bandsDatasource$: Observable<MatTableDataSource<Band>>
    songsDatasource$: Observable<MatTableDataSource<Song>>

    styleSelected$: Observable<MusicStyle>
    bandSelected$: Observable<Band>
    songSelected$: Observable<Song>

    stylesPageNo$: Observable<number>
    bandsPageNo$: Observable<number>
    songsPageNo$: Observable<number>

    totalStyles$: Observable<number>
    totalBands$: Observable<number>
    totalSongs$: Observable<number>

    stylesPageSize = 10
    bandsPageSize = 10
    songsPageSize = 11

    errorStylesMessage$: Observable<string>;
    errorBandsMessage$: Observable<string>;
    errorSongsMessage$: Observable<string>;

    constructor(
        private songsLibStore: Store<SongsLibraryState>,
        private mainStore: Store<State>) { }

    ngOnInit(): void {
        this.stylesDatasource$ = this.songsLibStore.select(getStyles).pipe(map(styles => new MatTableDataSource<MusicStyle>(styles)))
        this.bandsDatasource$ = this.songsLibStore.select(getBands).pipe(map(bands => new MatTableDataSource<Band>(bands)))
        this.songsDatasource$ = this.songsLibStore.select(getSongs).pipe(map(songs => new MatTableDataSource<Song>(songs)))

        this.stylesPageNo$ = this.songsLibStore.select(getStylesCurrentPage)
        this.bandsPageNo$ = this.songsLibStore.select(getBandsCurrentPage)
        this.songsPageNo$ = this.songsLibStore.select(getSongsCurrentPage)

        this.totalStyles$ = this.songsLibStore.select(getTotalStyles)
        this.totalBands$ = this.songsLibStore.select(getTotalBands)
        this.totalSongs$ = this.songsLibStore.select(getTotalSongs)

        this.styleSelected$ = this.songsLibStore.select(getStyleSelected)
        this.bandSelected$ = this.songsLibStore.select(getBandSelected)
        this.songSelected$ = this.songsLibStore.select(getSongSelected)

        this.errorStylesMessage$ = this.songsLibStore.select(getErrorStyles)
        this.errorBandsMessage$ = this.songsLibStore.select(getErrorBands)
        this.errorSongsMessage$ = this.songsLibStore.select(getErrorSongs)

        this.songsLibStore.dispatch(SongsLibraryPageActions.loadStyles({ pageSize: this.stylesPageSize }));
        this.songsLibStore.dispatch(SongsLibraryPageActions.loadBands({ pageSize: this.bandsPageSize, styleId: null }));
        this.songsLibStore.dispatch(SongsLibraryPageActions.loadSongs({ pageSize: this.songsPageSize, styleId: null, bandId: null }));
    }


    stylesPageChanged(page: number): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.stylesPageChange({ page: page }))
    }
    bandsPageChanged(page: number): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.bandsPageChange({ page: page }))
    }
    songsPageChanged(page: number): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.songsPageChange({ page: page }))
    }

    stylesTermChanged(term: string): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.filterStyleTermChange({ styleTerm: term }))
    }
    bandsTermChanged(term: string): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.filterBandTermChange({ bandTerm: term }))
    }
    songsTermChanged(term: string): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.filterSongTermChange({ songTerm: term }))
    }

    styleSelectedChange(style: MusicStyle): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.styleSelectedChange({ selectedStyle: style }))
    }
    bandSelectedChange(band: Band): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.bandSelectedChange({ selectedBand: band }))
    }
    songSelectedChange(song: Song): void {
        this.songsLibStore.dispatch(SongsLibraryPageActions.songSelectedChange({ selectedSong: song }))
    }
    analizeSong(song: Song): void {
        this.mainStore.dispatch(SongPanelPageActions.addSong({ song: song }))
    }
}