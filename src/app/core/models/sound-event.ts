import { SoundEventType } from './sound-event-type.enum'

// When analyzing the rythm of a voice in a song, we are interested in the sequence of notes and silences
// A sound event can be a note or a silence. We are interested in when it starts and when it ends and if
// it is a silence or a note 

export class SoundEvent {
    type: SoundEventType
    startTick: number
    endTick: number
    isAccented: boolean

    get duration() {
        return this.endTick - this.startTick
    }

    public constructor(type: SoundEventType, start: number, end: number, isAccented: boolean | null = null) {
        this.type = type
        this.startTick = start
        this.endTick = end
        if (isAccented) this.isAccented = isAccented
    }
}