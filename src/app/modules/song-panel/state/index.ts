
import { createFeatureSelector, createSelector } from '@ngrx/store'
import { Song } from 'src/app/core/models/song'
import { StringifiedMap } from 'src/app/core/utilities/stringified-map'

// State for this feature (Product)
export interface SongPanelState {
    songsUnderAnalysis: Song[]
    xDisplacement: string
    xScale: string
    error: string
}


export const songsPanelFeatureKey = 'songs-panel'

const getSongPanelFeatureState = createFeatureSelector<SongPanelState>(songsPanelFeatureKey);

export const getSongsUnderAnalysis = createSelector(
    getSongPanelFeatureState,
    state=> state.songsUnderAnalysis
)

export const getSongUnderAnalysisById = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        return props ? state.songsUnderAnalysis.find(p => p.id === props.id) : null
    }
)

export const getXdisplacementBySongId = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        return props ? StringifiedMap.get(state.xDisplacement, props.id) : null
    }
)
export const getXscaleBySongId = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        return props ? StringifiedMap.get(state.xScale, props.id) : null
    }
)