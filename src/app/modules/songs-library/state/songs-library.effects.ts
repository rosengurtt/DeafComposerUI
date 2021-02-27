import { Store } from '@ngrx/store'
import { Injectable } from '@angular/core'
import { mergeMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators'
import { of } from 'rxjs'
import { SongsRepositoryService } from '../../../core/services/songs-repository/songs-repository.service'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { SongsLibraryApiActions, SongsLibraryPageActions } from './actions'
import { SongsLibraryState, getSongsLibraryState } from '../state'

@Injectable()
export class SongsLibraryEffects {

  constructor(
    private actions$: Actions,
    private songsRepositoryService: SongsRepositoryService,
    private store$: Store<SongsLibraryState>) { }

  stylesPaginationChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.stylesPaginationChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getStyles({ pageNo: action.paginationData.pageNo, pageSize: action.paginationData.pageSize }, state.styleTerm)
            .pipe(
              map(data => SongsLibraryApiActions.stylesPaginationChangeSuccess({ musicStylesPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.stylesPaginationChangeFailure({ error })))
            )
        )
      )
  })
  bandsPaginationChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.bandsPaginationChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getBands(state.styleSelected?.id, { pageNo: action.paginationData.pageNo, pageSize: action.paginationData.pageSize }, state.bandTerm)
            .pipe(
              map(data => SongsLibraryApiActions.bandsPaginationChangeSuccess({ bandsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.bandsPaginationChangeFailure({ error })))
            )
        )
      )
  })
  songsPaginationChange$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.songsPaginationChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getSongs(state.styleSelected?.id, state.bandSelected?.id, { pageNo: action.paginationData.pageNo, pageSize: action.paginationData.pageSize }, state.songTerm)
            .pipe(
              map(data => SongsLibraryApiActions.songsPaginationChangeSuccess({ songsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.songSelectedFailure({ error })))
            )
        )
      )
  })


  styleSelected$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.styleSelectedChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getBands(action.selectedStyle.id, { pageNo: 0, pageSize: state.bandsPaginated.pageSize }, state.bandTerm)
            .pipe(
              withLatestFrom(this.songsRepositoryService.getSongs(action.selectedStyle.id, null, { pageNo: 0, pageSize: state.songsPaginated.pageSize }, state.songTerm)),
              map(([bands, songs]) =>
                SongsLibraryApiActions.styleSelectedSuccess({ bandsPaginated: bands.result, songsPaginated: songs.result }))
                ,
              catchError(error => of(SongsLibraryApiActions.styleSelectedFailure({ error })))
            )
        )
      )
  })


  bandSelected$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.bandSelectedChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getSongs(state.styleSelected?.id, action.selectedBand.id, { pageNo: 0, pageSize: state.songsPaginated.pageSize }, state.songTerm)
            .pipe(
              map(data => SongsLibraryApiActions.bandSelectedSuccess({ songsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.bandSelectedFailure({ error })))
            )
        )
      )
  })

  songSelected$ = createEffect(() => {
    return this.actions$
      .pipe(
        ofType(SongsLibraryPageActions.songSelectedChange),
        withLatestFrom(this.store$.select(getSongsLibraryState)),
        mergeMap(([action, state]) =>
          this.songsRepositoryService.getSongById(action.selectedSong.id)
            .pipe(
              map(data => SongsLibraryApiActions.songSelectedSuccess({ song: data.result })),
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
          this.songsRepositoryService.getBands(state.styleSelected?.id, { pageNo: 0, pageSize: state.bandsPaginated.pageSize }, action.bandTerm)
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
          this.songsRepositoryService.getSongs(state.styleSelected?.id, state.bandSelected?.id, { pageNo: 0, pageSize: state.songsPaginated.pageSize }, action.songTerm)
            .pipe(
              map(data => SongsLibraryApiActions.filterSongTermChangeSuccess({ songsPaginated: data.result })),
              catchError(error => of(SongsLibraryApiActions.filterSongTermChangeFailure({ error })))
            )
        )
      )
  })

}
