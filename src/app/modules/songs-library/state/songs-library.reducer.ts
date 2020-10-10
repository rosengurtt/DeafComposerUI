
/* NgRx */
import { createReducer, on } from '@ngrx/store';
import { SongsLibraryApiActions, SongsLibraryPageActions } from './actions';
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
    selectedStyle: null,
    selectedBand: null,
    selectedSong: null,
    errorStyles: '',
    errorBands: '',
    errorSongs: ''
}


export const songsLibraryReducer = createReducer<SongsLibraryState>(
    initialState,
    on(SongsLibraryPageActions.stylesPageChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.stylesNewPage = action.page
        return newState
    }),
    on(SongsLibraryPageActions.bandsPageChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.bandsNewPage = action.page
        return newState
    }),
    on(SongsLibraryPageActions.songsPageChange, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.stongsNewPage = action.page
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
    on(SongsLibraryPageActions.styleSelected, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.selectedStyle = action.selectedStyle
        return newState
    }),
    on(SongsLibraryPageActions.bandSelected, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.selectedBand = action.selectedBand
        return newState
    }),
    on(SongsLibraryPageActions.songSelected, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.selectedSong = action.selectedSong
        return newState
    }),
    on(SongsLibraryApiActions.loadStylesSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.musicStylesPaginated = action.musicStylesPaginated
        return newState
    }),
    on(SongsLibraryApiActions.loadBandsSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.bandsPaginated = action.bandsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.loadSongsSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songsPaginated = action.songsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.loadStylesFailure, (state, action): SongsLibraryState => {
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
    on(SongsLibraryApiActions.loadBandsFailure, (state, action): SongsLibraryState => {
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
    on(SongsLibraryApiActions.loadSongsFailure, (state, action): SongsLibraryState => {
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

    on(SongsLibraryApiActions.stylesPageChangeSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.musicStylesPaginated = action.musicStylesPaginated
        return newState
    }),
    on(SongsLibraryApiActions.bandsPageChangeSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        console.log("estas son las bandas paginated")
        console.log(action.bandsPaginated)
        newState.bandsPaginated = action.bandsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.songsPageChangeSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songsPaginated = action.songsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.stylessPageChangeFailure, (state, action): SongsLibraryState => {
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
    on(SongsLibraryApiActions.bandsPageChangeFailure, (state, action): SongsLibraryState => {
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
    on(SongsLibraryApiActions.songsPageChangeFailure, (state, action): SongsLibraryState => {
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
        newState.songsPaginated=action.songsPaginated
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
        newState.songsPaginated=action.songsPaginated
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


    on(SongsLibraryApiActions.filterStyleTermChangeSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.musicStylesPaginated = action.musicStylesPaginated
        return newState
    }),
    on(SongsLibraryApiActions.filterBandTermChangeSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.bandsPaginated = action.bandsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.filterSongTermChangeSuccess, (state, action): SongsLibraryState => {
        let newState = cloneDeep(state)
        newState.songsPaginated = action.songsPaginated
        return newState
    }),
    on(SongsLibraryApiActions.filterStyleTermChangeFailure, (state, action): SongsLibraryState => {
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
    on(SongsLibraryApiActions.filterBandTermChangeFailure, (state, action): SongsLibraryState => {
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
    on(SongsLibraryApiActions.filterSongTermChangeFailure, (state, action): SongsLibraryState => {
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
);
