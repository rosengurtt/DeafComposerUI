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