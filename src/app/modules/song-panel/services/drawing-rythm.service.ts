import { Injectable } from '@angular/core'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { Song } from 'src/app/core/models/song'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { TimeSignature } from 'src/app/core/models/time-signature'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'
import { Note } from 'src/app/core/models/note'
import { Fraction } from 'src/app/core/models/fraction'
import { Bar } from 'src/app/core/models/bar'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'
    svgBox: HTMLElement
    ticksPerQuarterNote = 96
    song: Song
    simplification: SongSimplification
    standardSeparation = 32 // Represents the distance in pixels between 2 notes, 2 rests or a note and a rest
    beats: BeatGraphNeeds[] // Represents the information we need about each beat to draw the notes and rests of that beat
    bars: Bar[]             // Info include the start and end tick and the time signature of each bar of the song
    songNotes: Note[]
    voiceNotes: Note[]
    isPercusion: boolean
    eventsToDraw: SoundEvent[]  // Represents all the notes and rests we have to draw

    separation = 50
    tolerance = 8   // when we consider some interval to be a quarter, it could have for ex. 93 ticks intead of the 96
    // tolerance represents the max we tolerate for a duration to differ from 96 ticks 
    standardWidth: number   // represents the width of a note or a silence symbol. We keep a variable that has the x coordinate
    // where we will insert the next symbol, and we increase it by this value after inserting one
    barSeparationInPixels: number
    timeSignature: TimeSignature
    barLengthInTicks: number



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
        this.song = song
        this.simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        this.bars = song.bars
        this.songNotes = this.simplification.notes.map(n => this.normalizeNoteStart(n))
        this.isPercusion = this.simplification.isVoicePercusion(voice)
        this.voiceNotes = this.simplification.getNotesOfVoice(voice, song, fromBar, toBar)
        this.eventsToDraw = this.getEventsToDraw()
        // let x = 0
        // for (const bar of this.bars)
        //     x += this.drawBar(bar, x)


        // De aca para abajo se van al carajo

        // const svgBox = document.getElementById(svgBoxId)
        // if (!svgBox) {
        //     return
        // }

        // const notes = this.simplification.getNotesOfVoice(voice, song, fromBar, toBar)

        // this.timeSignature = song.songStats.timeSignature

        // this.barLengthInTicks = this.ticksPerQuarterNote * this.timeSignature.numerator * 4 / this.timeSignature.denominator
        // this.barSeparationInPixels = this.ticksPerQuarterNote * 1.3 * this.timeSignature.numerator
        // this.standardWidth = this.barLengthInTicks / 12


        // return this.drawNotes(svgBox, song, voice, simplificationNo, fromBar, toBar) / 10
    }

    private clearSVGbox(svgBox: HTMLElement) {
        while (svgBox.firstChild) {
            svgBox.removeChild(svgBox.firstChild)
        }
    }

    // Before we draw the notes and rests for a beat in a vlice of the song, we need to see what happens
    // in that beat in all voices. For example if we have 2 eights in a beat in a voice, but we have
    // 4 sixteens in that beat in another voice, we need to separate the 2 eights so they are aligned with
    // the corresponding sixteens of the other voice
    // BeatGraphNeeds gives all the information we need to draw the notes/rests of a beat in a voice,
    // we don't need to know anything else about the other voices
    private getBeatsGraphicNeeds(bar: Bar, beat: number): BeatGraphNeeds {
        const beatDurationInTicks = 96 * 4 / bar.timeSignature.denominator
        let startOfBeat = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        let endOfBeat = startOfBeat + beatDurationInTicks
        let notesOfBeat = this.songNotes
            .filter(n => n.startSinceBeginningOfSongInTicks < endOfBeat &&
                n.endSinceBeginningOfSongInTicks > startOfBeat)
        const cutPoints = this.getStartPointsOfBeat(notesOfBeat, startOfBeat, endOfBeat)
        return new BeatGraphNeeds(bar.barNumber, beat, cutPoints)

    }
    // Finds the ticks inside a beat where notes or rests start
    private getStartPointsOfBeat(notes: Note[], beatStart: number, beatEnd: number): number[] {
        let retObj = new Set<number>()
        // Add start of notes
        notes.forEach(n => {
            if (n.startSinceBeginningOfSongInTicks >= beatStart)
                retObj.add(n.startSinceBeginningOfSongInTicks - beatStart)
        })
        // Add rests
        const tolerance = 4
        for (let i = 0; i < notes.length - 1; i++) {
            if (notes[i].endSinceBeginningOfSongInTicks + tolerance < notes[i + 1].startSinceBeginningOfSongInTicks)
                retObj.add(notes[i].endSinceBeginningOfSongInTicks - beatStart)
        }
        return this.normalizeStartPoints(Array.from(retObj), beatEnd - beatStart)

    }
    // We want points that have values like  1/2, 2/3, etc
    private normalizeStartPoints(points: number[], beatDuration: number): number[] {
        let retObj: number[] = []
        // tolerance is the maximum distance that 2 points can be appart and still represent the same point
        // it depends on the number of points, because if we have in a beat 8 thirtyseconds, then the distance
        // between them can be short, but they are still different notes. But if we have 2 notes in the beat
        // we don't expect any of them to be a thirtysecond.
        const tolerance = beatDuration / (points.length * 4)
        for (let point of points) {
            for (let [i, j] of [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8],
            [1, 12], [5, 12], [7, 12], [11, 12], [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
            [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
            [25, 32], [27, 32], [29, 32], [31, 32]])
                if (point > i / j * beatDuration - tolerance && point < i / j * beatDuration + tolerance)
                    retObj.push(Math.round(beatDuration * i / j))
        }
        return retObj
    }
    // If we have a note starting in tick 0 and another starting in tick 2, they actually are supposed to start
    // at the same time. So we want to discretize the notes in a way where all notes that should start together
    // start exactly in the same tick
    // This method aproximates the start to the biggest subdivision it can make of the beat, without going too
    // far from the note current start tick
    private normalizeNoteStart(note: Note): Note {

        const tolerance = note.durationInTicks / 6
        let retObj = new Note(note.id, note.pitch, note.volume, note.startSinceBeginningOfSongInTicks,
            note.endSinceBeginningOfSongInTicks, note.isPercussion, note.voice, note.PitchBending, note.instrument)
        const barOfNote = this.getBarOfNote(note)
        const timeSig = barOfNote.timeSignature
        const beatDuration = this.ticksPerQuarterNote * timeSig.denominator / 4
        let beatStart: number
        for (let i = timeSig.numerator - 1; i >= 0; i--) {
            if (barOfNote.ticksFromBeginningOfSong + i * beatDuration < note.startSinceBeginningOfSongInTicks) {
                beatStart =barOfNote.ticksFromBeginningOfSong + i * beatDuration 
                break
            }
        }

        for (let [i, j] of [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [5, 6], [1, 8], [3, 8], [5, 8], [7, 8],
        [1, 12], [5, 12], [7, 12], [11, 12], [1, 16], [3, 16], [5, 16], [7, 16], [9, 16], [11, 16], [13, 16], [15, 16],
        [1, 32], [3, 32], [5, 32], [7, 32], [9, 32], [11, 32], [13, 32], [15, 32], [17, 32], [19, 32], [21, 32], [23, 32],
        [25, 32], [27, 32], [29, 32], [31, 32]])
            if (note.startSinceBeginningOfSongInTicks - beatStart > i / j * beatDuration - tolerance &&
                note.startSinceBeginningOfSongInTicks - beatStart < i / j * beatDuration + tolerance)
                note.startSinceBeginningOfSongInTicks = beatStart + Math.round(beatDuration * i / j)

        return retObj
    }

    private getBarOfNote(n: Note): Bar {
        for (let i = 0; i < this.bars.length; i++) {
            if (this.bars[i].ticksFromBeginningOfSong <= n.startSinceBeginningOfSongInTicks &&
                (i == this.bars.length - 1 || this.bars[i + 1].ticksFromBeginningOfSong > n.startSinceBeginningOfSongInTicks))
                return this.bars[i]
        }
        return null
    }

    // bar is the bar number, that is 1 for the first bar of the song
    // x is the coordinate in pixels where we must start drawing
    private drawBar(bar: Bar, x: number): number {
        const timeSig = bar.timeSignature
        const totalBeats = timeSig.numerator
        if (this.mustDrawTimeSignature(bar))
            x += this.drawTimeSignature(x, timeSig)

        for (let beat = 1; beat <= totalBeats; beat++)
            x += this.drawBeat(x, bar, beat)

        this.drawBarLine(x)
        return x
    }

    // We draw the time signature in a bar if it is the first bar or if the time signature is different from the
    // previous bar
    private mustDrawTimeSignature(bar: Bar): boolean {
        if (bar.barNumber == 1) return true
        const previousTimeSig = this.bars[bar.barNumber - 1].timeSignature
        const currentTimeSig = bar.timeSignature
        if (previousTimeSig.numerator == currentTimeSig.numerator &&
            previousTimeSig.denominator == currentTimeSig.denominator)
            return false
        return true
    }
    // Returns the space it took in the drawing
    private drawTimeSignature(x: number, timeSignature: TimeSignature): number {
        this.createText(this.svgBox, timeSignature.numerator.toString(), x + 10, 40, 20, 'black')
        this.createText(this.svgBox, timeSignature.denominator.toString(), x + 10, 80, 20, 'black')
        return 50
    }

    // We draw beat by beat. This is because when we have multiple notes in a beat, like 4 sixteens, we have to draw
    // a beam that connects them together. But if we have 8 sixteens in 2 consecutive beats, we connect the first 4
    // and the second 4, we don't connect the 8 together    
    private drawBeat(x: number, bar: Bar, beat: number): number {
        const timeSig = bar.timeSignature
        const beatDurationInTicks = 96 * timeSig.denominator / 4
        const startTick = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        const endTick = startTick + beatDurationInTicks
        const beatGraphNeeds = this.getBeatsGraphicNeeds(bar, beat)
        const beatEvents = this.eventsToDraw
            .filter(e => e.startTick >= startTick && e.endTick <= endTick)
            .sort((e1, e2) => e2.startTick - e1.startTick)

        for (const e of beatEvents) {

        }
        return 0
    }
    // When we draw for example a sixteenth inside a beat, we have to align it with other notest played in the
    // same beat in other voices. So for example if the sixteenth is the second in a group of 4, any note
    // played in another voice at the same time as this sixteenth, should have the same x coordinate
    // the x returned is a fraction of the total display width of the beat. For example if we have the second
    // sixteenth as before, we should return 1/4
    private calculateXofEventInsideBeat(event: SoundEvent, beatGraphNeeds: BeatGraphNeeds) {
        const totalEventsToDrawInBeat = beatGraphNeeds.EventsStartTickFromBeginningOfBeat.length
        const eventsBeforeThisOne = beatGraphNeeds.EventsStartTickFromBeginningOfBeat.filter(e => e < event.startTick)
    }

    // Generates the sequence of notes and rests that will need to be drawn for this voice
    private getEventsToDraw(): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        const tolerance = 8
        let endOfLastComputedNote = 0
        for (const n of this.voiceNotes) {
            const currentBar = this.getBarOfTick(endOfLastComputedNote)
            if (endOfLastComputedNote < n.startSinceBeginningOfSongInTicks - tolerance) {
                let event = new SoundEvent(SoundEventType.silence, currentBar, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks)

                retObj.push(event)
                endOfLastComputedNote = n.startSinceBeginningOfSongInTicks
            }
            const noteBar = this.getBarOfTick(n.startSinceBeginningOfSongInTicks)
            retObj.push(new SoundEvent(SoundEventType.note, noteBar, n.startSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks))
            endOfLastComputedNote = n.endSinceBeginningOfSongInTicks
        }
        let standadizedEvents = this.standardizeSequenceOfNotesAndRests(retObj)

        // remove undefined items. Not sure why there are sometimes undefined items
        return standadizedEvents.filter(item => item)
    }

    // Returns the bar number (starting from 1) where the tick is located
    // Because the first bar is 1, the tick is inside bars[barNumber-1], not bars[barNumber]
    private getBarOfTick(tick: number): number {
        return this.bars.filter(b => b.ticksFromBeginningOfSong <= tick).length
    }
    // A rest can be divided in a sequence of rests. For example if a rest extends to the next bar, we split it
    // in 2, one that ends with the first bar and one that starts with the second.
    // If a rest is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the rests start in the hardest bit
    // The same with the notes
    private standardizeSequenceOfNotesAndRests(input: SoundEvent[]): SoundEvent[] {
        let retObj = this.splitEventsThatExtendToNextBar(input)
        return this.splitEventsThatHaveOddDurations(retObj)
    }

    private splitEventsThatExtendToNextBar(input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        const tolerance = 6
        for (const e of input) {
            const startBar = this.bars.filter(b => b.ticksFromBeginningOfSong <= e.startTick + tolerance).length
            const endBar = this.bars.filter(b => b.ticksFromBeginningOfSong <= e.endTick - tolerance).length

            if (endBar > startBar) {
                let splitPoints = <number[]>[]
                // the event can extend for more than 2 bars. Add one event at the end of each
                for (let i = startBar; i < endBar; i++) {
                    // startBar and endBar are indexes that start in 1, not in 0 as is usual in javascript arrays
                    // so bars[startBar] is actually the bar startBar+1
                    splitPoints.push(this.bars[startBar].ticksFromBeginningOfSong)
                }
                const splitEvents = this.splitEvent(e, splitPoints)
                splitEvents.forEach(e => retObj.push(e))
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
    private splitEvent(e: SoundEvent, splitPoints: number[]): SoundEvent[] {
        // In case we don't have actually to split anyting because there are no split points,
        // return the event as an array of events
        if (!splitPoints || splitPoints.length == 0)
            return [e]
        let retObj = <SoundEvent[]>[]
        let lastStartPoint = e.startTick
        for (const p of splitPoints) {
            retObj.push(new SoundEvent(e.type, e.bar, lastStartPoint, p, lastStartPoint == e.startTick ? false : true))
            lastStartPoint = p
        }
        retObj.push(new SoundEvent(e.type, e.bar, lastStartPoint, e.endTick, true))
        return retObj
    }

    // If a silence is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    // The same with the notes
    private splitEventsThatHaveOddDurations(input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (const e of input) {
            retObj = retObj.concat(this.normalizeInterval(e))
        }
        return retObj
    }

    // We want all intervals of notes and rests to be a full quarter, or eight, etc and not a quarter and a half,
    // or stil worse a quarter plus an eight plus a sixteenth
    // This function splits a quarter and a half in 2 notes, a quarter plus an eight plus a sixteenth in 3, in such
    // a way tat all durations returned are a full interval and not a mix of intervals
    // We have to consider the case where the bar has triplets
    private normalizeInterval(e: SoundEvent): SoundEvent[] {
        const tolerance = 8
        // the following  line is needed because of typescript/javascript limitations
        e = new SoundEvent(e.type, e.bar, e.startTick, e.endTick, e.isTiedToPrevious, e.isAccented)
        const timeSig = this.bars[e.bar - 1].timeSignature
        const beatDuration = 96 * timeSig.numerator / 4
        const barHasTriplets = this.bars[e.bar - 1].hasTriplets

        let points: number[]
        if (barHasTriplets)
            points = [1 / 4, 1 / 2, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32]
        else
            points = [1 / 4, 1 / 2, 1, 2, 4, 8, 16, 32]
        for (const i of points) {
            // if the event has a duration that is a whole quarter, an eight, a sixteenth, etc. return it
            if ((e.duration > (beatDuration / i - tolerance) * i &&
                e.duration < (beatDuration / i + tolerance) * i) ||
                e.duration < 5) {
                return [e]
            }
            else {
                // the note has an odd interval, so we split it in 2
                const splitPoint = [this.getSplitPoint(e)]
                const splittedEvent = this.splitEvent(e, splitPoint)
                // we call it recursively, because one of the subdivisions may be odd as well
                // like when we have a rest that is a quarter plus an eight plus a sixteenth
                const left = this.normalizeInterval(splittedEvent[0])
                const right = this.normalizeInterval(splittedEvent[1])
                return left.concat(right)
            }
        }
    }
    // When we want to split a note or rest in 2, we prefer to select intervals that start and stop in 
    // whole divisions of beats. For example if a note duration is a quarter + an eight
    // and starts in tick 0, we will split it in a quarter and an eight, but if it starts in tick
    // 48, we would split it in an eight and a quarter 
    // This function finds the point inside an interval where it makes more sense to split the note
    private getSplitPoint(e: SoundEvent): number {
        let divisions: number[]
        const bar = this.bars[e.bar - 1]
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
            if (e.duration > intervalInTicks) {
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


    private drawBarLine(x: number): number {
        this.drawPath(this.svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
        return 50
    }






    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------

    private drawNotes(svgBox: HTMLElement, song: Song, voice: number, simplificationNo: number, fromBar: number, toBar: number): number {
        let x = 0
        x += this.drawTimeSignatureOld(svgBox, 0, song.songStats.timeSignature)

        console.log(`voice: ${voice}`)
        let events = this.getSequenceOfNotesAndSilences(song, simplificationNo, voice, fromBar, toBar)
        let index = 0
        let barLine = 0
        while (index < events.length) {
            let eventsToDrawTogether = this.getNextGroupToDrawTogehter(events, index, this.barLengthInTicks)
            x += this.drawEvents(svgBox, x, eventsToDrawTogether)
            index += eventsToDrawTogether.length
            const lastTick = eventsToDrawTogether.sort((a, b) => b.endTick - a.endTick)[0].endTick
            if (lastTick % this.barLengthInTicks == 0) {
                barLine += 1
                this.drawBarLineOld(svgBox, barLine * this.barSeparationInPixels)
                x = barLine * this.barSeparationInPixels + this.standardWidth
            }
        }

        return x
    }

    private drawBarLineOld(svgBox: HTMLElement, x: number): number {
        this.drawPath(svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
        return 50
    }

    // When we draw the events, there are cases where we have to draw together a group of notes:
    // - when we have consecutive eights, sixteenths, thirtyseconds, etc. in the same bar, we draw them together with a beam
    // - when we have a duration of a note that is something like a quarter and an eight, we draw them as 2 symbols with a tie
    private getNextGroupToDrawTogehter(events: SoundEvent[], eventStart: number, barLength: number): SoundEvent[] {
        // If it is a silence return it, we don't group silences when we draw them
        if (eventStart < events.length && events[eventStart].type == SoundEventType.silence) return new Array(events[eventStart])

        // See if we have ties to the next notes
        let i = 0
        while (eventStart + i + 1 < events.length && events[eventStart + i + 1].isTiedToPrevious) i++
        if (i > 0) return events.slice(eventStart, eventStart + i)

        // See if the next notes have the same type duration but don't cross a bar
        i = 0
        while (eventStart + i + 1 < events.length &&
            events[eventStart + i + 1].standardizedDuration == events[eventStart].standardizedDuration &&
            Math.floor(events[eventStart + i + 1].startTick / barLength) == Math.floor(events[eventStart].startTick / barLength))
            i++
        if (i > 0) return events.slice(eventStart, eventStart + i + 1)

        // draw as single note
        return new Array(events[eventStart])
    }

    private getSequenceOfNotesAndSilences(song: Song, simplificationNo: number, voice: number, fromBar: number, toBar: number): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        const tolerance = 10
        let startTick = song.bars[fromBar - 1].ticksFromBeginningOfSong
        let endOfLastComputedNote = 0
        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])
        // Look at end of previous bar to see if we have a note still playing from the previous bar
        if (fromBar > 1) {
            let latestNoteFromPreviousBar = simplif.notes
                .filter(x => x.voice == voice && x.startSinceBeginningOfSongInTicks < startTick)
                .sort((n1, n2) => n2.startSinceBeginningOfSongInTicks - n1.startSinceBeginningOfSongInTicks)[0]
            if (latestNoteFromPreviousBar.endSinceBeginningOfSongInTicks > startTick + tolerance) {
                let event = new SoundEvent(SoundEventType.note, 0, latestNoteFromPreviousBar.startSinceBeginningOfSongInTicks,
                    latestNoteFromPreviousBar.endSinceBeginningOfSongInTicks)
                retObj.push(event)
                endOfLastComputedNote = event.endTick
            }
        }
        const notes = simplif.getNotesOfVoice(voice, song, fromBar, toBar)
        for (let i = 0; i < notes.length; i++) {
            if (endOfLastComputedNote < notes[i].startSinceBeginningOfSongInTicks - tolerance) {
                let event = new SoundEvent(SoundEventType.silence, 0, endOfLastComputedNote, notes[i].startSinceBeginningOfSongInTicks)
                retObj.push(event)
                endOfLastComputedNote = notes[i].startSinceBeginningOfSongInTicks
            }
            retObj.push(new SoundEvent(SoundEventType.note, 0, notes[i].startSinceBeginningOfSongInTicks, notes[i].endSinceBeginningOfSongInTicks))
            endOfLastComputedNote = notes[i].endSinceBeginningOfSongInTicks
        }
        let standadizedEvents = this.standardizeSequenceOfNotesAndSilences(retObj, this.barLengthInTicks)

        // remove undefined items
        return standadizedEvents.filter(item => item)
    }

    // A silence can be divided in a sequence of silences. For example if a silence extends to the next bar, we split it
    // in 2, one that ends with the first bar and one that starts with the second.
    // If a silence is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    // The same with the notes
    private standardizeSequenceOfNotesAndSilences(input: SoundEvent[], barLength: number): SoundEvent[] {
        let retObj = this.splitEventsThatExtendToNextBarOld(input, barLength)
        return this.splitEventsThatHaveOddDurationsOld(retObj)
    }

    private splitEventsThatExtendToNextBarOld(input: SoundEvent[], barLength: number): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (let i = 0; i < input.length; i++) {
            const startBar = Math.floor((input[i].startTick + this.tolerance) / barLength)
            const endBar = Math.floor((input[i].endTick - this.tolerance) / barLength)

            const barDiff = endBar - startBar
            if (barDiff > 0) {
                let splitPoints = <number[]>[]
                for (let j = 0; j < barDiff; j++) {
                    splitPoints.push((startBar + j + 1) * barLength)
                }
                const splitEvents = this.splitEventOld(input[i], splitPoints)
                splitEvents.forEach(e => retObj.push(e))
            }
            else
                retObj.push(input[i])
        }
        return retObj
    }

    // If a silence is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    // The same with the notes
    private splitEventsThatHaveOddDurationsOld(input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (let i = 0; i < input.length; i++) {
            retObj = retObj.concat(this.normalizeIntervalOld(input[i]))
        }
        return retObj
    }

    // We want all intervals of notes and silences to be a full quarter, or eight, etc and not a quarter and a half,
    // or stil worse a quarter plus an eight plus a sixteenth
    // This function splits a quarter and a half in 2 notes, a quarter plus an eight plus a sixteenth in 3, in such
    // a way tat all durations returned are a full interval and not a mix of intervals
    private normalizeIntervalOld(e: SoundEvent, depht = 0): SoundEvent[] {
        // the following  line is needed because of typescript/javascript limitations
        e = new SoundEvent(e.type, 0, e.startTick, e.endTick, e.isTiedToPrevious, e.isAccented)

        for (let i = 16; i > 1 / 64; i = i / 2) {
            // if the note doesn't need to be split, return it
            if ((e.duration > (this.ticksPerQuarterNote - this.tolerance) * i &&
                e.duration < (this.ticksPerQuarterNote + this.tolerance) * i) ||
                e.duration <= 5) {
                return [e]
            }
            else {
                // if the notes has an odd interval
                if (e.duration > (this.ticksPerQuarterNote + this.tolerance) * i / 2 &&
                    e.duration < (this.ticksPerQuarterNote - this.tolerance) * i) {
                    const splitPoints = [this.getSplitPointOld(e)]
                    const splittedEvent = this.splitEventOld(e, splitPoints)
                    return this.normalizeIntervalOld(splittedEvent[0], depht + 1).concat(this.normalizeIntervalOld(splittedEvent[1], depht + 1))
                }
            }
        }

    }

    // When we want to split a note or silence in 2, we prefer to select intervals that start and stop in 
    // hard beats. This functions tries to find the point inside an interval where it makes more sense to
    // split a note
    private getSplitPointOld(e: SoundEvent): number {
        for (let n = this.ticksPerQuarterNote * 2; n > 3; n = n / 2) {
            if (e.duration > n) {
                const k1 = e.startTick % n
                const k2 = e.endTick % n
                if (k2 > 0)
                    return e.endTick - k2
                else
                    return e.startTick + (n - k1)
            }
        }
    }

    // When we want to split a sound event in many, for ex. because the event extends from one bar to the next, we
    // call this function and we pass the points where we want to split the event (it could for ex. extend several bars,
    // not just 2) and it returns a sequence of events that correspond to the split points we passed
    private splitEventOld(e: SoundEvent, splitPoints: number[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        let lastStartPoint = e.startTick
        for (let i = 0; i < splitPoints.length; i++) {
            retObj.push(new SoundEvent(e.type, 0, lastStartPoint, splitPoints[i], i == 0 ? false : true))
            lastStartPoint = splitPoints[i]
        }
        retObj.push(new SoundEvent(e.type, 0, lastStartPoint, e.endTick, true))
        return retObj
    }

    // The events parameter has one or more events of the same type. When we have 2 eights, for ex. we want to
    // draw them together with a beam connecting them. So instead of calling drawEvent() twice, one for each eigth,
    // we called once passing the 2 eights in the events parameter.
    // In the same way, if we have a silence for a time equivalent to 1 quarter and 1 eight, we make one call with 2
    // events of type silence, and 2 symbols connected with a tie
    private drawEvents(svgBox: HTMLElement, x: number, events: SoundEvent[]): number {
        const type = events[0].type
        let deltaX = 0
        if (type == SoundEventType.note) {
            if (this.areNotesTied(events)) {

                for (let i = 0; i < events.length; i++)
                    deltaX += this.drawNote(svgBox, events[i].standardizedDuration, x + deltaX, 1)
                this.drawTie(svgBox, x, x + deltaX - 20)
                return deltaX
            }
            else
                return this.drawNote(svgBox, events[0].standardizedDuration, x, events.length)
        }
        for (let i = 0; i < events.length; i++) {
            deltaX += this.drawRest(svgBox, events[i].standardizedDuration, x + deltaX)
        }
        return deltaX
    }

    // When we have consecutive notes to draw together there are 2 possibilites:
    // - they are several eights or sixteenths etc that have to be connected with a beam
    // - they represent one note that is drawed as different symbols with a tie, like a quarter and an eight with a tie
    // This function is used to differentiate between these 2 cases
    private areNotesTied(events: SoundEvent[]): boolean {
        if (events.length == 1) return false
        for (let i = 1; i < events.length; i++) {
            if (!events[i].isTiedToPrevious) return false
        }
        return true
    }

    private drawTimeSignatureOld(svgBox: HTMLElement, x: number, timeSignature: TimeSignature): number {
        this.createText(svgBox, timeSignature.numerator.toString(), x + 10, 40, 20, 'black')
        this.createText(svgBox, timeSignature.denominator.toString(), x + 10, 80, 20, 'black')
        return 50
    }


    private drawTie(svgBox: HTMLElement, x1: number, x2: number) {
        this.drawPath(svgBox, 'black', 2, `M ${x1},95 Q ${(x1 + x2) / 2},110 ${x2},95 z`)
        this.drawPath(svgBox, 'white', 7, `M ${x1},92 Q ${(x1 + x2) / 2},100 ${x2},92 z`)
    }


    private drawNote(svgBox: HTMLElement, type: NoteDuration, x: number, qty: number = 1): number {
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        for (let i = 0; i < qty; i++) {
            switch (type) {
                case NoteDuration.whole:
                    this.drawNoteCircle(group, x, false)
                    break;
                case NoteDuration.half:
                    this.drawCircleAndStem(group, x, false)
                    break;
                case NoteDuration.quarter:
                    this.drawCircleAndStem(group, x)
                    break;
                case NoteDuration.eight:
                    this.drawCircleAndStem(group, x + 20 * i)
                    if (i == qty - 1) this.drawSubStems(group, x, 1, qty)
                    break;
                case NoteDuration.sixteenth:
                    this.drawCircleAndStem(group, x + 20 * i)
                    if (i == qty - 1) this.drawSubStems(group, x, 2, qty)
                    break;
                case NoteDuration.thirtysecond:
                    this.drawCircleAndStem(group, x + 20 * i)
                    if (i == qty - 1) this.drawSubStems(group, x, 3, qty)
                    break;
                case NoteDuration.sixtyfourth:
                    this.drawCircleAndStem(group, x + 20 * i)
                    if (i == qty - 1) this.drawSubStems(group, x, 4, qty)
                    break;
            }
        }
        return this.standardWidth + (qty - 1) * 30
    }

    private drawRest(svgBox: HTMLElement, type: NoteDuration, x: number): number {
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        if (type == NoteDuration.whole) {
            for (let i = 0; i < 4; i++)
                this.drawQuarterRest(group, x + i * this.standardWidth)
            return 4 * this.standardWidth
        }
        if (type == NoteDuration.half) {
            this.drawQuarterRest(group, x)
            this.drawQuarterRest(group, x + this.standardWidth)
            return 2 * this.standardWidth
        }
        if (type == NoteDuration.quarter)
            this.drawQuarterRest(group, x)
        else {
            this.drawRestStem(group, x, type)
            this.drawRestSubStems(group, x, type)
        }
        return this.standardWidth
    }
    private drawRestStem(g: Element, x: number, type: NoteDuration) {
        const stem = document.createElementNS(this.svgns, 'path')
        stem.setAttributeNS(null, 'stroke', 'black')
        stem.setAttributeNS(null, 'stroke-width', '2')
        switch (type) {
            case NoteDuration.sixtyfourth:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46} ${x + 19},${82} z`); break
            case NoteDuration.thirtysecond:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46} ${x + 20},${81} z`); break
            case NoteDuration.sixteenth:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46} ${x + 21},${80} z`); break
            case NoteDuration.eight:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46} ${x + 22},${79} z`); break
        }
        g.appendChild(stem)
    }

    private drawRestSubStems(g: Element, x: number, type: NoteDuration) {
        switch (type) {
            case NoteDuration.sixtyfourth:
                this.drawRestCircle(g, x + 15, 72)
                this.drawRestArc(g, x + 15, 73, x + 22, 72)
            case NoteDuration.thirtysecond:
                this.drawRestCircle(g, x + 16, 64)
                this.drawRestArc(g, x + 17, 65, x + 24, 64)
            case NoteDuration.sixteenth:
                this.drawRestCircle(g, x + 17, 56)
                this.drawRestArc(g, x + 18, 57, x + 27, 56)
            case NoteDuration.eight:
                this.drawRestCircle(g, x + 18, 48)
                this.drawRestArc(g, x + 19, 49, x + 28, 48)
        }
    }
    private drawQuarterRest(g: Element, x: number) {
        this.drawPath(g, 'black', 12, `M ${8 + x},40 V 79 z`)
        this.drawPath(g, 'white', 5, `M ${x + 4},40 Q ${x + 8},50 ${x + 4},54 z`)
        this.drawPath(g, 'white', 6, `M ${x + 10},40  ${x + 18},52  z`)
        this.drawPath(g, 'white', 6, `M ${x + 16},54 Q ${x + 8},60 ${x + 18},70  z`)
        this.drawPath(g, 'white', 10, `M ${x - 4},54  ${x + 6},70  z`)
        this.drawPath(g, 'white', 6, `M ${x + 4},66  ${x + 4},80  z`)
        this.drawPath(g, 'black', 4, `M ${x + 14},72 Q ${x - 2},62 ${x + 10},80  z`)
        this.drawPath(g, 'white', 4, `M ${x + 14},75 Q ${x + 6},70 ${x + 12},79  z`)
        this.drawPath(g, 'white', 4, `M ${x + 16},66 V 80  z`)

    }

    private drawRestCircle(g: Element, x: number, y: number) {
        this.drawEllipse(g, x, y, 4, 4, 'black', 0, '', true)
    }
    private drawRestArc(g: Element, x1: number, y1: number, x2: number, y2: number) {
        this.drawPath(g, 'black', 2, `M${x1},${y1} Q ${(x1 + x2) / 2},${y1 + 4} ${x2},${y2} z`)
    }

    private drawNoteCircle(g: Element, x: number, isCircleFull = true) {
        this.drawEllipse(g, x + 13, 80, 7, 5, 'black', 2, `rotate(-25 ${x + 13} 80)`, isCircleFull)
    }

    private drawCircleAndStem(parent: Element, x: number, isCircleFull = true) {
        this.drawNoteCircle(parent, x, isCircleFull)
        this.drawStem(parent, x)
    }

    private drawStem(g: Element, x: number) {
        this.drawPath(g, 'black', 2, `M ${x + 19},40 V 78 z`)
    }

    private drawSubStems(g: Element, x: number, qtySubstems: number, qtyNotes: number) {
        if (qtyNotes == 1) {
            for (let i = 0; i < qtySubstems; i++) {
                this.drawPath(g, 'black', 1, `M${x + 10},${44 + 6 * i} Q ${x + 14},${47 + 6 * i} ${x + 19},${40 + 6 * i} z`)
            }
        }
        for (let i = 0; i < qtySubstems; i++) {
            this.drawPath(g, 'black', 2, `M${x + 19},${40 + 4 * i} L ${x + qtyNotes * 20},${40 + 4 * i} z`)
        }
    }

    private drawPath(g: Element, color: string, strokeWidth: number, path: string) {
        const arc = document.createElementNS(this.svgns, 'path')
        arc.setAttributeNS(null, 'stroke', color)
        arc.setAttributeNS(null, 'stroke-width', strokeWidth.toString())
        arc.setAttributeNS(null, 'd', path)
        g.appendChild(arc)
    }
    private drawEllipse(g: Element, cx: number, cy: number, rx: number, ry: number, color: string,
        strokeWidth: number, transform: string, isFilled: boolean) {
        const ellipse = document.createElementNS(this.svgns, 'ellipse')
        ellipse.setAttributeNS(null, 'cx', cx.toString())
        ellipse.setAttributeNS(null, 'cy', cy.toString())
        ellipse.setAttributeNS(null, 'rx', rx.toString())
        ellipse.setAttributeNS(null, 'ry', ry.toString())
        ellipse.setAttributeNS(null, 'stroke-width', strokeWidth.toString())
        ellipse.setAttributeNS(null, 'stroke', color)
        if (!isFilled) ellipse.setAttributeNS(null, 'fill', 'none')
        if (transform)
            ellipse.setAttributeNS(null, 'transform', transform)
        g.appendChild(ellipse)
    }
    private createText(
        g: Element,
        text: string,
        x: number,
        y: number,
        fontSize: number,
        color: string,
        textLength: number | null = null) {
        const textElement: any = document.createElementNS(this.svgns, 'text')
        const textNode = document.createTextNode(text)
        textElement.appendChild(textNode)
        textElement.setAttributeNS(null, 'x', x)
        textElement.setAttributeNS(null, 'y', y)
        textElement.setAttributeNS(null, 'font-size', fontSize.toString())
        if (textLength)
            textElement.setAttributeNS(null, 'textLength', textLength.toString())
        textElement.setAttributeNS(null, 'lengthAdjust', 'spacingAndGlyphs')
        textElement.setAttributeNS(null, 'fill', color)
        g.appendChild(textElement)
    }

    private setViewBox(g: Element, minX: number, minY: number, width: number, height: number) {
        g.setAttributeNS(null, 'viewBox', `${minX} ${minY} ${width} ${height}`)
    }

}