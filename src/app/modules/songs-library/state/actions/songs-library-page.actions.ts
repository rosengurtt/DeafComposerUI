/* NgRx */
import { createAction, props } from '@ngrx/store'

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
export const loadStyles = createAction(
  '[Songs-Library Page] Load Styles',
  props<{ pageSize: number }>()
)
export const loadBands = createAction(
  '[Songs-Library Page] Load Bands',
  props<{ pageSize: number, styleId: number }>()
)
export const loadSongs = createAction(
  '[Songs-Library Page] Load Songs',
  props<{ pageSize: number, styleId: number, bandId: number }>()
)