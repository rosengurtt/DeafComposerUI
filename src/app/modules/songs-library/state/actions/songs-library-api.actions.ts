import { createAction, props } from '@ngrx/store'
import { Band } from 'src/app/core/models/band'
import { Song } from 'src/app/core/models/song'
import { MusicStyle } from '../../../../core/models/music-style'

export const loadStylesSuccess = createAction(
    '[SongsLibrary API] Styles Load Success',
    props<{ styles: MusicStyle[] }>()
)

export const loadStylesFailure = createAction(
    '[SongsLibrary API] Styles Load Fail',
    props<{ error: string }>()
)

export const loadBandsSuccess = createAction(
    '[SongsLibrary API] Bands Load Success',
    props<{ bands: Band[] }>()
)

export const loadBandsFailure = createAction(
    '[SongsLibrary API] Bands Load Fail',
    props<{ error: string }>()
)

export const loadSongsSuccess = createAction(
    '[SongsLibrary API] Songs Load Success',
    props<{ songs: Song[] }>()
)

export const loadSongsFailure = createAction(
    '[SongsLibrary API] Songs Load Fail',
    props<{ error: string }>()
)