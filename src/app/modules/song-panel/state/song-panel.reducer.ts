import { createReducer, on } from '@ngrx/store'
import { SongPanelPageActions } from './actions'
import { SongPanelState } from './index'
import * as cloneDeep from 'lodash/cloneDeep'
import { StringifiedMap } from 'src/app/core/utilities/stringified-map'


const initialState: SongPanelState = {
    songsUnderAnalysis: [],
    xDisplacement: null,
    xScale: null,
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
        newState.xDisplacement = StringifiedMap.set(state.xDisplacement, action.song.id, 0)
        newState.xScale = StringifiedMap.set(state.xScale, action.song.id, 1)
        return newState
    }),
    on(SongPanelPageActions.removeSong, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.songsUnderAnalysis = state.songsUnderAnalysis.filter(song => song.id !== action.song.id)
        newState.xScale = StringifiedMap.set(state.xScale, action.song.id, 1)
        return newState
    }),

    on(SongPanelPageActions.xDisplacementChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.xDisplacement = StringifiedMap.set(state.xDisplacement, action.songId, action.displacement)
        return newState
    }),

    on(SongPanelPageActions.xScaleChange, (state, action): SongPanelState => {
        let newState = cloneDeep(state)
        newState.xScale = StringifiedMap.set(state.xScale, action.songId, action.scale)
        return newState
    }),


);

