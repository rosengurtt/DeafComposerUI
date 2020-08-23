import { PitchBending } from './pitch-bending'

export class Note {
    id: number
    pitch: number
    volume: number
    startSinceBeginningOfSongInTicks: number
    endSinceBeginningOfSongInTicks: number
    isPercussion: number
    voice: number
    PitchBending: PitchBending[]
}