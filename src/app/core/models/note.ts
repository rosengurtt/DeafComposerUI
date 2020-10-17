import { PitchBending } from './pitch-bending'

export class Note {
    id: number
    pitch: number
    volume: number
    startSinceBeginningOfSongInTicks: number
    endSinceBeginningOfSongInTicks: number
    isPercussion: boolean
    voice: number
    PitchBending: PitchBending[]
    instrument: number

    get durationInTicks(): number {
        return this.endSinceBeginningOfSongInTicks - this.endSinceBeginningOfSongInTicks
    }
}