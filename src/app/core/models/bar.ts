import { TimeSignature } from './time-signature'
import {KeySignature} from './key-signature'

export class Bar {
    id: number
    barNumber: number
    ticksFromBeginningOfSong: number
    timeSignature: TimeSignature
    keySignature: KeySignature
    tempoInMicrosecondsPerQuarterNote: number
    hasTriplets: boolean

    constructor(data: any) {
        this.id = data.id
        this.barNumber = data.barNumber
        this.timeSignature = data.timeSignature
        this.ticksFromBeginningOfSong = data.ticksFromBeginningOfSong
        this.tempoInMicrosecondsPerQuarterNote = data.tempoInMicrosecondsPerQuarterNote
        this.hasTriplets = data.hasTriplets
    }
    public get barWidthInTicks(): number {
        return 96 * this.timeSignature.numerator * 4 / this.timeSignature.denominator
    }
}