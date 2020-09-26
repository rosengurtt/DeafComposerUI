import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SongsLibraryState } from './songs-library.reducer';


export const songsLibraryFeatureKey = 'songs-library'

const getSongsLibraryFeatureState = createFeatureSelector<SongsLibraryState>(songsLibraryFeatureKey);

export const getSongsLibraryState = createSelector(
    getSongsLibraryFeatureState,
    state => state
);