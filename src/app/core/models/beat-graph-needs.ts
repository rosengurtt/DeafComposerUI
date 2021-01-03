import { Fraction } from './fraction'

// When we generate the representation of a song in music notation, the amount of space that each beat takes
// depends on the notes played in that beat. For example if we play 2 eights, we need twice the width than
// if we play a quarter. If we play 4 sixteens or 3 sixteens and a sixteenth silence, then we need 4 times the
// width of a single quarter

// We save in EventsStartTickFromBeginningOfBeat a sequence of numbers that indicate moments inside the beat
// where a note or a rest starts
// So if we have 2 notes in different voices that start in the same tick, they have to be drawn in the same
// vertical
export class BeatGraphNeeds {
    Bar: number                 // The bar in the song to which this beat belongs
    BeatOfBar: number           // Tells you wich of the beats of the bar it represents. First beat is 1
    EventsStartTickFromBeginningOfBeat: number[]

    constructor(bar: number, beatOfBar: number, eventsStartTickFromBeginningOfBeat: number[]) {
        this.Bar = bar
        this.BeatOfBar = beatOfBar
        this.EventsStartTickFromBeginningOfBeat = eventsStartTickFromBeginningOfBeat
    }
}

