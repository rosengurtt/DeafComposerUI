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

    public isEqual(n: Note): boolean {
        if (!n) return false
        if (n.pitch == this.pitch &&
            n.volume == this.volume &&
            n.startSinceBeginningOfSongInTicks == this.startSinceBeginningOfSongInTicks &&
            n.endSinceBeginningOfSongInTicks == this.endSinceBeginningOfSongInTicks &&
            n.isPercussion == this.isPercussion &&
            n.voice == this.voice &&
            n.instrument == this.instrument)
            return true
        return false
    }
}