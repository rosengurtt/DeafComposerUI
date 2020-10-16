import { createFeatureSelector, createSelector } from '@ngrx/store'
import { MusicStyle } from 'src/app/core/models/music-style'
import { Band } from 'src/app/core/models/band'
import { Song } from 'src/app/core/models/song'
import { MusicStylesPaginated } from 'src/app/core/services/songs-repository/responses-format/music-styles-paginated'
import { BandsPaginated } from 'src/app/core/services/songs-repository/responses-format/bands-paginated'
import { SongsPaginated } from 'src/app/core/services/songs-repository/responses-format/songs-paginated'

// State for this feature (Product)
export interface SongsLibraryState {
    musicStylesPaginated: MusicStylesPaginated
    bandsPaginated: BandsPaginated
    songsPaginated: SongsPaginated   
    styleTerm: string
    bandTerm: string
    songTerm: string
    stylesNewPage: number | null
    bandsNewPage: number | null
    songsNewPage: number | null
    styleSelected: MusicStyle
    bandSelected: Band
    songSelected: Song   
    errorStyles: string
    errorBands: string
    errorSongs: string
}

export const songsLibraryFeatureKey = 'songs-library'

const getSongsLibraryFeatureState = createFeatureSelector<SongsLibraryState>(songsLibraryFeatureKey);

export const getSongsLibraryState = createSelector(
    getSongsLibraryFeatureState,
    state => state
)
export const getStyles = createSelector(
    getSongsLibraryFeatureState,
    state => state.musicStylesPaginated.styles
)
export const getBands = createSelector(
    getSongsLibraryFeatureState,
    state => state.bandsPaginated.bands
)
export const getSongs = createSelector(
    getSongsLibraryFeatureState,
    state => state.songsPaginated.songs
)

export const getStylesCurrentPage = createSelector(
    getSongsLibraryFeatureState,
    state => state.musicStylesPaginated.pageNo
)
export const getBandsCurrentPage = createSelector(
    getSongsLibraryFeatureState,
    state => state.bandsPaginated.pageNo
)
export const getSongsCurrentPage = createSelector(
    getSongsLibraryFeatureState,
    state => state.songsPaginated.pageNo
)

export const getStylesNewPage = createSelector(
    getSongsLibraryFeatureState,
    state => state.stylesNewPage
)
export const getBandsNewPage = createSelector(
    getSongsLibraryFeatureState,
    state => state.bandsNewPage
)
export const getSongsNewPage = createSelector(
    getSongsLibraryFeatureState,
    state => state.songsNewPage
)

export const getTotalStyles = createSelector(
    getSongsLibraryFeatureState,
    state => state.musicStylesPaginated.totalItems
)
export const getTotalBands = createSelector(
    getSongsLibraryFeatureState,
    state => state.bandsPaginated.totalItems
)
export const getTotalSongs = createSelector(
    getSongsLibraryFeatureState,
    state => state.songsPaginated.totalItems
)

export const getStyleSelected = createSelector(
    getSongsLibraryFeatureState,
    state => state.styleSelected
)
export const getBandSelected= createSelector(
    getSongsLibraryFeatureState,
    state => state.bandSelected
)
export const getSongSelected = createSelector(
    getSongsLibraryFeatureState,
    state => state.songSelected
)
export const getErrorStyles = createSelector(
    getSongsLibraryFeatureState,
    state => state.errorStyles
)
export const getErrorBands = createSelector(
    getSongsLibraryFeatureState,
    state => state.errorBands
)
export const getErrorSongs = createSelector(
    getSongsLibraryFeatureState,
    state => state.errorSongs
)