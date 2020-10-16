
import { createReducer, on } from '@ngrx/store'
import { SongsLibraryApiActions, SongsLibraryPageActions } from './actions'
import { SongsLibraryState } from './index'
import * as cloneDeep from 'lodash/cloneDeep'


const initialState: SongsLibraryState = {
    musicStylesPaginated: {
        pageNo: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        styles: []
    },
    bandsPaginated: {
        pageNo: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        bands: []
    },
    songsPaginated: {
        pageNo: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        songs: []
    },
    stylesNewPage: null,
    bandsNewPage: null,
    songsNewPage: null,
    styleTerm: '',
    bandTerm: '',
    songTerm: '',
    styleSelected: null,
    bandSelected: null,
    songSelected: null,
    errorStyles: '',
    errorBands: '',
    errorSongs: ''
}


export const songsLibraryReducer = createReducer<SongsLibraryState>(
    initialState,
    on(SongsLibraryPageActions.stylesPaginationChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.stylesNewPage = action.paginationData.pageNo
        return newState
    }),
    on(SongsLibraryPageActions.bandsPaginationChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.bandsNewPage = action.paginationData.pageNo
        return newState
    }),
    on(SongsLibraryPageActions.songsPaginationChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.stongsNewPage = action.paginationData.pageNo
        return newState
    }),

    on(SongsLibraryPageActions.filterStyleTermChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.styleTerm = action.styleTerm
        return newState
    }),

    on(SongsLibraryPageActions.filterBandTermChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.bandTerm = action.bandTerm
        return newState
    }),

    on(SongsLibraryPageActions.filterSongTermChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songTerm = action.songTerm
        return newState
    }),
    on(SongsLibraryPageActions.styleSelectedChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.styleSelected = action.selectedStyle
        return newState
    }),
    on(SongsLibraryPageActions.bandSelectedChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.bandSelected = action.selectedBand
        return newState
    }),

    on(
        SongsLibraryApiActions.stylesPaginationChangeSuccess,
        SongsLibraryApiActions.filterStyleTermChangeSuccess,
        (state, action): SongsLibraryState => {
            let newState = cloneDeep(state)
            newState.errorStyles = null
            newState.musicStylesPaginated = action.musicStylesPaginated
            return newState
        }),
    on(
        SongsLibraryApiActions.bandsPaginationChangeSuccess,
        SongsLibraryApiActions.filterBandTermChangeSuccess,
        (state, action): SongsLibraryState => {
            let newState = cloneDeep(state)
            newState.bandsPaginated = action.bandsPaginated
            newState.errorBands = null
            return newState
        }),
    on(
        SongsLibraryApiActions.songsPaginationChangeSuccess,
        SongsLibraryApiActions.filterSongTermChangeSuccess,
        (state, action): SongsLibraryState => {
            let newState = cloneDeep(state)
            newState.songsPaginated = action.songsPaginated
            newState.errorSongs = null
            return newState
        }),

    on(
        SongsLibraryApiActions.stylesPaginationChangeFailure,
        SongsLibraryApiActions.filterStyleTermChangeFailure,
        (state, action): SongsLibraryState => {
            let newState = cloneDeep(state)
            newState.musicStylesPaginated = {
                pageNo: 0,
                pageSize: 10,
                totalItems: 0,
                totalPages: 0,
                styles: []
            }
            newState.errorStyles = action.error
            return newState
        }),
    on(
        SongsLibraryApiActions.bandsPaginationChangeFailure,
        SongsLibraryApiActions.filterBandTermChangeFailure,
        (state, action): SongsLibraryState => {
            let newState = cloneDeep(state)
            newState.bandsPaginated = {
                pageNo: 0,
                pageSize: 10,
                totalItems: 0,
                totalPages: 0,
                bands: []
            }
            newState.errorBands = action.error
            return newState
        }),
    on(
        SongsLibraryApiActions.songsPaginationChangeFailure,
        SongsLibraryApiActions.filterSongTermChangeFailure,
        (state, action): SongsLibraryState => {
            let newState = cloneDeep(state)
            newState.songsPaginated = {
                pageNo: 0,
                pageSize: 10,
                totalItems: 0,
                totalPages: 0,
                songs: []
            }
            newState.errorSongs = action.error
            return newState
        }),



    on(SongsLibraryApiActions.styleSelectedSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.bandsPaginated = action.bandsPaginated
        newState.songsPaginated = action.songsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.styleSelectedFailure, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songsPaginated = {
            pageNo: 0,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
            songs: []
        }
        newState.bandsPaginated = {
            pageNo: 0,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
            bands: []
        }
        newState.errorBands = action.error
        return newState
    }),

    on(SongsLibraryApiActions.bandSelectedSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songsPaginated = action.songsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.bandSelectedFailure, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songsPaginated = {
            pageNo: 0,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
            songs: []
        }
        newState.errorSongs = action.error
        return newState
    }),

    on(SongsLibraryApiActions.songSelectedSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songSelected = action.song
        return newState
    }),
    on(SongsLibraryApiActions.songSelectedFailure, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songSelected = null
        newState.errorSongs = action.error
        return newState
    }),


)
