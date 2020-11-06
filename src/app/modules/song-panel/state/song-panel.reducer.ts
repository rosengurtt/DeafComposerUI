import { createReducer, on } from '@ngrx/store'
import { SongPanelPageActions } from './actions'
import { SongPanelState } from './index'
import * as cloneDeep from 'lodash/cloneDeep'
import { StringifiedMap } from 'src/app/core/utilities/stringified-map'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { PlayingSong } from 'src/app/core/models/playing-song'


const initialState: SongPanelState = {
    songsUnderAnalysis: [],
    displacement: null,
    scale: null,
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
        newState.songsUnderAnalysis = [...state.songsUnderAnalysis, action.song]
        newState.displacement = StringifiedMap.set(state.displacement, action.song.id, new Coordenadas(0, 0))
        newState.scale = StringifiedMap.set(state.scale, action.song.id, 1)
        return newState
    }),
    on(SongPanelPageActions.removeSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis = state.songsUnderAnalysis.filter(song => song.id !== action.song.id)
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
);

