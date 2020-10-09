
/* NgRx */
import { createReducer, on } from '@ngrx/store';
import { SongPanelPageActions } from './actions';
import { SongPanelState } from './index'


const initialState: SongPanelState = {
    songsUnderAnalysis: [],
    error: ''
}


export const songPanelReducer = createReducer<SongPanelState>(
    initialState,
    on(SongPanelPageActions.addSong, (state, action): SongPanelState => {
        return {
            ...state,
            songsUnderAnalysis: [...state.songsUnderAnalysis, action.song]
        };
    }),
    on(SongPanelPageActions.removeSong, (state, action): SongPanelState => {
        return {
            ...state,
            songsUnderAnalysis: state.songsUnderAnalysis.filter(song => song.id !== action.song.id),
        };
    })
);
