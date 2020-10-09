import { createAction, props } from '@ngrx/store'
import { BandsPaginated } from 'src/app/core/services/songs-repository/responses-format/bands-paginated'
import { MusicStylesPaginated } from 'src/app/core/services/songs-repository/responses-format/music-styles-paginated'
import { SongsPaginated } from 'src/app/core/services/songs-repository/responses-format/songs-paginated'

export const loadStylesSuccess = createAction(
    '[SongsLibrary API] Styles Load Success',
    props<{ musicStylesPaginated: MusicStylesPaginated }>()
)

export const loadStylesFailure = createAction(
    '[SongsLibrary API] Styles Load Fail',
    props<{ error: string }>()
)

export const loadBandsSuccess = createAction(
    '[SongsLibrary API] Bands Load Success',
    props<{ bandsPaginated: BandsPaginated }>()
)

export const loadBandsFailure = createAction(
    '[SongsLibrary API] Bands Load Fail',
    props<{ error: string }>()
)

export const loadSongsSuccess = createAction(
    '[SongsLibrary API] Songs Load Success',
    props<{ songsPaginated: SongsPaginated }>()
)

export const loadSongsFailure = createAction(
    '[SongsLibrary API] Songs Load Fail',
    props<{ error: string }>()
)