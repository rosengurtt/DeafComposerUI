
import { Note } from '../../../../core/models/note'
import { Bar } from '../../../../core/models/bar'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { DrawingCalculations } from './drawing-calculations'

export class Normalization {
    private static ticksPerQuarterNote = 96
    private static normalizedBeatSubdivisionsWithTriplets = [[1, 1], [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 12], [5, 12], [7, 12], [11, 12], [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
    [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
    [25, 32], [27, 32], [29, 32], [31, 32]]
    private static normalizedBeatSubdivisionsWithoutTriplets = [[1, 1], [1, 2], [1, 4], [3, 4], [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
    [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
    [25, 32], [27, 32], [29, 32], [31, 32]]

    // If we have a note starting in tick 0 and another starting in tick 2, they actually are supposed to start
    // at the same time. So we want to discretize the notes in a way where all notes that should start together
    // start exactly in the same tick
    // This method aproximates the start to the biggest subdivision it can make of the beat, without going too
    // far from the note current start tick
    public static normalizeNoteStart(bars: Bar[], note: Note): Note {
        const tolerance = 3
        const barOfNote = this.getBarOfNote(bars, note)
        const timeSig = barOfNote.timeSignature
        const beatDuration = this.ticksPerQuarterNote * timeSig.denominator / 4
        let beatStart: number
        for (let i = timeSig.numerator - 1; i >= 0; i--) {
            if (barOfNote.ticksFromBeginningOfSong + i * beatDuration <= note.startSinceBeginningOfSongInTicks) {
                beatStart = barOfNote.ticksFromBeginningOfSong + i * beatDuration
                break
            }
        }

        let normalizedStart = this.normalizePoint(note.startSinceBeginningOfSongInTicks, beatDuration,
            tolerance, barOfNote.hasTriplets, beatStart)

        return new Note(note.id, note.pitch, note.volume, normalizedStart, note.endSinceBeginningOfSongInTicks, note.isPercussion,
            note.voice, note.PitchBending, note.instrument)
    }
    public static normalizePoint(point: number, beatDuration: number, tolerance: number, hasTriplets: boolean, beatStart: number) {
        if (point == 0 || point == beatDuration || point == beatStart) return point

        for (let [i, j] of this.normalizedBeatSubdivisionsWithTriplets) {
            if (point - beatStart >= i / j * beatDuration - tolerance &&
                point - beatStart <= i / j * beatDuration + tolerance) {
                return beatStart + Math.round(beatDuration * i / j)
            }
        }
        console.log("intente normalizar este point y no pude")
        console.log(`point ${point}  beatStart ${beatStart}  beatDuration ${beatDuration}`)
    }

    private static getBarOfNote(bars: Bar[], n: Note): Bar {
        for (let i = 0; i < bars.length; i++) {
            if (bars[i].ticksFromBeginningOfSong <= n.startSinceBeginningOfSongInTicks &&
                (i == bars.length - 1 || bars[i + 1].ticksFromBeginningOfSong > n.startSinceBeginningOfSongInTicks))
                return bars[i]
        }
        return null
    }
    // We want all intervals of notes and rests to be a full quarter, or eight, etc and not a quarter and a half,
    // or stil worse a quarter plus an eight plus a sixteenth
    // This function splits a quarter and a half in 2 notes, a quarter plus an eight plus a sixteenth in 3, in such
    // a way tat all durations returned are a full interval and not a mix of intervals
    // We have to consider the case where the bar has triplets
    public static normalizeInterval(bars: Bar[], e: SoundEvent): SoundEvent[] {
        // the following  line is needed because of typescript/javascript limitations
        e = new SoundEvent(e.type, e.bar, e.startTick, e.endTick, e.duration, e.isTiedToPrevious, e.isAccented)
        const timeSig = bars[e.bar - 1].timeSignature
        const beatDuration = 96 * timeSig.numerator / 4
        const barHasTriplets = bars[e.bar - 1].hasTriplets

        let points: number[]
        // if the duration is not odd, return the event as an array of events
        if (barHasTriplets)
            points = [1 / 4, 1 / 2, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64]
        else
            points = [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32, 64]
        for (const p of points) {

            // if the event has a duration that is a whole quarter, an eight, a sixteenth, etc. return it
            if (e.durationInTicks == beatDuration / p || e.durationInTicks < 8)
                return [e]
        }

        // if it is odd, find a larger and a shorter standard intervals and split the event
        for (let i = 0; i < points.length - 1; i++) {
            if (e.durationInTicks < beatDuration / points[i] && e.durationInTicks > beatDuration / points[i + 1]) {
                // the note has an odd interval, so we split it in 2
                const splitPoint = [DrawingCalculations.getSplitPoint(bars, e)]
                const splittedEvent = DrawingCalculations.splitEvent(e, splitPoint, bars)


                splittedEvent[0].isTiedToPrevious = e.isTiedToPrevious
                // we call it recursively, because one of the subdivisions may be odd as well
                // like when we have a rest that is a quarter plus an eight plus a sixteenth
                const left = this.normalizeInterval(bars, splittedEvent[0])
                const right = this.normalizeInterval(bars, splittedEvent[1])
                return left.concat(right)
            }
        }
        console.log("intente normalizar este intervalo y no pude")
        console.log(e)
    }
}