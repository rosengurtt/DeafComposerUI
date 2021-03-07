import { createReducer, on } from '@ngrx/store'
import { SongPanelPageActions } from './actions'
import { SongPanelState } from './index'
import { cloneDeep } from 'lodash-es'
import { StringifiedMap } from 'src/app/core/utilities/stringified-map'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'
import { SongUnderAnalysis } from 'src/app/core/models/song-under-analysis'


const initialState: SongPanelState = {
    songsUnderAnalysis: [],
    playingSong: null,
    error: ''
}
export class reduxSacamela {
    addItemToMap(mapito: string, key, value) {
        let mapon = new Map()
        if (mapito) mapon = JSON.parse(mapito)
        mapon.set(key, value)
        return JSON.stringify(mapon)
    }
}


export const songPanelReducer = createReducer<SongPanelState>(
    initialState,
    on(SongPanelPageActions.addSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis = [...state.songsUnderAnalysis, new SongUnderAnalysis(action.song)]
        return newState
    }),
    on(SongPanelPageActions.removeSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis = state.songsUnderAnalysis.filter(s => s.song.id !== action.song.id)
        return newState
    }),

    on(SongPanelPageActions.displacementChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0].displacement = action.displacement
        return newState
    }),

    on(SongPanelPageActions.scaleChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0].scale = action.scale
        return newState
    }),
    on(SongPanelPageActions.startPlayingSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.playingSong = action.playingSong
        return newState
    }),
    on(SongPanelPageActions.elapsedSecondPlayingSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        const nextValue = state.playingSong.elapsedMilliSeconds + (500 * state.playingSong.tempoRatio)
        if (state.playingSong) {
            if (nextValue >= state.playingSong.durationInSeconds * 1000)
                newState.playingSong = null
            else
                newState.playingSong.elapsedMilliSeconds = nextValue
        }
        return newState
    }),
    on(SongPanelPageActions.stopPlayingSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.playingSong = null
        return newState
    }),
    on(SongPanelPageActions.pausePlayingSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.playingSong.isPaused = true
        return newState
    }),
    on(SongPanelPageActions.resumePlayingSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.playingSong.isPaused = false
        return newState
    }),
    on(SongPanelPageActions.trackMutedStatusChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        let songita = newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0]
        let currentMutedTracks = cloneDeep(songita.tracksMuted)
        // If track was in list of muted tracks and now is not muted, remove it
        if (currentMutedTracks.includes(action.track) && action.status === true)
            currentMutedTracks = currentMutedTracks.filter(x => x !== action.track)
        // If track was not in the list of muted tracks and now is muted, add it
        if (!currentMutedTracks.includes(action.track) && action.status === false)
            currentMutedTracks.push(action.track)
        songita.tracksMuted = currentMutedTracks
        return newState
    }),
    on(SongPanelPageActions.unmuteAllTracks, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0].tracksMuted = []
        return newState
    }),
    on(SongPanelPageActions.changeViewType, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0].viewType = action.viewType
        return newState
    }),
    on(SongPanelPageActions.selectSongSimplification, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0].simplificationVersionSelected = action.songSimplificationVersion
        return newState
    }),
    on(SongPanelPageActions.songSliderPositionChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0].songSliderPosition = action.songSliderPosition
        return newState
    }),
    on(SongPanelPageActions.songTempoChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis.filter(s => s.song.id == action.songId)[0].tempoInBeatsPerMinute = action.tempo
        return newState
    }),
);

