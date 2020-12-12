
import { Note } from '../../../../core/models/note'
import { Bar } from '../../../../core/models/bar'
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
    private static normalizePoint(point: number, beatDuration: number, tolerance: number, hasTriplets: boolean, beatStart: number) {
        if (point == 0 || point == beatDuration || point == beatStart) return point

        // if (hasTriplets) {
        for (let [i, j] of this.normalizedBeatSubdivisionsWithTriplets) {
            if (point - beatStart >= i / j * beatDuration - tolerance &&
                point - beatStart <= i / j * beatDuration + tolerance) {
                return beatStart + Math.round(beatDuration * i / j)
            }
        }
        // }
        // if (!hasTriplets) {
        //     for (let [i, j] of this.normalizedBeatSubdivisionsWithoutTriplets) {
        //         if (muestren)
        //         console.log(`[i,j]= [${i},${j}] comparo ${point - beatStart} con ${i / j * beatDuration - tolerance}` )
        //         if (point - beatStart >= i / j * beatDuration - tolerance &&
        //             point - beatStart <= i / j * beatDuration + tolerance) {
        //             return beatStart + Math.round(beatDuration * i / j)
        //         }
        //     }
        // }
        console.log("sali por donde no debo")
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
   
}