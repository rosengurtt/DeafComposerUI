
/* NgRx */
import { createReducer, on } from '@ngrx/store';
import { SongsLibraryPageActions } from './actions';

// State for this feature (Product)
export interface SongsLibraryState {
    styleTerm: string
    bandTerm: string
    songTerm: string
    stylesPage: number
    bandsPage: number
    songsPage: number
    error: string
}

const initialState: SongsLibraryState = {
    styleTerm: '',
    bandTerm: '',
    songTerm: '',
    stylesPage: 0,
    bandsPage: 0,
    songsPage: 0,
    error: ''
}


export const songsLibraryReducer = createReducer<SongsLibraryState>(
    initialState,
    on(SongsLibraryPageActions.filterStyleTermChange, (state, action): SongsLibraryState => {
        return {
            ...state,
            styleTerm: action.styleTerm
        };
    }),

    on(SongsLibraryPageActions.filterBandTermChange, (state, action): SongsLibraryState => {
        return {
            ...state,
            bandTerm: action.bandTerm
        };
    }),

    on(SongsLibraryPageActions.filterSongTermChange, (state, action): SongsLibraryState => {
        return {
            ...state,
            songTerm: action.songTerm
        };
    }),
);
