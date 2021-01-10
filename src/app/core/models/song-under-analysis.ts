import {Song} from './song'
import {SongViewType} from './SongViewTypes.enum'

export class SongUnderAnalysis{
    song: Song
    displacement: string
    scale: string
    tracksMuted: number[]
    viewType: SongViewType
    songSliderPosition: number
}