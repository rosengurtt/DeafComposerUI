import { createReducer, on } from '@ngrx/store'
import { SongPanelPageActions } from './actions'
import { SongPanelState } from './index'
import {cloneDeep} from 'lodash-es'
import { StringifiedMap } from 'src/app/core/utilities/stringified-map'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'


const initialState: SongPanelState = {
    songsUnderAnalysis: [],
    displacement: null,
    scale: null,
    playingSong: null,
    tracksMuted: [],
    viewType: SongViewType.pianoRoll,
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
        newState.songsUnderAnalysis = [...state.songsUnderAnalysis, action.song]
        newState.displacement = StringifiedMap.set(state.displacement, action.song.id, new Coordenadas(0, 0))
        newState.scale = StringifiedMap.set(state.scale, action.song.id, 1)
        return newState
    }),
    on(SongPanelPageActions.removeSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis = state.songsUnderAnalysis.filter(song => song.id !== action.song.id)
        newState.viewType = SongViewType.pianoRoll
        return newState
    }),

    on(SongPanelPageActions.displacementChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.displacement = StringifiedMap.set(state.displacement, action.songId, action.displacement)
        return newState
    }),

    on(SongPanelPageActions.scaleChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.scale = StringifiedMap.set(state.scale, action.songId, action.scale)
        return newState
    }),
    on(SongPanelPageActions.startPlayingSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.playingSong = action.playingSong
        return newState
    }),
    on(SongPanelPageActions.elapsedSecondPlayingSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        if (state.playingSong.elapsedSeconds + 1 >= state.playingSong.durationInSeconds)
            newState.playingSong = null
        else
            newState.playingSong.elapsedSeconds = state.playingSong.elapsedSeconds + 1
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
        let currentMutedTracks = cloneDeep(state.tracksMuted)
        // If track was in list of muted tracks and now is not muted, remove it
        if (currentMutedTracks.includes(action.track) && action.status === true)
            currentMutedTracks = currentMutedTracks.filter(x => x !== action.track)
        // If track was not in the list of muted tracks and now is muted, add it
        if (!currentMutedTracks.includes(action.track) && action.status === false)
            currentMutedTracks.push(action.track)
        newState.tracksMuted = currentMutedTracks

        return newState
    }),
    on(SongPanelPageActions.unmuteAllTracks, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.tracksMuted = []
        return newState
    }),
    on(SongPanelPageActions.ChangeViewType, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.viewType = action.viewType
        return newState
    }),
);

