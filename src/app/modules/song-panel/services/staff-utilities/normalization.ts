
import { Note } from '../../../../core/models/note'
import { Bar } from '../../../../core/models/bar'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { NoteDuration } from 'src/app/core/models/note-duration'
import {GenericStaffDrawingUtilities} from './generic-staff-drawing-utilities'

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

    private static beatDivisions = [1/16, 1/12, 1/8, 1/6, 1 / 4, 1 / 2, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32]

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
            note.voice,  note.PitchBending, note.instrument)
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
    // This function splits a 3/2 quarter in 2 notes, a 7/4 quarter in 3 (a quarter plus an eight plus a sixteenth), in such
    // a way tat all durations returned are a full interval and not a mix of intervals
    // It has to select the order of the figures, for ex when splitting to a quarter and an eight it has to decide which one
    // goes first. It does this trying to make the starting of the notes/rests to fall in the hardest subdivision of the beat
    // We have to consider the case where the bar has triplets
    public static normalizeInterval(bars: Bar[], e: SoundEvent): SoundEvent[] {
        // the following  line is needed because of typescript/javascript limitations
        e = new SoundEvent(e.type, e.pitch, e.bar, e.startTick, e.endTick, e.duration, e.isTiedToPrevious, e.isAccented, e.isPercussion)
        const timeSig = bars[e.bar - 1].timeSignature
        const beatDuration = 96 * 4 / timeSig.denominator
        const barHasTriplets = bars[e.bar - 1].hasTriplets

        for (const p of this.beatDivisions) {
            // if the event has a duration that is a whole quarter, an eight, a sixteenth, etc. return it
            if (e.durationInTicks == beatDuration / p || e.durationInTicks < 20)
                return [e]
        }

        // if it is odd, find a larger and a shorter standard intervals and split the event
        for (let i = 0; i < this.beatDivisions.length - 1; i++) {
            let sacamela1=beatDuration / this.beatDivisions[i]
            let sacamela2=beatDuration / this.beatDivisions[i + 1]
            if (e.durationInTicks < beatDuration / this.beatDivisions[i] && e.durationInTicks > beatDuration / this.beatDivisions[i + 1]) {
                // the note has an odd interval, so we split it in 2
                const splitPoint = [this.getSplitPoint(bars, e)]
                const splittedEvent = this.splitEvent(e, splitPoint, bars)

                // If the original event was tied to the previous, make the first tied to previous
                splittedEvent[0].isTiedToPrevious = e.isTiedToPrevious
                // we call it recursively, because one of the subdivisions may be odd as well
                const left = this.normalizeInterval(bars, splittedEvent[0])
                const right = this.normalizeInterval(bars, splittedEvent[1])
                return left.concat(right)
            }
        }
        console.log("intente normalizar este intervalo y no pude")
        console.log(e)
    }
    // When we want to split a note or rest in 2, we prefer to select intervals that start and stop in 
    // whole divisions of beats. For example if a note duration is a quarter + an eight
    // and starts in tick 0, we will split it in a quarter and an eight, but if it starts in tick
    // 48, we would split it in an eight and a quarter 
    // This function finds the point inside an interval where it makes more sense to split the note
    public static getSplitPoint(bars: Bar[], e: SoundEvent): number {
        let divisions: number[]
        const bar = bars[e.bar - 1]
        const barHasTriplets = bar.hasTriplets
        const barStart = bar.ticksFromBeginningOfSong
        const barDuration = this.ticksPerQuarterNote * bar.timeSignature.numerator * 4 / bar.timeSignature.denominator
        const beatsPerBar = bar.timeSignature.numerator
        const beatDuration = barDuration / beatsPerBar

        divisions = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 72, 96, 128]

        let beatStart: number
        // We first check if a beat boundary falls inside e
        for (let k = 0; k <= beatsPerBar; k++) {
            let candidate = k * beatDuration
            if (e.startTick - barStart < candidate && e.endTick - barStart > candidate) {
                return candidate + barStart
            }
            if (e.startTick - barStart >= candidate)
                beatStart = barStart + candidate
        }
        // e can not be longer than a beat, because in that case there should be a beat boundary inside
        // and e it is completely inside a beat. we now try with subdivisions of it

        for (let d of divisions) {
            for (let k = 0; k <= d; k++) {
                let candidate = k * (beatDuration / d)
                if (e.startTick - beatStart < candidate && e.endTick - beatStart > candidate) {
                    return candidate + beatStart
                }
            }
        }
        console.log("me voy de getSplictPoint sin retornar el split point. Este era el event:")

        console.log(e)
    }
    // When we want to split a sound event in many, for ex. because the event extends from one bar to the next, we
    // call this function and we pass the points where we want to split the event (it could for ex. extend several bars,
    // not just 2) and it returns a sequence of events that correspond to the split points we passed
    // The first event returned has a isTiedToPrevious value of false, and all the rest of true
    public static splitEvent(e: SoundEvent, splitPoints: number[], bars: Bar[]): SoundEvent[] {
        // In case we don't have actually to split anyting because there are no split points,
        // return the event as an array of events
        if (!splitPoints || splitPoints.length == 0)
            return [e]
        let retObj = <SoundEvent[]>[]
        let lastStartPoint = e.startTick
        let pointBar = GenericStaffDrawingUtilities.getBarOfTick(bars, lastStartPoint)
        for (const p of splitPoints) {
            const eventDuration = this.getEventDuration(bars, lastStartPoint, p)
            retObj.push(new SoundEvent(e.type, e.pitch, pointBar, lastStartPoint, p, eventDuration, lastStartPoint == e.startTick ? e.isTiedToPrevious : true, null, e.isPercussion))
            // Get the bar for the event that starts in point p         
            lastStartPoint = p
            pointBar = GenericStaffDrawingUtilities.getBarOfTick(bars, lastStartPoint)
        }
        const eventDuration = this.getEventDuration(bars, lastStartPoint, e.endTick)
        retObj.push(new SoundEvent(e.type, e.pitch, pointBar, lastStartPoint, e.endTick, eventDuration, true, null, e.isPercussion))
        return retObj
    }

    public static getEventDuration(bars: Bar[], startTick: number, endTick: number): NoteDuration {
        const bar = GenericStaffDrawingUtilities.getBarOfTick(bars, startTick)
        const timeSignature = bars[bar - 1].timeSignature
        const beatDurationInTicks = 4 / timeSignature.denominator * 96
        const eventDurationInTicks = endTick - startTick
        if (timeSignature.denominator == 2) {
            if (eventDurationInTicks >= 2 * beatDurationInTicks) return NoteDuration.whole
            if (eventDurationInTicks >= beatDurationInTicks) return NoteDuration.half
            if (2 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.quarter
            if (4 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.eight
            if (8 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.sixteenth
            if (16 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.thirtysecond
            return NoteDuration.sixtyfourth
        }
        if (timeSignature.denominator == 4) {
            if (eventDurationInTicks >= 4 * beatDurationInTicks) return NoteDuration.whole
            if (eventDurationInTicks >= 2 * beatDurationInTicks) return NoteDuration.half
            if (eventDurationInTicks >= beatDurationInTicks) return NoteDuration.quarter
            if (2 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.eight
            if (4 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.sixteenth
            if (8 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.thirtysecond
            return NoteDuration.sixtyfourth
        }
        else if (timeSignature.denominator == 8) {
            if (eventDurationInTicks >= 4 * beatDurationInTicks) return NoteDuration.half
            if (eventDurationInTicks >= 2 * beatDurationInTicks) return NoteDuration.quarter
            if (eventDurationInTicks >= beatDurationInTicks) return NoteDuration.eight
            if (2 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.sixteenth
            if (4 * eventDurationInTicks >= beatDurationInTicks) return NoteDuration.thirtysecond
            return NoteDuration.sixtyfourth
        }
        return NoteDuration.unknown
    }
}