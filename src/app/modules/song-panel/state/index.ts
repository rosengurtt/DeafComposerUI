import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Song } from '../../../core/models/song';

// State for this feature (Product)
export interface SongPanelState {
    songsUnderAnalysis: Song[]
    error: string
}


export const songsPanelFeatureKey = 'songs-panel'

const getSongPanelFeatureState = createFeatureSelector<SongPanelState>(songsPanelFeatureKey);

export const getSongsUnderAnalysis = createSelector(
    getSongPanelFeatureState,
    state => state.songsUnderAnalysis
)