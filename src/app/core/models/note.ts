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

    constructor(id: number, pitch: number, volume: number,
        startSinceBeginningOfSongInTicks: number, endSinceBeginningOfSongInTicks: number,
        isPercussion: boolean, voice: number, PitchBending: PitchBending[], instrument: number) {
        this.id = id
        this.pitch = pitch
        this.volume = volume
        this.startSinceBeginningOfSongInTicks = startSinceBeginningOfSongInTicks
        this.endSinceBeginningOfSongInTicks = endSinceBeginningOfSongInTicks
        this.isPercussion = isPercussion
        this.voice = voice
        this.PitchBending = PitchBending
        this.instrument = instrument
    }
}