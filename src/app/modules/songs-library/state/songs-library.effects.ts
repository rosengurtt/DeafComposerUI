import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';

import { mergeMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SongsRepositoryService } from '../../../core/services/songs-repository/songs-repository.service';

/* NgRx */
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { SongsLibraryApiActions, SongsLibraryPageActions } from './actions';
import { SongsLibraryState, getSongsLibraryState } from '../state'

@Injectable()
export class SongsLibraryEffects {

  constructor(
    private actions$: Actions,
    private songsRepositoryService: SongsRepositoryService,
    private store$: Store<SongsLibraryState>) { }

  loadStyles$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.loadStyles),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getStyles({ pageNo: state.stylesNewPage, pageSize: action.pageSize }, state.styleTerm)
            .pipe(
              map(data => SongsLibraryApiActions.loadStylesSuccess({ musicStylesPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.loadStylesFailure({ error })))
            )
        )
      )
  })

  loadBands$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.loadBands),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getBands(action.styleId, { pageNo: state.bandsNewPage, pageSize: action.pageSize }, state.bandTerm)
            .pipe(
              map(data => SongsLibraryApiActions.loadBandsSuccess({ bandsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.loadBandsFailure({ error })))
            )
        )
      )
  })
  loadSongs$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.loadSongs),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getSongs(action.styleId, action.bandId, { pageNo: state.songsNewPage, pageSize: action.pageSize }, state.songTerm)
            .pipe(
              map(data => SongsLibraryApiActions.loadSongsSuccess({ songsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.loadSongsFailure({ error })))
            )
        )
      )
  })
  stylesPageChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.stylesPageChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getStyles({ pageNo: action.page, pageSize: state.musicStylesPaginated.pageSize }, state.styleTerm)
            .pipe(
              map(data => SongsLibraryApiActions.loadStylesSuccess({ musicStylesPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.loadStylesFailure({ error })))
            )
        )
      )
  })
  bandsPageChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.bandsPageChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getBands(state.selectedStyle?.id, { pageNo: action.page, pageSize: state.bandsPaginated.pageSize }, state.bandTerm)
            .pipe(
              map(data => SongsLibraryApiActions.loadBandsSuccess({ bandsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.loadBandsFailure({ error })))
            )
        )
      )
  })
  songsPageChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.songsPageChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getSongs(state.selectedStyle?.id, state.selectedBand?.id, { pageNo: action.page, pageSize: state.songsPaginated.pageSize }, state.songTerm)
            .pipe(
              map(data => SongsLibraryApiActions.loadSongsSuccess({ songsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.loadSongsFailure({ error })))
            )
        )
      )
  })


  styleSelected$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.styleSelected),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getBands(action.selectedStyle.id, { pageNo: 0, pageSize: state.bandsPaginated.pageSize }, state.bandTerm)
            .pipe(
              withLatestFrom(this.songsRepositoryService.getSongs(action.selectedStyle.id, null, { pageNo: 0, pageSize: state.songsPaginated.pageSize }, state.songTerm)),
              map(([bands, songs]) =>
                SongsLibraryApiActions.styleSelectedSuccess({ bandsPaginated: bands.result, songsPaginated: songs.result })),
              catchError(error => of(SongsLibraryApiActions.styleSelectedFailure({ error })))
            )
        )
      )
  })


  bandSelected$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.bandSelected),
        tap(e => console.log(e)),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        tap(e => console.log("voy a entrar al mergemap papi")),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getSongs(state.selectedStyle?.id, action.selectedBand.id, { pageNo: 0, pageSize: state.songsPaginated.pageSize }, state.songTerm)
            .pipe(
              tap(e => console.log(action.selectedBand.id)),
              map(data => SongsLibraryApiActions.bandSelectedSuccess({ songsPaginated: data.result })),
              tap(e => console.log(e)),
              catchError(error => of(SongsLibraryApiActions.bandSelectedFailure({ error })))
            )
        )
      )
  })

  filterStyleTermChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.filterStyleTermChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getStyles({ pageNo: 0, pageSize: state.musicStylesPaginated.pageSize }, action.styleTerm)
            .pipe(
              map(data => SongsLibraryApiActions.filterStyleTermChangeSuccess({ musicStylesPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.filterStyleTermChangeFailure({ error })))
            )
        )
      )
  })

  filterBandTermChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.filterBandTermChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getBands(state.selectedStyle?.id, { pageNo: 0, pageSize: state.bandsPaginated.pageSize }, action.bandTerm)
            .pipe(
              map(data => SongsLibraryApiActions.filterBandTermChangeSuccess({ bandsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.filterBandTermChangeFailure({ error })))
            )
        )
      )
  })
  filterSongTermChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.filterSongTermChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getSongs(state.selectedStyle?.id, state.selectedBand?.id, { pageNo: 0, pageSize: state.songsPaginated.pageSize }, action.songTerm)
            .pipe(
              map(data => SongsLibraryApiActions.filterSongTermChangeSuccess({ songsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.filterSongTermChangeFailure({ error })))
            )
        )
      )
  })

}
