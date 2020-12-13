import { Injectable } from '@angular/core'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { Song } from 'src/app/core/models/song'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { TimeSignature } from 'src/app/core/models/time-signature'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'
import { Note } from 'src/app/core/models/note'
import { Bar } from 'src/app/core/models/bar'
import { StaffElements } from './staff-utilities/staff-elements'
import { DrawingCalculations } from './staff-utilities/drawing-calculations'
import { Normalization } from './staff-utilities/normalization'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'
    svgBox: HTMLElement
    ticksPerQuarterNote = 96
    song: Song
    voice: number
    simplification: SongSimplification
    standardSeparation = 32 // Represents the distance in pixels between 2 notes, 2 rests or a note and a rest
    beats: BeatGraphNeeds[] // Represents the information we need about each beat to draw the notes and rests of that beat
    bars: Bar[]             // Info include the start and end tick and the time signature of each bar of the song
    songNotes: Note[]
    voiceNotes: Note[]
    isPercusion: boolean
    eventsToDraw: SoundEvent[]  // Represents all the notes and rests we have in this voice
    allNoteStarts: number[] // Represents all the ticks where there is a note starting in any of the voices
    normalizedBeatSubdivisionsWithTriplets = [[1, 1], [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 12], [5, 12], [7, 12], [11, 12], [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
    [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
    [25, 32], [27, 32], [29, 32], [31, 32]]
    normalizedBeatSubdivisionsWithoutTriplets = [[1, 1], [1, 2], [1, 4], [3, 4], [1, 8], [3, 8], [5, 8], [7, 8],
    [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
    [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
    [25, 32], [27, 32], [29, 32], [31, 32]]


    standardWidth = 50   // represents the width of a note or a silence symbol. We keep a variable that has the x coordinate
    // where we will insert the next symbol, and we increase it by this value after inserting one



    // We assign to each quarter, eightth, sixteenth or whatever a total of 50 px width
    // The height is always 50 px
    // We insert a vertical bar between compases that ocupies a total space of 50 px
    // The total length is dependent on the number of notes that have to be drawn, a song
    // that consists mostly of quarter notes will occupy less space per bar than a song
    // that consists of sixteenths
    // The function returns the total length of the drawing
    public drawMusicNotationGraphic(
        voice: number,
        svgBoxId: string,
        song: Song,
        simplificationNo: number,
        fromBar: number,
        toBar: number): number {
        this.svgBox = document.getElementById(svgBoxId)
        if (!this.svgBox) {
            return
        }
        this.clearSVGbox(this.svgBox)
        this.voice = voice
        this.song = song
        console.log(song)
        this.simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        this.bars = song.bars
        // Order notes by start time
        const aux = [... this.simplification.notes]
            .sort((i, j) => i.startSinceBeginningOfSongInTicks - j.startSinceBeginningOfSongInTicks)
        // normalize start time of notes
        this.songNotes = aux.map(n => Normalization.normalizeNoteStart(this.bars, n))

        console.log(`voice ${voice}`)
        this.isPercusion = this.simplification.isVoicePercusion(voice)
        this.voiceNotes = this.simplification.getNotesOfVoice(voice, song)
        this.eventsToDraw = DrawingCalculations.getEventsToDraw(song, simplificationNo, voice)
        this.allNoteStarts = DrawingCalculations.getAllNoteStarts(song, simplificationNo)

        let x = 0
        for (const bar of this.bars) {
            x += this.drawBar(bar, x)
        }
    }

    private clearSVGbox(svgBox: HTMLElement) {
        while (svgBox.firstChild) {
            svgBox.removeChild(svgBox.firstChild)
        }
    }



    // Before we draw the notes and rests for a beat in a slice of the song, we need to see what happens
    // in that beat in all voices. For example if we have 2 eights in a beat in a voice, but we have
    // 4 sixteens in that beat in another voice, we need to separate the 2 eights so they are aligned with
    // the corresponding sixteens of the other voice
    // BeatGraphNeeds gives all the information we need to draw the notes/rests of a beat in a voice,
    // we don't need to know anything else about the other voices
    private getBeatGraphicNeeds(bar: Bar, beat: number): BeatGraphNeeds {
        const beatDurationInTicks = 96 * 4 / bar.timeSignature.denominator
        let startOfBeat = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        let endOfBeat = startOfBeat + beatDurationInTicks
        let noteStartsInBeat = this.allNoteStarts
            .filter(e => e >= startOfBeat && e < endOfBeat).map(n => n - startOfBeat)

        return new BeatGraphNeeds(bar.barNumber, beat, noteStartsInBeat)

    }


    // bar is the bar number, that is 1 for the first bar of the song
    // x is the coordinate in pixels where we must start drawing
    private drawBar(bar: Bar, x: number): number {
        const timeSig = bar.timeSignature
        const totalBeats = timeSig.numerator
        let deltaX = 0

        if (StaffElements.mustDrawTimeSignature(bar.barNumber, this.bars))
            deltaX += StaffElements.drawTimeSignature(this.svgBox, x + deltaX, timeSig)

        for (let beat = 1; beat <= totalBeats; beat++) {
            const beatGraphNeeds = this.getBeatGraphicNeeds(bar, beat)
            deltaX += StaffElements.drawBeat(this.svgBox, x + deltaX, bar, beat, beatGraphNeeds, this.eventsToDraw)
        }
        deltaX += StaffElements.drawBarLine(this.svgBox, x + deltaX)
        StaffElements.drawBarNumber(this.svgBox, x + deltaX / 2 - 10, bar.barNumber)
        return deltaX
    }





    // private drawBeat(x: number, bar: Bar, beat: number): number {
    //     const timeSig = bar.timeSignature
    //     const beatDurationInTicks = 96 * timeSig.denominator / 4
    //     const beatStartTick = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
    //     const beatEndTick = beatStartTick + beatDurationInTicks
    //     const beatGraphNeeds = this.getBeatGraphicNeeds(bar, beat)
    //     const beatEvents = this.eventsToDraw
    //         .filter(e => e.startTick >= beatStartTick && e.startTick < beatEndTick)
    //         .sort((e1, e2) => e1.startTick - e2.startTick)

    //     for (const e of beatEvents) {
    //         let g = document.createElementNS(this.svgns, 'g')
    //         this.svgBox.appendChild(g)
    //         let deltaX = DrawingCalculations.calculateXofEventInsideBeat(e, beatGraphNeeds, beatStartTick)
    //         if (e.duration == NoteDuration.unknown) console.log(e)
    //         if (e.type == SoundEventType.note) {
    //             // if (beatEvents.length == 1) 
    //             StaffElements.drawSingleNote(g, e.duration, x + deltaX)
    //             // else
    //             //      StaffElements.drawBasicNote(g, x + deltaX)
    //         }
    //         else {
    //             StaffElements.drawRest(g, e.duration, x + deltaX)
    //         }
    //     }
    //     return DrawingCalculations.calculateWidthInPixelsOfBeat(beatGraphNeeds)
    // }


    // private calculateWidthInPixelsOfBeat(beatGraphNeeds: BeatGraphNeeds) {
    //     if (!beatGraphNeeds || beatGraphNeeds.EventsStartTickFromBeginningOfBeat.length == 0)
    //         return 0
    //     return beatGraphNeeds.EventsStartTickFromBeginningOfBeat.length * this.standardWidth
    // }

    // Generates the sequence of notes and rests that will need to be drawn for this voice
    // private getEventsToDraw(): SoundEvent[] {
    //     const tolerance = 6
    //     let soundEvents = <SoundEvent[]>[]
    //     let endOfLastComputedNote = 0
    //     for (const n of this.voiceNotes) {
    //         const currentBar = this.getBarOfTick(endOfLastComputedNote)
    //         if (endOfLastComputedNote + tolerance < n.startSinceBeginningOfSongInTicks) {
    //             const eventDuration = this.getEventDuration(endOfLastComputedNote, n.startSinceBeginningOfSongInTicks)
    //             let event = new SoundEvent(SoundEventType.silence, currentBar, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks, eventDuration)
    //             soundEvents.push(event)
    //             endOfLastComputedNote = n.startSinceBeginningOfSongInTicks
    //         }
    //         const noteBar = this.getBarOfTick(n.startSinceBeginningOfSongInTicks)
    //         const eventDuration = this.getEventDuration(n.startSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks)
    //         soundEvents.push(new SoundEvent(SoundEventType.note, noteBar, n.startSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks, eventDuration))
    //         endOfLastComputedNote = n.endSinceBeginningOfSongInTicks
    //     }
    //     let standadizedEvents = this.standardizeSequenceOfNotesAndRests(soundEvents)

    //     // remove undefined items. Not sure why there are sometimes undefined items
    //     return standadizedEvents.filter(item => item)
    // }
    // private getEventDuration(startTick: number, endTick: number) {
    //     const bar = this.getBarOfTick(startTick)
    //     const timeSignature = this.bars[bar - 1].timeSignature
    //     const beatDurationInTicks = timeSignature.denominator / 4 * 96
    //     const eventDurationInTicks = endTick - startTick
    //     if (timeSignature.denominator == 2) {
    //         if (eventDurationInTicks == 2 * beatDurationInTicks) return NoteDuration.whole
    //         if (eventDurationInTicks == beatDurationInTicks) return NoteDuration.half
    //         if (2 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.quarter
    //         if (4 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.eight
    //         if (8 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.sixteenth
    //         if (16 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.thirtysecond
    //         if (32 * eventDurationInTicks <= beatDurationInTicks) return NoteDuration.sixtyfourth
    //     }
    //     if (timeSignature.denominator == 4) {
    //         if (eventDurationInTicks == 4 * beatDurationInTicks) return NoteDuration.whole
    //         if (eventDurationInTicks == 2 * beatDurationInTicks) return NoteDuration.half
    //         if (eventDurationInTicks == beatDurationInTicks) return NoteDuration.quarter
    //         if (2 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.eight
    //         if (4 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.sixteenth
    //         if (8 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.thirtysecond
    //         if (16 * eventDurationInTicks <= beatDurationInTicks) return NoteDuration.sixtyfourth
    //     }
    //     else if (timeSignature.denominator == 8) {
    //         if (eventDurationInTicks == 4 * beatDurationInTicks) return NoteDuration.half
    //         if (eventDurationInTicks == 2 * beatDurationInTicks) return NoteDuration.quarter
    //         if (eventDurationInTicks == beatDurationInTicks) return NoteDuration.eight
    //         if (2 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.sixteenth
    //         if (4 * eventDurationInTicks == beatDurationInTicks) return NoteDuration.thirtysecond
    //         if (8 * eventDurationInTicks <= beatDurationInTicks) return NoteDuration.sixtyfourth
    //     }
    //     return NoteDuration.unknown
    // }

    // We want to have a global view regadless of which track we are drawing of the ticks where there is note
    // starting or there is a bar starting. We need this information to align the drawings of the different tracks
    // so notes that start in the same tick are shown in the same vertical
    // private getAllNoteStarts(): number[] {
    //     let startNotesSet = new Set<number>()
    //     this.songNotes.forEach(n => startNotesSet.add(n.startSinceBeginningOfSongInTicks))

    //     // we add now the start of the bars
    //     this.bars.forEach(b => startNotesSet.add(b.ticksFromBeginningOfSong))
    //     return Array.from(startNotesSet)
    // }

    // Returns the bar number (starting from 1) where the tick is located
    // Because the first bar is 1, the tick is inside bars[barNumber-1], not bars[barNumber]
    // private getBarOfTick(tick: number): number {
    //     return this.bars.filter(b => b.ticksFromBeginningOfSong <= tick).length
    // }
    // A rest can be divided in a sequence of rests. For example if a rest extends to the next bar, we split it
    // in 2, one that ends with the first bar and one that starts with the second.
    // If a rest is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the rests start in the hardest bit
    // The same with the notes
    // private standardizeSequenceOfNotesAndRests(input: SoundEvent[]): SoundEvent[] {
    //     let retObj = this.splitEventsThatExtendToNextBar(input)
    //     return this.splitEventsThatHaveOddDurations(retObj)

    // }

    // private splitEventsThatExtendToNextBar(input: SoundEvent[]): SoundEvent[] {
    //     let retObj = <SoundEvent[]>[]
    //     for (const e of input) {
    //         const startBar = this.bars.filter(b => b.ticksFromBeginningOfSong <= e.startTick).length
    //         const endBar = this.bars.filter(b => b.ticksFromBeginningOfSong < e.endTick).length

    //         if (endBar > startBar) {
    //             let splitPoints = <number[]>[]
    //             // the event can extend for more than 2 bars. Add one event at the end of each
    //             for (let i = startBar; i < endBar; i++) {
    //                 // startBar and endBar are indexes that start in 1, not in 0 as is usual in javascript arrays
    //                 // so bars[startBar] is actually the bar startBar+1
    //                 splitPoints.push(this.bars[i].ticksFromBeginningOfSong)
    //             }
    //             const splitEvents = this.splitEvent(e, splitPoints)
    //             splitEvents.forEach(e => retObj.push(e))
    //         }
    //         else
    //             retObj.push(e)
    //     }
    //     return retObj
    // }
    // When we want to split a sound event in many, for ex. because the event extends from one bar to the next, we
    // call this function and we pass the points where we want to split the event (it could for ex. extend several bars,
    // not just 2) and it returns a sequence of events that correspond to the split points we passed
    // The first event returned has a isTiedToPrevious value of false, and all the rest of true
    // private splitEvent(e: SoundEvent, splitPoints: number[]): SoundEvent[] {
    //     // In case we don't have actually to split anyting because there are no split points,
    //     // return the event as an array of events
    //     if (!splitPoints || splitPoints.length == 0)
    //         return [e]
    //     let retObj = <SoundEvent[]>[]
    //     let lastStartPoint = e.startTick
    //     for (const p of splitPoints) {
    //         const eventDuration = this.getEventDuration(lastStartPoint, p)
    //         retObj.push(new SoundEvent(e.type, e.bar, lastStartPoint, p, eventDuration, lastStartPoint == e.startTick ? false : true))
    //         lastStartPoint = p
    //     }
    //     const eventDuration = this.getEventDuration(lastStartPoint, e.endTick)
    //     retObj.push(new SoundEvent(e.type, e.bar, lastStartPoint, e.endTick, eventDuration, true))
    //     return retObj
    // }

    // If a silence is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    // The same with the notes
    // private splitEventsThatHaveOddDurations(input: SoundEvent[]): SoundEvent[] {
    //     let retObj = <SoundEvent[]>[]
    //     for (const e of input) {
    //         retObj = retObj.concat(this.normalizeInterval(e))
    //     }
    //     return retObj
    // }

    // We want all intervals of notes and rests to be a full quarter, or eight, etc and not a quarter and a half,
    // or stil worse a quarter plus an eight plus a sixteenth
    // This function splits a quarter and a half in 2 notes, a quarter plus an eight plus a sixteenth in 3, in such
    // a way tat all durations returned are a full interval and not a mix of intervals
    // We have to consider the case where the bar has triplets
    // private normalizeInterval(e: SoundEvent): SoundEvent[] {
    //     // the following  line is needed because of typescript/javascript limitations
    //     e = new SoundEvent(e.type, e.bar, e.startTick, e.endTick, e.duration, e.isTiedToPrevious, e.isAccented)
    //     const timeSig = this.bars[e.bar - 1].timeSignature
    //     const beatDuration = 96 * timeSig.numerator / 4
    //     const barHasTriplets = this.bars[e.bar - 1].hasTriplets

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
    //             const splitPoint = [this.getSplitPoint(e)]
    //             const splittedEvent = this.splitEvent(e, splitPoint)
    //             // we call it recursively, because one of the subdivisions may be odd as well
    //             // like when we have a rest that is a quarter plus an eight plus a sixteenth
    //             const left = this.normalizeInterval(splittedEvent[0])
    //             const right = this.normalizeInterval(splittedEvent[1])
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
    // private getSplitPoint(e: SoundEvent): number {
    //     let divisions: number[]
    //     const bar = this.bars[e.bar - 1]
    //     const barHasTriplets = bar.hasTriplets
    //     if (barHasTriplets)
    //         divisions = [1 / 2, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32]
    //     else
    //         divisions = [1 / 2, 1, 2, 3, 4, 6, 8, 16, 32]

    //     // we find the longest interval that is the length of a quarter subdivision
    //     // that is shorter than the event
    //     // Then we find the point between startTick and endTick that is a multiplier
    //     // of that interval
    //     for (const d of divisions) {
    //         const intervalInTicks = this.ticksPerQuarterNote / d
    //         if (e.durationInTicks > intervalInTicks) {
    //             const barStart = bar.ticksFromBeginningOfSong
    //             const k1 = (e.startTick - barStart) % intervalInTicks
    //             const k2 = (e.endTick - barStart) % intervalInTicks
    //             if (k2 > 0)
    //                 return e.endTick - k2
    //             else
    //                 return e.startTick + (intervalInTicks - k1)
    //         }
    //     }
    // }

    // // We draw the time signature in a bar if it is the first bar or if the time signature is different from the
    // // previous bar
    // private mustDrawTimeSignature(bar: Bar): boolean {
    //     if (bar.barNumber == 1) return true
    //     const previousTimeSig = this.bars[bar.barNumber - 1].timeSignature
    //     const currentTimeSig = bar.timeSignature
    //     if (previousTimeSig.numerator == currentTimeSig.numerator &&
    //         previousTimeSig.denominator == currentTimeSig.denominator)
    //         return false
    //     return true
    // }
    // // Returns the space it took in the drawing
    // private drawTimeSignature(x: number, timeSignature: TimeSignature): number {
    //     StaffElements.createText(this.svgBox, timeSignature.numerator.toString(), x + 10, 40, 20, 'black')
    //     StaffElements.createText(this.svgBox, timeSignature.denominator.toString(), x + 10, 80, 20, 'black')
    //     return 50
    // }
    // If we have a note starting in tick 0 and another starting in tick 2, they actually are supposed to start
    // at the same time. So we want to discretize the notes in a way where all notes that should start together
    // start exactly in the same tick
    // This method aproximates the start to the biggest subdivision it can make of the beat, without going too
    // far from the note current start tick
    // private normalizeNoteStart(note: Note): Note {
    //     const tolerance = 3
    //     const barOfNote = this.getBarOfNote(note)
    //     const timeSig = barOfNote.timeSignature
    //     const beatDuration = this.ticksPerQuarterNote * timeSig.denominator / 4
    //     let beatStart: number
    //     for (let i = timeSig.numerator - 1; i >= 0; i--) {
    //         if (barOfNote.ticksFromBeginningOfSong + i * beatDuration <= note.startSinceBeginningOfSongInTicks) {
    //             beatStart = barOfNote.ticksFromBeginningOfSong + i * beatDuration
    //             break
    //         }
    //     }

    //     let normalizedStart = this.normalizePoint(note.startSinceBeginningOfSongInTicks, beatDuration,
    //         tolerance, barOfNote.hasTriplets, beatStart)

    //     return new Note(note.id, note.pitch, note.volume, normalizedStart, note.endSinceBeginningOfSongInTicks, note.isPercussion,
    //         note.voice, note.PitchBending, note.instrument)
    // }
    // private normalizePoint(point: number, beatDuration: number, tolerance: number, hasTriplets: boolean, beatStart: number) {
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
    //     console.log("sali por donde no debo")
    //     console.log(`point ${point}  beatStart ${beatStart}  beatDuration ${beatDuration}`)
    // }

    // private getBarOfNote(n: Note): Bar {
    //     for (let i = 0; i < this.bars.length; i++) {
    //         if (this.bars[i].ticksFromBeginningOfSong <= n.startSinceBeginningOfSongInTicks &&
    //             (i == this.bars.length - 1 || this.bars[i + 1].ticksFromBeginningOfSong > n.startSinceBeginningOfSongInTicks))
    //             return this.bars[i]
    //     }
    //     return null
    // }
    // When we draw for example a sixteenth inside a beat, we have to align it with other notest played in the
    // same beat in other voices. So for example if the sixteenth is the second in a group of 4, any note
    // played in another voice at the same time as this sixteenth, should have the same x coordinate
    // the x returned is a fraction of the total display width of the beat. For example if we have the second
    // sixteenth as before, we should return 1/4
    // private calculateXofEventInsideBeat(event: SoundEvent, beatGraphNeeds: BeatGraphNeeds, beatStart: number): number {
    //     const eventsBeforeThisOne = beatGraphNeeds.EventsStartTickFromBeginningOfBeat.filter(e => e < event.startTick - beatStart)
    //     if (!eventsBeforeThisOne || eventsBeforeThisOne.length == 0)
    //         return 0
    //     return this.standardWidth * eventsBeforeThisOne.length
    // }
}
