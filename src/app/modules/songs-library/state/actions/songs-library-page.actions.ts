import { createAction, props } from '@ngrx/store'

import { MusicStyle } from '../../../../core/models/music-style'
import {Band}from '../../../../core/models/band'
import {Song}from '../../../../core/models/song'

export const filterStyleTermChange = createAction(
  '[Songs-Library Page] Filter Style',
  props<{ styleTerm: string }>()
)
export const filterBandTermChange = createAction(
  '[Songs-Library Page] Filter Band',
  props<{ bandTerm: string }>()
)
export const filterSongTermChange = createAction(
  '[Songs-Library Page] Filter Song',
  props<{ songTerm: string }>()
)
export const stylesPageChange = createAction(
  '[Songs-Library Page] Page Style',
  props<{ page: number }>()
)
export const bandsPageChange = createAction(
  '[Songs-Library Page] Page Band',
  props<{ page: number }>()
)
export const songsPageChange = createAction(
  '[Songs-Library Page] Page Song',
  props<{ page: number }>()
)
export const loadStyles = createAction(
  '[Songs-Library Page] Load Styles',
  props<{ pageSize: number }>()
)
export const loadBands = createAction(
  '[Songs-Library Page] Load Bands',
  props<{ pageSize: number, styleId: number | null }>()
)
export const loadSongs = createAction(
  '[Songs-Library Page] Load Songs',
  props<{ pageSize: number, styleId: number | null, bandId: number | null }>()
)
export const styleSelectedChange = createAction(
  '[Songs-Library Page] Style Selected Change',
  props<{ selectedStyle: MusicStyle }>()
)
export const bandSelectedChange = createAction(
  '[Songs-Library Page] Band Selected Change',
  props<{ selectedBand: Band }>()
)
export const songSelectedChange = createAction(
  '[Songs-Library Page] Song Selected Change',
  props<{ selectedSong: Song }>()
)