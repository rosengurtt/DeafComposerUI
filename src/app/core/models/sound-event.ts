import { NoteDuration } from './note-duration'
import { SoundEventType } from './sound-event-type.enum'

// When analyzing the rythm of a voice in a song, we are interested in the sequence of notes and silences
// A sound event can be a note or a silence. We are interested in when it starts and when it ends and if
// it is a silence or a note 

export class SoundEvent {
    type: SoundEventType
    startTick: number
    endTick: number
    isTiedToPrevious: boolean
    isAccented: boolean

    get duration() {
        return this.endTick - this.startTick
    }

    constructor(
        type: SoundEventType,
        start: number,
        end: number,
        isTiedToPrevious: boolean | null = null,
        isAccented: boolean | null = null) {
        this.type = type
        this.startTick = start
        this.endTick = end
        if (isTiedToPrevious) this.isTiedToPrevious = isTiedToPrevious
        else this.isTiedToPrevious = false
        if (isAccented) this.isAccented = isAccented
        else isAccented = false
    }


    // Used to get the duration as a quarter or an eight, etc
    // It assumes the duration is not something like a quarter and a half. In that case returns an invalid value
    // It should be called after the events durations have been standarized, this means that an event that has a 
    // duration of a quarter and an eight, has been replaced by 2 events, one with a duration of a quarter and 
    // another of an eight
    get standardizedDuration(): NoteDuration {
        const ticksPerQuarterNote = 96
        const tolerance = 8
        if (this.duration > (ticksPerQuarterNote - tolerance) * 4) return NoteDuration.whole
        if (this.duration > (ticksPerQuarterNote - tolerance) * 2) return NoteDuration.half
        if (this.duration > (ticksPerQuarterNote - tolerance)) return NoteDuration.quarter
        if (this.duration > (ticksPerQuarterNote - tolerance) / 2) return NoteDuration.eight
        if (this.duration > (ticksPerQuarterNote - tolerance) / 4) return NoteDuration.sixteenth
        if (this.duration > (ticksPerQuarterNote - tolerance) / 8) return NoteDuration.thirtysecond
        if (this.duration > (ticksPerQuarterNote - tolerance) / 16) return NoteDuration.sixtyfourth
    }
}