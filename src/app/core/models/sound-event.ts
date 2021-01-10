import { NoteDuration } from './note-duration'
import { SoundEventType } from './sound-event-type.enum'
import { Alteration } from './alteration.enum'

// When analyzing the rythm of a voice in a song, we are interested in the sequence of notes and silences
// A sound event can be a note or a silence. We are interested in when it starts and when it ends and if
// it is a silence or a note 

export class SoundEvent {
    type: SoundEventType
    bar: number
    startTick: number
    endTick: number
    duration: NoteDuration
    isTiedToPrevious: boolean
    isAccented: boolean
    alteration: Alteration | null
    pitch: number | null
    graphic: Element[]          // In musical notation this array has the staff objects that are displayed for this note
    // They are an array because a single note can be shown as several tied notes
    x: number                   // This represents the distance of the graphic element from the left border of the svg box
    y: number
    get durationInTicks() {
        return this.endTick - this.startTick
    }

    constructor(
        type: SoundEventType,
        pitch: number,
        bar: number,
        start: number,
        end: number,
        duration: NoteDuration,
        isTiedToPrevious: boolean | null = null,
        isAccented: boolean | null = null) {
        this.type = type
        this.pitch = pitch
        this.startTick = start
        this.endTick = end
        this.bar = bar
        this.duration = duration
        this.graphic = []
        this.x = 0
        this.y = 0
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
        if (this.durationInTicks > (ticksPerQuarterNote - tolerance) * 4) return NoteDuration.whole
        if (this.durationInTicks > (ticksPerQuarterNote - tolerance) * 2) return NoteDuration.half
        if (this.durationInTicks > (ticksPerQuarterNote - tolerance)) return NoteDuration.quarter
        if (this.durationInTicks > (ticksPerQuarterNote - tolerance) / 2) return NoteDuration.eight
        if (this.durationInTicks > (ticksPerQuarterNote - tolerance) / 4) return NoteDuration.sixteenth
        if (this.durationInTicks > (ticksPerQuarterNote - tolerance) / 8) return NoteDuration.thirtysecond
        if (this.durationInTicks > (ticksPerQuarterNote - tolerance) / 16) return NoteDuration.sixtyfourth
    }
}