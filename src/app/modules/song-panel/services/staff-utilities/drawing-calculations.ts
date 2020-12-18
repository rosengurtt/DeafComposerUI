import { Song } from '../../../../core/models/song'
import { NoteDuration } from '../../../../core/models/note-duration'
import { SoundEvent } from '../../../../core/models/sound-event'
import { TimeSignature } from '../../../../core/models/time-signature'
import { SoundEventType } from '../../../../core/models/sound-event-type.enum'
import { BeatGraphNeeds } from '../../../../core/models//beat-graph-needs'
import { Note } from '../../../../core/models/note'
import { SongSimplification } from '../../../../core/models/song-simplification'
import { Bar } from '../../../../core/models/bar'
import { Normalization } from './normalization'

export class DrawingCalculations {
    private static ticksPerQuarterNote = 96
    private static standardWidth = 50   // represents the width of a note or a silence symbol. We keep a variable that has the x coordinate
    // where we will insert the next symbol, and we increase it by this value after inserting one
    private static normalizedBeatSubdivisionsWithTriplets = [[1, 1], [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 12], [5, 12], [7, 12], [11, 12], [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
    [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
    [25, 32], [27, 32], [29, 32], [31, 32]]
    private static normalizedBeatSubdivisionsWithoutTriplets = [[1, 1], [1, 2], [1, 4], [3, 4], [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
    [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
    [25, 32], [27, 32], [29, 32], [31, 32]]

    // When we draw for example a sixteenth inside a beat, we have to align it with other notest played in the
    // same beat in other voices. So for example if the sixteenth is the second in a group of 4, any note
    // played in another voice at the same time as this sixteenth, should have the same x coordinate
    // the x returned is a fraction of the total display width of the beat. For example if we have the second
    // sixteenth as before, we should return 1/4
    public static calculateXofEventInsideBeat(event: SoundEvent, beatGraphNeeds: BeatGraphNeeds, beatStart: number): number {
        const eventsBeforeThisOne = beatGraphNeeds.EventsStartTickFromBeginningOfBeat.filter(e => e < event.startTick - beatStart)
        if (!eventsBeforeThisOne || eventsBeforeThisOne.length == 0)
            return 0
        return this.standardWidth * eventsBeforeThisOne.length
    }

    public static calculateWidthInPixelsOfBeat(beatGraphNeeds: BeatGraphNeeds) {
        if (!beatGraphNeeds || beatGraphNeeds.EventsStartTickFromBeginningOfBeat.length == 0)
            return 0
        return beatGraphNeeds.EventsStartTickFromBeginningOfBeat.length * this.standardWidth
    }

    // Generates the sequence of notes and rests that will need to be drawn for this voice
    public static getEventsToDraw(song: Song, simplificationNo: number, voice: number): SoundEvent[] {

        const simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        const bars = song.bars

        console.log(`voice ${voice}`)
        const voiceNotes = simplification.getNotesOfVoice(voice, song)

        const tolerance = 6
        let soundEvents = <SoundEvent[]>[]
        let endOfLastComputedNote = 0
        // in this loop we add rest events when there are significan empty spaces between consecutive notes
        for (const n of voiceNotes) {
            const currentBar = this.getBarOfTick(bars, endOfLastComputedNote)
            // if there is a number of ticks greater than tolerance between the end of the previous not and this one, add a rest
            if (endOfLastComputedNote + tolerance < n.startSinceBeginningOfSongInTicks) {
                const eventDuration = this.getEventDuration(bars, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks)
                let event = new SoundEvent(SoundEventType.rest, currentBar, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks, eventDuration)
                soundEvents.push(event)
                endOfLastComputedNote = n.startSinceBeginningOfSongInTicks
            }
            // Get the bar in which the note is
            const noteBar = this.getBarOfTick(bars, n.startSinceBeginningOfSongInTicks)
            const eventDuration = this.getEventDuration(bars, n.startSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks)
            soundEvents.push(new SoundEvent(SoundEventType.note, noteBar, n.startSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks, eventDuration))
            endOfLastComputedNote = n.endSinceBeginningOfSongInTicks
        }
        let standadizedEvents = this.standardizeSequenceOfNotesAndRests(bars, soundEvents)

        // remove undefined items. Not sure why there are sometimes undefined items
        return standadizedEvents.filter(item => item)
    }

    // We want to have a global view regadless of which track we are drawing of the ticks where there is note
    // starting or there is a bar starting. We need this information to align the drawings of the different tracks
    // so notes that start in the same tick are shown in the same vertical
    public static getAllNoteStarts(song: Song, simplificationNo: number): number[] {
        const simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        const bars = song.bars
        // Order notes by start time
        const aux = [...simplification.notes]
            .sort((i, j) => i.startSinceBeginningOfSongInTicks - j.startSinceBeginningOfSongInTicks)
        const songNotes = aux.map(n => Normalization.normalizeNoteStart(bars, n))
        let startNotesSet = new Set<number>()
        songNotes.forEach(n => startNotesSet.add(n.startSinceBeginningOfSongInTicks))

        // we add now the start of the bars
        bars.forEach(b => startNotesSet.add(b.ticksFromBeginningOfSong))
        return Array.from(startNotesSet)
    }

    // Returns the bar number (first bar=1) in which a tick is located
    // If a tick is in the separation of 2 bars, it returns the second
    private static getBarOfTick(bars: Bar[], tick: number): number {
        return bars.filter(b => b.ticksFromBeginningOfSong <= tick).length
    }

    // If we have a note starting in tick 0 and another starting in tick 2, they actually are supposed to start
    // at the same time. So we want to discretize the notes in a way where all notes that should start together
    // start exactly in the same tick
    // This method aproximates the start to the biggest subdivision it can make of the beat, without going too
    // far from the note current start tick
    // private static normalizeNoteStart(bars: Bar[], note: Note): Note {
    //     const tolerance = 3
    //     const barOfNote = this.getBarOfNote(bars, note)
    //     const timeSig = barOfNote.timeSignature
    //     const beatDuration = this.ticksPerQuarterNote * timeSig.denominator / 4
    //     let beatStart: number
    //     for (let i = timeSig.numerator - 1; i >= 0; i--) {
    //         if (barOfNote.ticksFromBeginningOfSong + i * beatDuration <= note.startSinceBeginningOfSongInTicks) {
    //             beatStart = barOfNote.ticksFromBeginningOfSong + i * beatDuration
    //             break
    //         }
    //     }

    //     let normalizedStart = Normalization.normalizePoint(note.startSinceBeginningOfSongInTicks, beatDuration,
    //         tolerance, barOfNote.hasTriplets, beatStart)

    //     return new Note(note.id, note.pitch, note.volume, normalizedStart, note.endSinceBeginningOfSongInTicks, note.isPercussion,
    //         note.voice, note.PitchBending, note.instrument)
    // }

    // Returns the bar corresponding to the start of a note (it may finish in a different abar)
    private static getBarOfNote(bars: Bar[], n: Note): Bar {
        const barNumber = this.getBarOfTick(bars, n.startSinceBeginningOfSongInTicks)
        return bars[barNumber]
    }
    private static getEventDuration(bars: Bar[], startTick: number, endTick: number): NoteDuration {
        const bar = this.getBarOfTick(bars, startTick)
        const timeSignature = bars[bar - 1].timeSignature
        const beatDurationInTicks = timeSignature.denominator / 4 * 96
        const eventDurationInTicks = endTick - startTick
        if (timeSignature.denominator == 2) {
            if (eventDurationInTicks == 2 * beatDurationInTicks) return NoteDuration.whole
            if (eventDurationInTicks == beatDurationInTicks) return NoteDuration.half
            if (2 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.quarter
            if (4 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.eight
            if (8 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.sixteenth
            if (16 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.thirtysecond
            if (32 * eventDurationInTicks <= beatDurationInTicks) return NoteDuration.sixtyfourth
        }
        if (timeSignature.denominator == 4) {
            if (eventDurationInTicks == 4 * beatDurationInTicks) return NoteDuration.whole
            if (eventDurationInTicks == 2 * beatDurationInTicks) return NoteDuration.half
            if (eventDurationInTicks == beatDurationInTicks) return NoteDuration.quarter
            if (2 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.eight
            if (4 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.sixteenth
            if (8 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.thirtysecond
            if (16 * eventDurationInTicks <= beatDurationInTicks) return NoteDuration.sixtyfourth
        }
        else if (timeSignature.denominator == 8) {
            if (eventDurationInTicks == 4 * beatDurationInTicks) return NoteDuration.half
            if (eventDurationInTicks == 2 * beatDurationInTicks) return NoteDuration.quarter
            if (eventDurationInTicks == beatDurationInTicks) return NoteDuration.eight
            if (2 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.sixteenth
            if (4 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.thirtysecond
            if (8 * eventDurationInTicks <= beatDurationInTicks) return NoteDuration.sixtyfourth
        }
        return NoteDuration.unknown
    }


    // A rest can be divided in a sequence of rests. For example if a rest extends to the next bar, we split it
    // in 2, one that ends with the first bar and one that starts with the second.
    // If a rest is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the rests start in the hardest bit
    // The same with the notes
    private static standardizeSequenceOfNotesAndRests(bars: Bar[], input: SoundEvent[]): SoundEvent[] {
        let retObj = this.splitEventsThatExtendToNextBar(bars, input)
        console.log("despues de ejecutar splitEventsThatExtendToNextBar")
        retObj = this.splitEventsThatHaveOddDurations(bars, retObj)
        return this.splitRestsLongerThanAquarter(bars, retObj)

    }

    // We don't draw rests that have a duration of a half or a whole. We split them in quarters
    private static splitRestsLongerThanAquarter(bars: Bar[], input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (const e of input) {
            const duration = this.getEventDuration(bars, e.startTick, e.endTick)
            // If it is not a rest don't touch it
            if (e.type == SoundEventType.note)
                retObj.push(e)
            else if (duration == NoteDuration.half) {
                const splitPoint = Math.round((e.endTick + e.startTick) / 2)
                let splitted = this.splitEvent(e, [splitPoint], bars)
                retObj = retObj.concat(splitted)
            }
            else if (duration == NoteDuration.whole) {
                let splitPoints = []
                for (let i = 1; i < 4; i++) {
                    splitPoints.push(e.startTick + Math.round(i * (e.durationInTicks / 4)))
                }
                let splitted = this.splitEvent(e, splitPoints, bars)
                retObj = retObj.concat(splitted)
            }
            else
                retObj.push(e)
        }
        return retObj
    }

    private static splitEventsThatExtendToNextBar(bars: Bar[], input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (const e of input) {
            const startBar = bars.filter(b => b.ticksFromBeginningOfSong <= e.startTick).length
            const endBar = bars.filter(b => b.ticksFromBeginningOfSong < e.endTick).length

            if (endBar > startBar) {

                let splitPoints = <number[]>[]
                // the event can extend for more than 2 bars. Add one event at the end of each
                for (let i = startBar; i < endBar; i++) {
                    // startBar and endBar are indexes that start in 1, not in 0 as is usual in javascript arrays
                    // so bars[startBar] is actually the bar startBar+1
                    splitPoints.push(bars[i].ticksFromBeginningOfSong)
                }
                console.log("los split points son")
                console.log(splitPoints)
                const splitEvents = this.splitEvent(e, splitPoints, bars)
                console.log("voy a agregar estas splited notes")
                console.log(splitEvents)
                splitEvents.forEach(e => retObj.push(e))
                console.log("despues de agregarlas quedo asi")
                console.log(retObj)
            }
            else
                retObj.push(e)
        }
        return retObj
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
        let pointBar = this.getBarOfTick(bars, lastStartPoint)
        for (const p of splitPoints) {
            const eventDuration = this.getEventDuration(bars, lastStartPoint, p)
            // Get the bar for the event that starts in point p         
            retObj.push(new SoundEvent(e.type, pointBar, lastStartPoint, p, eventDuration, lastStartPoint == e.startTick ? false : true))
            lastStartPoint = p
            pointBar = this.getBarOfTick(bars, lastStartPoint)
        }
        const eventDuration = this.getEventDuration(bars, lastStartPoint, e.endTick)
        retObj.push(new SoundEvent(e.type, pointBar, lastStartPoint, e.endTick, eventDuration, true))
        return retObj
    }

    // If a silence is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    // The same with the notes
    private static splitEventsThatHaveOddDurations(bars: Bar[], input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (const e of input) {
            retObj = retObj.concat(Normalization.normalizeInterval(bars, e))
        }
        return retObj
    }
    // // We want all intervals of notes and rests to be a full quarter, or eight, etc and not a quarter and a half,
    // // or stil worse a quarter plus an eight plus a sixteenth
    // // This function splits a quarter and a half in 2 notes, a quarter plus an eight plus a sixteenth in 3, in such
    // // a way tat all durations returned are a full interval and not a mix of intervals
    // // We have to consider the case where the bar has triplets
    // private static normalizeInterval(bars: Bar[], e: SoundEvent): SoundEvent[] {
    //     // the following  line is needed because of typescript/javascript limitations
    //     e = new SoundEvent(e.type, e.bar, e.startTick, e.endTick, e.duration, e.isTiedToPrevious, e.isAccented)
    //     const timeSig = bars[e.bar - 1].timeSignature
    //     const beatDuration = 96 * timeSig.numerator / 4
    //     const barHasTriplets = bars[e.bar - 1].hasTriplets

    //     let points: number[]
    //     // if the duration is not odd, return the event as an array of events
    //     if (barHasTriplets)
    //         points = [1 / 4, 1 / 2, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64]
    //     else
    //         points = [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32, 64]
    //     for (const p of points) {
    //         // if the event has a duration that is a whole quarter, an eight, a sixteenth, etc. return it
    //         if (e.durationInTicks == beatDuration / p || e.durationInTicks < 3)
    //             return [e]
    //     }
    //     // if it is odd, find a larger and a shorter standard intervals and split the event
    //     for (let i = 0; i < points.length - 1; i++) {
    //         if (e.durationInTicks < beatDuration / points[i] && e.durationInTicks > beatDuration / points[i + 1]) {
    //             // the note has an odd interval, so we split it in 2
    //             const splitPoint = [this.getSplitPoint(bars, e)]
    //             const splittedEvent = this.splitEvent(e, splitPoint, bars)
    //             // we call it recursively, because one of the subdivisions may be odd as well
    //             // like when we have a rest that is a quarter plus an eight plus a sixteenth
    //             const left = this.normalizeInterval(bars, splittedEvent[0])
    //             const right = this.normalizeInterval(bars, splittedEvent[1])
    //             return left.concat(right)
    //         }
    //     }
    //     console.log("me voy por donde no debiera")
    //     console.log(e)
    // }
    // When we want to split a note or rest in 2, we prefer to select intervals that start and stop in 
    // whole divisions of beats. For example if a note duration is a quarter + an eight
    // and starts in tick 0, we will split it in a quarter and an eight, but if it starts in tick
    // 48, we would split it in an eight and a quarter 
    // This function finds the point inside an interval where it makes more sense to split the note
    public static getSplitPoint(bars: Bar[], e: SoundEvent): number {
        let divisions: number[]
        const bar = bars[e.bar - 1]
        const barHasTriplets = bar.hasTriplets
        if (barHasTriplets)
            divisions = [1 / 2, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32]
        else
            divisions = [1 / 2, 1, 2, 3, 4, 6, 8, 16, 32]

        // we find the longest interval that is the length of a quarter subdivision
        // that is shorter than the event
        // Then we find the point between startTick and endTick that is a multiplier
        // of that interval
        for (const d of divisions) {
            const intervalInTicks = this.ticksPerQuarterNote / d
            if (e.durationInTicks > intervalInTicks) {
                const barStart = bar.ticksFromBeginningOfSong
                const k1 = (e.startTick - barStart) % intervalInTicks
                const k2 = (e.endTick - barStart) % intervalInTicks
                if (k2 > 0)
                    return e.endTick - k2
                else
                    return e.startTick + (intervalInTicks - k1)
            }
        }
    }
    // private static normalizePoint(point: number, beatDuration: number, tolerance: number, hasTriplets: boolean, beatStart: number) {
    //     if (point == 0 || point == beatDuration || point == beatStart) return point

    //     // if (hasTriplets) {
    //     for (let [i, j] of this.normalizedBeatSubdivisionsWithTriplets) {
    //         if (point - beatStart >= i / j * beatDuration - tolerance &&
    //             point - beatStart <= i / j * beatDuration + tolerance) {
    //             return beatStart + Math.round(beatDuration * i / j)
    //         }
    //     }
    //     // }
    //     // if (!hasTriplets) {
    //     //     for (let [i, j] of this.normalizedBeatSubdivisionsWithoutTriplets) {
    //     //         if (muestren)
    //     //         console.log(`[i,j]= [${i},${j}] comparo ${point - beatStart} con ${i / j * beatDuration - tolerance}` )
    //     //         if (point - beatStart >= i / j * beatDuration - tolerance &&
    //     //             point - beatStart <= i / j * beatDuration + tolerance) {
    //     //             return beatStart + Math.round(beatDuration * i / j)
    //     //         }
    //     //     }
    //     // }
    //     console.log("sali de normalizePoint por donde no debo")
    //     console.log(`point ${point}  beatStart ${beatStart}  beatDuration ${beatDuration}`)
    // }
}
