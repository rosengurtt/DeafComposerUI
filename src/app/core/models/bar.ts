import { TimeSignature } from './time-signature'

export class Bar {
    id: number
    barNumber: number
    ticksFromBeginningOfSong: number
    timeSignature: TimeSignature
    tempoInMicrosecondsPerQuarterNote: number
}