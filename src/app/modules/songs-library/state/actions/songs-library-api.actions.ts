import { createAction, props } from '@ngrx/store'
import { Song } from 'src/app/core/models/song'
import { BandsPaginated } from 'src/app/core/services/songs-repository/responses-format/bands-paginated'
import { MusicStylesPaginated } from 'src/app/core/services/songs-repository/responses-format/music-styles-paginated'
import { SongsPaginated } from 'src/app/core/services/songs-repository/responses-format/songs-paginated'


export const stylesPaginationChangeSuccess = createAction(
    '[SongsLibrary API] Styles Page Change Success',
    props<{ musicStylesPaginated: MusicStylesPaginated }>()
)

export const stylesPaginationChangeFailure = createAction(
    '[SongsLibrary API] Styles Page Change Fail',
    props<{ error: string }>()
)

export const bandsPaginationChangeSuccess = createAction(
    '[SongsLibrary API] Bands Page Change Success',
    props<{ bandsPaginated: BandsPaginated }>()
)

export const bandsPaginationChangeFailure = createAction(
    '[SongsLibrary API] Bands Page Change Fail',
    props<{ error: string }>()
)

export const songsPaginationChangeSuccess = createAction(
    '[SongsLibrary API] Songs Page Change Success',
    props<{ songsPaginated: SongsPaginated }>()
)

export const songsPaginationChangeFailure = createAction(
    '[SongsLibrary API] Songs Page Change Fail',
    props<{ error: string }>()
)

export const styleSelectedSuccess = createAction(
    '[SongsLibrary API] Style Selected Success',
    props<{ bandsPaginated: BandsPaginated, songsPaginated: SongsPaginated }>()
)

export const styleSelectedFailure = createAction(
    '[SongsLibrary API] Style Selected Fail',
    props<{ error: string }>()
)

export const bandSelectedSuccess = createAction(
    '[SongsLibrary API] Band Selected Success',
    props<{ songsPaginated: SongsPaginated }>()
)

export const bandSelectedFailure = createAction(
    '[SongsLibrary API] Band Selected Fail',
    props<{ error: string }>()
)

export const songSelectedSuccess = createAction(
    '[SongsLibrary API] Song Selected Success',
    props<{ song: Song }>()
)

export const songSelectedFailure = createAction(
    '[SongsLibrary API] Song Selected Fail',
    props<{ error: string }>()
)

export const filterStyleTermChangeSuccess = createAction(
    '[SongsLibrary API] Filter Styles Term Change Success',
    props<{ musicStylesPaginated: MusicStylesPaginated }>()
)

export const filterStyleTermChangeFailure = createAction(
    '[SongsLibrary API] Filter Styles Term Change Fail',
    props<{ error: string }>()
)

export const filterBandTermChangeSuccess = createAction(
    '[SongsLibrary API] Filter Bands Term Change Success',
    props<{ bandsPaginated: BandsPaginated }>()
)

export const filterBandTermChangeFailure = createAction(
    '[SongsLibrary API] Filter Bands Term Change Fail',
    props<{ error: string }>()
)

export const filterSongTermChangeSuccess = createAction(
    '[SongsLibrary API] Filter Songs Term Change Success',
    props<{ songsPaginated: SongsPaginated }>()
)

export const filterSongTermChangeFailure = createAction(
    '[SongsLibrary API] Filter Songs Term Change Fail',
    props<{ error: string }>()
)
