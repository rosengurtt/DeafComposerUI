import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';

import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';
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
}
