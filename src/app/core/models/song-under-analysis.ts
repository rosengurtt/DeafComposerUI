import { Coordenadas } from './coordenadas'
import { Song } from './song'
import { SongViewType } from './SongViewTypes.enum'

export class SongUnderAnalysis {
    song: Song
    displacement: Coordenadas
    scale: number
    tracksMuted: number[]
    viewType: SongViewType
    songSliderPosition: number
    simplificationVersionSelected: number
    tempoInBeatsPerMinute: number

    constructor(song: Song) {
        this.song = song
        this.displacement = new Coordenadas(0, 0)
        this.scale = 1
        this.tracksMuted = []
        this.songSliderPosition = 0
        this.viewType = SongViewType.pianoRoll
        this.simplificationVersionSelected = 1
        this.tempoInBeatsPerMinute = 120 * 500000 / song.tempoChanges[0].microsecondsPerQuarterNote
    }
}