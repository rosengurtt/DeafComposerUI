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
    isPercussion: boolean
    // alterationShown is used for indicating the alteration shown next to the note in the pentagram
    alterationShown: Alteration | null
    // alteration applied is used for indicating how the note is played. When the key signature has sharp for ex. the note may
    // be played with a sharp, even when the note itself is not displayed with a sharp
    alterationApplied: Alteration | null
    pitch: number | null
    graphic: Element[]          // In musical notation this array has the staff objects that are displayed for this note
    // They are an array because a single note can be shown as several tied notes
    x: number                   // This represents the distance of the graphic element from the left border of the svg box
    bottomY: number             // Represents the vertical location where we draw the circle of a note
    topY: number                // Represents the vertical location of the top of the stem of a note
    areSubstemsDrawn: boolean   // Eights, sixteens and thirtyseconds need substems drawn. This flag indicates if they have already been drawn or not
    isStemUp: boolean           // Indicates if the stem is drawn upwards or downwards fromthe note circle

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
        isAccented: boolean | null = null,
        isPercussion: boolean = false) {
        this.type = type
        this.pitch = pitch
        this.startTick = start
        this.endTick = end
        this.bar = bar
        this.duration = duration
        this.graphic = []
        this.x = 0
        this.bottomY = 0
        this.topY = 0
        if (isTiedToPrevious) this.isTiedToPrevious = isTiedToPrevious
        else this.isTiedToPrevious = false
        if (isAccented) this.isAccented = isAccented
        else isAccented = false
        this.alterationShown = null
        this.alterationApplied = null
        this.isPercussion = isPercussion
        this.areSubstemsDrawn = false
        this.isStemUp = true
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