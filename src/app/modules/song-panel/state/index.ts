
import { createFeatureSelector, createSelector } from '@ngrx/store'
import { Song } from 'src/app/core/models/song'
import { StringifiedMap } from 'src/app/core/utilities/stringified-map'
import { PlayingSong } from 'src/app/core/models/playing-song'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'

// State for this feature (Product)
export interface SongPanelState {
    songsUnderAnalysis: Song[]
    simplificationVersionSelected: number
    displacement: string
    scale: string
    playingSong: PlayingSong
    tracksMuted: number[]
    viewType: SongViewType
    error: string
}


export const songsPanelFeatureKey = 'songs-panel'

const getSongPanelFeatureState = createFeatureSelector<SongPanelState>(songsPanelFeatureKey);

export const getSongsUnderAnalysis = createSelector(
    getSongPanelFeatureState,
    state => state.songsUnderAnalysis
)

export const getSongUnderAnalysisById = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        return props ? state.songsUnderAnalysis.find(p => p.id === props.id) : null
    }
)

export const getDisplacementBySongId = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        return props ? StringifiedMap.get(state.displacement, props.id) : null
    }
)
export const getScaleBySongId = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        return props ? StringifiedMap.get(state.scale, props.id) : null
    }
)

export const getPlayingSong = createSelector(
    getSongPanelFeatureState,
    state => state.playingSong
)

export const getMutedTracks = createSelector(
    getSongPanelFeatureState,
    state => state.tracksMuted
)

export const getSongViewType = createSelector(
    getSongPanelFeatureState,
    state => state.viewType
)

export const getSongSimplificationSelected = createSelector(
    getSongPanelFeatureState,
    state => state.simplificationVersionSelected
)