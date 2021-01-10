import { createAction, props } from '@ngrx/store'
import { Coordenadas } from 'src/app/core/models/coordenadas'
import { PlayingSong } from 'src/app/core/models/playing-song'
import { SongViewType } from 'src/app/core/models/SongViewTypes.enum'
import { Song } from '../../../../core/models/song'

export const addSong = createAction(
  '[Songs-Panel Page] Add Song Action',
  props<{ song: Song }>()
)
export const removeSong = createAction(
  '[Songs-Panel Page] Remove Song Action',
  props<{ song: Song }>()
)

export const displacementChange = createAction(
  '[Songs-Panel Page] Displacement change',
  props<{ songId: number, displacement: Coordenadas }>()
)

export const scaleChange = createAction(
  '[Songs-Panel Page] Scale change',
  props<{ songId: number, scale: number }>()
)

export const startPlayingSong = createAction(
  '[Songs-Panel Page] Start playing song',
  props<{ playingSong: PlayingSong }>()
)
export const elapsedSecondPlayingSong = createAction(
  '[Songs-Panel Page] Elapsed second playing song'
)
export const stopPlayingSong = createAction(
  '[Songs-Panel Page] Stop playing song'
)
export const pausePlayingSong = createAction(
  '[Songs-Panel Page] Pause playing song'
)
export const resumePlayingSong = createAction(
  '[Songs-Panel Page] Resume playing song'
)
export const trackMutedStatusChange = createAction(
  '[Songs-Panel Page] Track muted',
  props<{ songId: number, track: number, status: boolean }>()
)
export const unmuteAllTracks = createAction(
  '[Songs-Panel Page] Unmute all tracks',
  props<{ songId: number }>()
)
export const changeViewType = createAction(
  '[Songs-Panel Page] Change View Type',
  props<{ songId: number, viewType: SongViewType }>()
)
export const selectSongSimplification = createAction(
  '[Songs-Panel Page] Select Song Simplfication',
  props<{ songId: number,  songSimplificationVersion: number }>()
)
export const songSliderPositionChange = createAction(
  '[Songs-Panel Page] Song Slider Position Change',
  props<{ songId: number, songSliderPosition: number }>()
)
