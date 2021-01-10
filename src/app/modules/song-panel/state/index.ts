
import { createFeatureSelector, createSelector } from '@ngrx/store'
import { Song } from 'src/app/core/models/song'
import { SongUnderAnalysis } from 'src/app/core/models/song-under-analysis'
import { StringifiedMap } from 'src/app/core/utilities/stringified-map'
import { PlayingSong } from 'src/app/core/models/playing-song'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'

// State for this feature (Product)
export interface SongPanelState {
    songsUnderAnalysis: SongUnderAnalysis[]
    playingSong: PlayingSong
    error: string
}


export const songsPanelFeatureKey = 'songs-panel'

const getSongPanelFeatureState = createFeatureSelector<SongPanelState>(songsPanelFeatureKey);

export const getSongsUnderAnalysis = createSelector(
    getSongPanelFeatureState,
    state => state.songsUnderAnalysis.map(s => s.song)
)

export const getSongUnderAnalysisById = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        if (props) {
            const songita = state.songsUnderAnalysis.filter(s => s.song.id == props.id)
            if (songita.length > 0) return songita[0].song
        }
        return null
    }
)

export const getDisplacementBySongId = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        const songita = state.songsUnderAnalysis.filter(s => s.song.id == props.songId)
        if (songita.length > 0)
            return songita[0].displacement
    }
)
export const getScaleBySongId = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        const songita = state.songsUnderAnalysis.filter(s => s.song.id == props.songId)
        if (songita.length > 0)
            return songita[0].scale
        return null
    }
)

export const getPlayingSong = createSelector(
    getSongPanelFeatureState,
    state => state.playingSong
)

export const getMutedTracks = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        const songita = state.songsUnderAnalysis.filter(s => s.song.id == props.songId)
        if (songita.length > 0)
            return songita[0].tracksMuted
        return null
    }
)

export const getSongViewType = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        const songita = state.songsUnderAnalysis.filter(s => s.song.id == props.songId)
        if (songita.length > 0)
            return songita[0].viewType
        return null
    }
)

export const getSongSimplificationSelected = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        const songita = state.songsUnderAnalysis.filter(s => s.song.id == props.songId)
        if (songita.length > 0)
            return songita[0].simplificationVersionSelected
        return null
    }
)

export const getSongSliderPositionForSongId = createSelector(
    getSongPanelFeatureState,
    (state, props) => {
        const songita = state.songsUnderAnalysis.filter(s => s.song.id == props.songId)
        if (songita.length > 0)
            return songita[0].songSliderPosition
        return null
    }
)