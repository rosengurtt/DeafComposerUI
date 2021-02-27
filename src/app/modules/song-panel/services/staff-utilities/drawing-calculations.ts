import { Song } from '../../../../core/models/song'
import { NoteDuration } from '../../../../core/models/note-duration'
import { SoundEvent } from '../../../../core/models/sound-event'
import { SoundEventType } from '../../../../core/models/sound-event-type.enum'
import { BeatGraphNeeds } from '../../../../core/models//beat-graph-needs'
import { Note } from '../../../../core/models/note'
import { SongSimplification } from '../../../../core/models/song-simplification'
import { Bar } from '../../../../core/models/bar'
import { Normalization } from './normalization'
import { GenericStaffDrawingUtilities } from './generic-staff-drawing-utilities'

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
        const voiceNotes = simplification.getNotesOfVoice(voice)
        if (voiceNotes[0].isPercussion) {
            return this.getEventsToDrawForPercussionVoice(song, simplificationNo, voice)
        }
        const tolerance = 10
        let soundEvents = <SoundEvent[]>[]
        let endOfLastComputedNote = 0
        // in this loop we add rest events when there are significant empty spaces between consecutive notes
        for (let i = 0; i < voiceNotes.length; i++) {
            let n = voiceNotes[i]
            let currentBar = GenericStaffDrawingUtilities.getBarOfTick(bars, endOfLastComputedNote)
            let endOfCurrentBar = currentBar < bars.length ? bars[currentBar].ticksFromBeginningOfSong : song.songStats.numberOfTicks

            // Get the bar in which the note is
            const noteBar = GenericStaffDrawingUtilities.getBarOfTick(bars, n.startSinceBeginningOfSongInTicks)

            // If there are several bars with no notes before n, then fill them with rests
            while (currentBar < noteBar) {
                const eventDuration = Normalization.getEventDuration(bars, endOfLastComputedNote, endOfCurrentBar)
                let event = new SoundEvent(SoundEventType.rest, null, currentBar, endOfLastComputedNote, endOfCurrentBar, eventDuration)
                soundEvents.push(event)
                endOfLastComputedNote = endOfCurrentBar
                currentBar++
                endOfCurrentBar = currentBar < bars.length ? bars[currentBar].ticksFromBeginningOfSong : song.songStats.numberOfTicks
            }

            // if there is a number of ticks greater than tolerance between the end of the previous note and this one
            // and we are not at the start of the beat, add a rest
            if (endOfLastComputedNote + tolerance < n.startSinceBeginningOfSongInTicks) {
                const eventDuration = Normalization.getEventDuration(bars, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks)
                let event = new SoundEvent(SoundEventType.rest, null, currentBar, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks, eventDuration)
                soundEvents.push(event)
                endOfLastComputedNote = n.startSinceBeginningOfSongInTicks
            }
            const eventDuration = Normalization.getEventDuration(bars, n.startSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks)
            soundEvents.push(new SoundEvent(SoundEventType.note, n.pitch, noteBar, n.startSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks, eventDuration))
            if (i < voiceNotes.length - 1)
                endOfLastComputedNote = this.getBestEndingTickForNote(n, voiceNotes[i + 1])
            else
                endOfLastComputedNote = n.endSinceBeginningOfSongInTicks
        }
        let standadizedEvents = this.standardizeSequenceOfNotesAndRests(bars, soundEvents)

        // remove undefined items. Not sure why there are sometimes undefined items
        return standadizedEvents.filter(item => item)
    }
    // Percussion voices are different
    // We consider that a percussion note has a duration that is the duration between its start time and the start time of the next
    // percussion note or the end of the bar, whoever comes first. 
    public static getEventsToDrawForPercussionVoice(song: Song, simplificationNo: number, voice: number): SoundEvent[] {
        const simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        const bars = song.bars
        const voiceNotes = simplification.getNotesOfVoice(voice)
        const tolerance = 10
        let soundEvents = <SoundEvent[]>[]
        let endOfLastComputedNote = 0
        // in this loop we add rest events when there are significant empty spaces between consecutive notes
        for (let i = 0; i < voiceNotes.length; i++) {
            let n = voiceNotes[i]
            let currentBar = GenericStaffDrawingUtilities.getBarOfTick(bars, endOfLastComputedNote)
            let endOfCurrentBar = currentBar < bars.length ? bars[currentBar].ticksFromBeginningOfSong : song.songStats.numberOfTicks

            // Get the bar in which the note is
            const noteBar = GenericStaffDrawingUtilities.getBarOfTick(bars, n.startSinceBeginningOfSongInTicks)

            // If there are several bars with no notes before n, then fill them with rests
            while (currentBar < noteBar) {
                const eventDuration = Normalization.getEventDuration(bars, endOfLastComputedNote, endOfCurrentBar)
                let event = new SoundEvent(SoundEventType.rest, null, currentBar, endOfLastComputedNote, endOfCurrentBar, eventDuration, null, null, true)
                soundEvents.push(event)
                endOfLastComputedNote = endOfCurrentBar
                currentBar++
                endOfCurrentBar = currentBar < bars.length ? bars[currentBar].ticksFromBeginningOfSong : song.songStats.numberOfTicks
            }
            // if there is a number of ticks greater than tolerance between the end of the previous note and this one
            // and we are not at the start of the beat, add a rest
            if (endOfLastComputedNote + tolerance < n.startSinceBeginningOfSongInTicks) {
                const eventDuration = Normalization.getEventDuration(bars, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks)
                let event = new SoundEvent(SoundEventType.rest, null, currentBar, endOfLastComputedNote, n.startSinceBeginningOfSongInTicks, eventDuration, null, null, true)
                soundEvents.push(event)
                endOfLastComputedNote = n.startSinceBeginningOfSongInTicks
            }

            const nextNote = voiceNotes.filter(x => x.startSinceBeginningOfSongInTicks > n.startSinceBeginningOfSongInTicks)
                .sort((a, b) => (a.startSinceBeginningOfSongInTicks < b.startSinceBeginningOfSongInTicks ? -1 : 1))[0]

            const endOfEvent = nextNote && nextNote.startSinceBeginningOfSongInTicks <= endOfCurrentBar ?
                nextNote.startSinceBeginningOfSongInTicks :
                endOfCurrentBar
            const eventDuration = Normalization.getEventDuration(bars, n.startSinceBeginningOfSongInTicks, endOfEvent)
            soundEvents.push(new SoundEvent(SoundEventType.note, n.pitch, noteBar, n.startSinceBeginningOfSongInTicks, endOfEvent, eventDuration, null, null, true))
            endOfLastComputedNote = endOfEvent
        }

        let standadizedEvents = this.standardizeSequenceOfNotesAndRests(bars, soundEvents)

        // remove undefined items. Not sure why there are sometimes undefined items
        return standadizedEvents.filter(item => item)
    }

    // When we have a situation when for ex. a quarter note was played with the 3/4 of its duration, we don't want to draw an
    // eight tied to a sixteenth and a sixteenth rest.
    // This function would detect such a case and return the endtick that corresponds to a whole quarter, so we can fix the
    // note length
    private static getBestEndingTickForNote(n: Note, nextNote: Note): number {
        // if there is no empty space between the notes, don't modify ending
        if ((nextNote.startSinceBeginningOfSongInTicks - n.endSinceBeginningOfSongInTicks) >= 0)
            return n.endSinceBeginningOfSongInTicks
        // if the ending is exactly on a beat tick or half a beat tick, don't modify it
        if (n.endSinceBeginningOfSongInTicks % 48 == 0)
            return n.endSinceBeginningOfSongInTicks
        // find the tick just before the start of the next note that is a beat tick or half beat tick
        const goodCandidate = nextNote.startSinceBeginningOfSongInTicks - (nextNote.startSinceBeginningOfSongInTicks % 48)
        if (goodCandidate > n.endSinceBeginningOfSongInTicks) return goodCandidate
        return n.endSinceBeginningOfSongInTicks
    }

    // We want to have a global view regadless of which track we are drawing of the ticks where there is note
    // starting or there is a bar starting. We need this information to align the drawings of the different tracks
    // so notes that start in the same tick are shown in the same vertical
    public static getAllNoteStarts(song: Song, simplificationNo: number, eventsToDraw: Array<Array<SoundEvent>>): number[] {
        const simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        const bars = song.bars
        // Order notes by start time
        const aux = [...simplification.notes]
            .sort((i, j) => i.startSinceBeginningOfSongInTicks - j.startSinceBeginningOfSongInTicks)
        const songNotes = aux.map(n => Normalization.normalizeNoteStart(bars, n))
        let startNotesSet = new Set<number>()
        songNotes.forEach(n => startNotesSet.add(n.startSinceBeginningOfSongInTicks))

        // When we have a note with an odd duration, we split it in several notes with normal durations
        // and we add a tie. Even when it is only one note, we have to add space for each of the notes
        // in which we splitted this odd duration note
        for (let v = 0; v < eventsToDraw.length; v++) {
            eventsToDraw[v].forEach(e => startNotesSet.add(e.startTick))
        }

        // we add now the start of the bars
        bars.forEach(b => startNotesSet.add(b.ticksFromBeginningOfSong))
        return Array.from(startNotesSet)
    }


    // A rest can be divided in a sequence of rests. For example if a rest extends to the next bar, we split it
    // in 2, one that ends with the first bar and one that starts with the second.
    // If a rest is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the rests start in the hardest bit
    // The same with the notes
    private static standardizeSequenceOfNotesAndRests(bars: Bar[], input: SoundEvent[]): SoundEvent[] {
        let retObj = this.splitEventsThatExtendToNextBar(bars, input)
        retObj = this.splitEventsThatHaveOddDurations(bars, retObj)
        retObj = this.splitRestsLongerThanAquarter(bars, retObj)
        return retObj
    }

    // We don't draw rests that have a duration of a half or a whole. We split them in quarters
    private static splitRestsLongerThanAquarter(bars: Bar[], input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (const e of input) {
            const duration = Normalization.getEventDuration(bars, e.startTick, e.endTick)
            // If it is not a rest don't touch it
            if (e.type == SoundEventType.note)
                retObj.push(e)
            else if (duration == NoteDuration.half) {
                const splitPoint = Math.round((e.endTick + e.startTick) / 2)
                let splitted = Normalization.splitEvent(e, [splitPoint], bars)
                retObj = retObj.concat(splitted)
            }
            else if (duration == NoteDuration.whole) {
                let splitPoints = []
                for (let i = 1; i < 4; i++) {
                    splitPoints.push(e.startTick + Math.round(i * (e.durationInTicks / 4)))
                }
                let splitted = Normalization.splitEvent(e, splitPoints, bars)
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
                const splitEvents = Normalization.splitEvent(e, splitPoints, bars)
                splitEvents.forEach(e => retObj.push(e))
            }
            else
                retObj.push(e)
        }
        return retObj
    }

    // If a note or a rest is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    private static splitEventsThatHaveOddDurations(bars: Bar[], input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (const e of input) {
            retObj = retObj.concat(Normalization.normalizeInterval(bars, e))
        }
        return retObj
    }
}
