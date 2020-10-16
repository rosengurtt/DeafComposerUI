import { createAction, props } from '@ngrx/store'
import { MusicStyle } from '../../../../core/models/music-style'
import {Band}from '../../../../core/models/band'
import {Song}from '../../../../core/models/song'
import { PaginationData } from 'src/app/core/models/pagination-data'

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
export const stylesPaginationChange = createAction(
  '[Songs-Library Page] Page Style',
  props<{ paginationData: PaginationData }>()
)
export const bandsPaginationChange = createAction(
  '[Songs-Library Page] Page Band',
  props<{ paginationData: PaginationData }>()
)
export const songsPaginationChange = createAction(
  '[Songs-Library Page] Page Song',
  props<{ paginationData: PaginationData }>()
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