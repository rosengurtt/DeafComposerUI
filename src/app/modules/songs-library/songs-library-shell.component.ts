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

    constructor(private store: Store<SongsLibraryState>) { }

    ngOnInit(): void {
        this.stylesDatasource$ = this.store.select(getStyles).pipe(map(styles => new MatTableDataSource<MusicStyle>(styles)))
        this.bandsDatasource$ = this.store.select(getBands).pipe(map(bands => new MatTableDataSource<Band>(bands)))
        this.songsDatasource$ = this.store.select(getSongs).pipe(map(songs => new MatTableDataSource<Song>(songs)))

        this.stylesPageNo$ = this.store.select(getStylesCurrentPage)
        this.bandsPageNo$ = this.store.select(getBandsCurrentPage)
        this.songsPageNo$ = this.store.select(getSongsCurrentPage)

        this.totalStyles$ = this.store.select(getTotalStyles)
        this.totalBands$ = this.store.select(getTotalBands)
        this.totalSongs$ = this.store.select(getTotalSongs)

        this.styleSelected$ = this.store.select(getStyleSelected)
        this.bandSelected$ = this.store.select(getBandSelected)
        this.songSelected$ = this.store.select(getSongSelected)

        this.errorStylesMessage$ = this.store.select(getErrorStyles)
        this.errorBandsMessage$ = this.store.select(getErrorBands)
        this.errorSongsMessage$ = this.store.select(getErrorSongs)

        this.store.dispatch(SongsLibraryPageActions.loadStyles({ pageSize: this.stylesPageSize }));
        this.store.dispatch(SongsLibraryPageActions.loadBands({ pageSize: this.bandsPageSize, styleId: null }));
        this.store.dispatch(SongsLibraryPageActions.loadSongs({ pageSize: this.songsPageSize, styleId: null, bandId: null }));
    }


    stylesPageChanged(page: number): void {
        this.store.dispatch(SongsLibraryPageActions.stylesPageChange({ page: page }))
    }
    bandsPageChanged(page: number): void {
        this.store.dispatch(SongsLibraryPageActions.bandsPageChange({ page: page }))
    }
    songsPageChanged(page: number): void {
        this.store.dispatch(SongsLibraryPageActions.songsPageChange({ page: page }))
    }

    stylesTermChanged(term: string): void {
        this.store.dispatch(SongsLibraryPageActions.filterStyleTermChange({ styleTerm: term }))
    }
    bandsTermChanged(term: string): void {
        this.store.dispatch(SongsLibraryPageActions.filterBandTermChange({ bandTerm: term }))
    }
    songsTermChanged(term: string): void {
        this.store.dispatch(SongsLibraryPageActions.filterSongTermChange({ songTerm: term }))
    }

    styleSelectedChange(style: MusicStyle): void {
        this.store.dispatch(SongsLibraryPageActions.styleSelectedChange({ selectedStyle: style }))
    }
    bandSelectedChange(band: Band): void {
        this.store.dispatch(SongsLibraryPageActions.bandSelectedChange({ selectedBand: band }))
    }
    songSelectedChange(song: Song): void {
        this.store.dispatch(SongsLibraryPageActions.songSelectedChange({ selectedSong: song }))
    }
}