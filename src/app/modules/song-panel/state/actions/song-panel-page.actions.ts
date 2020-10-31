import { createAction, props } from '@ngrx/store'
import { Song } from '../../../../core/models/song'

export const addSong = createAction(
  '[Songs-Panel Page] Add Song Action',
  props<{ song: Song }>()
)
export const removeSong = createAction(
  '[Songs-Panel Page] Remove Song Action',
  props<{ song: Song }>()
)

export const xDisplacementChange = createAction(
  '[Songs-Panel Page] xDisplacement change',
  props<{ songId: number, displacement: number }>()
)

export const xScaleChange = createAction(
  '[Songs-Panel Page] xScale change',
  props<{ songId: number, scale: number }>()
)
