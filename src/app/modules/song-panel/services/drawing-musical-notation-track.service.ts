import { Injectable, SimpleChange } from '@angular/core'
import { Store } from '@ngrx/store'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { Song } from 'src/app/core/models/song'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'
import { Note } from 'src/app/core/models/note'
import { Bar } from 'src/app/core/models/bar'
import { StaffElements } from './staff-utilities/staff-elements'
import { DrawingCalculations } from './staff-utilities/drawing-calculations'
import { Normalization } from './staff-utilities/normalization'
import { BeatDrawingInfo } from 'src/app/core/models/beat-drawing-info'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { Alteration } from 'src/app/core/models/alteration.enum'
import { keyframes } from '@angular/animations'
import { ScaleType } from 'src/app/core/models/scale-type.enum'
import { KeySignature } from 'src/app/core/models/key-signature'
import { GenericStaffDrawingUtilities } from './staff-utilities/generic-staff-drawing-utilities'
import { Pentagram } from './staff-utilities/pentagram'
import { BasicShapes } from './staff-utilities/basic-shapes'
import { DrumsShapes } from './staff-utilities/drums-shapes'

@Injectable()
export class DrawingMusicalNotationTrackService {
    svgns = 'http://www.w3.org/2000/svg'
    svgBox: HTMLElement
    song: Song
    voice: number
    subVoices: number[]
    simplification: SongSimplification
    bars: Bar[]             // Info include the start and end tick and the time signature of each bar of the song
    songNotes: Note[]
    voiceNotes: Note[]
    eventsToDraw: SoundEvent[]  // Represents all the notes and rests we have in this voice
    allNoteStarts: number[] // Represents all the ticks where there is a note starting in any of the voices
    eventsToDrawForAllVoices: Array<Array<SoundEvent>>

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
        eventsToDrawGlobal: Array<Array<SoundEvent>>): [number, number] {

        this.svgBox = document.getElementById(svgBoxId)
        // when we are here but the svg box hasn't been created in the browser yet we return this special response with invalid
        // values, so the caller knows what happens
        if (!this.svgBox) {
            return [-1, -1]
        }

        this.clearSVGbox(this.svgBox)
        this.voice = voice
        this.song = song
        this.simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        this.eventsToDrawForAllVoices = eventsToDrawGlobal

        this.bars = song.bars

        // Order notes by start time
        const aux = [... this.simplification.notes]
            .sort((i, j) => i.startSinceBeginningOfSongInTicks - j.startSinceBeginningOfSongInTicks)
        // normalize start time of notes
        //this.songNotes = aux.map(n => Normalization.normalizeNoteStart(this.bars, n))

        console.log(`voice ${voice}`)
        this.voiceNotes = this.simplification.getNotesOfVoice(voice)

        if (this.isVoicePolyphonic(this.voiceNotes)) {
            BasicShapes.createText(this.svgBox, "This voice is polyphonic and can not be shown in musical notation", 50, 80, 30, "black")
            return [1200, 50]
        }
        else {
            this.eventsToDraw = this.eventsToDrawForAllVoices[this.simplification.getVoicesWithNotes().indexOf(voice)]

            this.AddShownAlterationsToSoundEvents()
            this.AddAppliedAlterationToSoundEvents()
            // We calculate the y location of notes first, the y depends on their pitch
            this.calculateYofNotes()
            // We calculate the y of the rests after the notes, because their y depends on the y of the sorrounding notes
            this.calculateYofRests()


            this.allNoteStarts = DrawingCalculations.getAllNoteStarts(song, simplificationNo, this.eventsToDrawForAllVoices)

            const voiceIsPercusion = this.voiceNotes[0].isPercussion
            let x = 0
            x += Pentagram.drawClefs(this.svgBox, x, voiceIsPercusion)

            let startTieX: number | null = null
            for (const bar of this.bars) {
                // if it is the last bar and it has no notes, don't show it
                if (bar.barNumber == this.bars.length &&
                    this.simplification.notes.filter(n => n.endSinceBeginningOfSongInTicks > bar.ticksFromBeginningOfSong).length == 0)
                    break

                let beatDrawingInfo = this.drawBar(bar, x, startTieX, voiceIsPercusion)
                x += beatDrawingInfo.deltaX
                startTieX = beatDrawingInfo.startTieX
            }
            Pentagram.drawPentagram(this.svgBox, x, voiceIsPercusion)
            this.eventsToDraw.forEach(x => Pentagram.addExtraLines(this.svgBox, x))

            let averageY = this.eventsToDraw.reduce((sum, current) => current.bottomY + sum, 0) / this.eventsToDraw.length + 1
            if (voiceIsPercusion) averageY -=100
            return [x, averageY]
        }
    }

    // We can not build the music notation representation of a voice if it is polyphonic, we have to split it first in
    // monophonic voices. Because simplification 0 may have polyphonic voices, we have to check if the voice we will
    // show in musical notation is actually polyphonic, in which case we show a message explaining that we can not
    // build the musical notation representation due to the voice being polyphonic
    // This method calculates the sum of the durations of all notes in the voice and the sum of durations where different
    // notes play at the same time, but are not starting and ending together. Then compares the 2 values and if the
    // percentage of time there is overlap is greater than 10%, then it considers this a polyphonic voice
    private isVoicePolyphonic(voiceNotes: Note[]): boolean {
        let totalOverlap = 0
        let totalDuration = 0

        if (voiceNotes[0].isPercussion) return false;

        for (const n of voiceNotes) {
            totalDuration += n.endSinceBeginningOfSongInTicks - n.startSinceBeginningOfSongInTicks
            let overlapingNotes = voiceNotes
                .filter(m =>
                    // notes not exactly simultaneous
                    !(m.startSinceBeginningOfSongInTicks == n.startSinceBeginningOfSongInTicks && m.endSinceBeginningOfSongInTicks == n.endSinceBeginningOfSongInTicks) &&
                    // there is overlap
                    m.startSinceBeginningOfSongInTicks <= n.endSinceBeginningOfSongInTicks && m.endSinceBeginningOfSongInTicks >= n.startSinceBeginningOfSongInTicks)
            let overlap = overlapingNotes
                .map(m => Math.min(m.endSinceBeginningOfSongInTicks, n.endSinceBeginningOfSongInTicks) - Math.max(m.startSinceBeginningOfSongInTicks, n.startSinceBeginningOfSongInTicks))
                .reduce((sum, current) => sum + current, 0)
            totalOverlap += overlap
        }
        return (totalOverlap > totalDuration / 10)
    }

    // When a note is not a note of the C major scale, we need to know if it is considered a flat or a sharp to decide where we
    // we draw it. A ntoe can also have the pitch of a C major scale note, but actually be considered a different note, like when we
    // have a key signature with 6 sharps and the pitch corresponding to the F note is actually treated as an E sharp, not an F
    // We store in the variable AlterationApplied the information of what alteration is being applied to this pitch. So if we have a
    // note with a pitch of 61, and an AlterationApplied of sharp, then we draw it as a C#. If it has an alteration of flat, we draw
    // it as a Db
    private AddAppliedAlterationToSoundEvents() {
        for (let e of this.eventsToDraw.filter(x => x.type == SoundEventType.note)) {
            const alterationsAtTick = GenericStaffDrawingUtilities.getAlterationsAtTick(this.bars, e.startTick, this.eventsToDraw)
            if (alterationsAtTick.has(e.pitch))
                e.alterationApplied = alterationsAtTick.get(e.pitch)
            else
                e.alterationApplied = null
            if (e.alterationShown == Alteration.sharp || e.alterationShown == Alteration.flat)
                e.alterationApplied = e.alterationShown
            if (e.alterationShown == Alteration.cancel)
                e.alterationApplied = null
        }
    }

    // It populates the alterationShown field of the note sound events held in the global variable eventsToDraw
    // The alterationShown field is used to decide if we add an alteration (a sharp a flat or a natural (that I call "cancel")
    // next to the note when drawn in the pentagram
    private AddShownAlterationsToSoundEvents() {
        // The alterations added in this bar, affect the next bar in this way:
        // - if we have the same note altered in the next bar, we still have to add the sharp or flat
        // - but if the natural note is played, we have to add a cancel, as if it had a previous sharp or flat in this bar
        // So we have to keep track of the alterations added (not the ones in a key signature) in one bar, and cancel them
        // in the next bar if needed, even when the next bar may have no alterations at all
        let alterationsAddedInThisBar = new Set<number>()
        let alterationsAddedInPreviousBar = new Set<number>()
        for (let bar of this.bars) {
            // alterations "have memory" If C3 for example has a sharp, then we don't put sharps again in C3 until
            // it is played without alteration or the bar has ended. The first time it is played without alteration after a sharp we add
            // a cancel sign and the next time it is altered we add a sharp again
            // The memory works only on that pitch. If a different C is played (for example C4) after the initial sharp on C3 
            // we have to add a sharp the first time to C4
            // currentAlterations is the variable where we save that memory. When the bar starts, the alterations of the key signature
            // are applied by default, so they should be added
            let currentAlterations = new Set([...GenericStaffDrawingUtilities.GetKeySignatureAlteredPitches(bar.keySignature.key), ...alterationsAddedInPreviousBar])
            alterationsAddedInThisBar = new Set<number>()
            let eventsInThisBar = this.getBarEvents(bar)
            const unalteredPitches = this.getPitchesOfKeySignature(bar.keySignature.key)

            for (const e of eventsInThisBar) {
                if (e.type == SoundEventType.rest) continue

                if (bar.keySignature.scale == ScaleType.major) {
                    this.processAlterationsOfMajorScale(e, bar, currentAlterations, alterationsAddedInPreviousBar,
                        alterationsAddedInThisBar, new Set(eventsInThisBar.map(y => y.pitch)), unalteredPitches)
                }
                else {
                    this.processAlterationsOfMinorScale(e, bar, currentAlterations, alterationsAddedInPreviousBar,
                        alterationsAddedInThisBar, new Set(eventsInThisBar.map(y => y.pitch)), unalteredPitches)
                }
            }
            alterationsAddedInPreviousBar = alterationsAddedInThisBar
        }
    }

    private processAlterationsOfMajorScale(e: SoundEvent, bar: Bar, currentAlterations: Set<number>, alterationsAddedInPreviousBar: Set<number>,
        alterationsAddedInThisBar: Set<number>, pitchesOfThisBar: Set<number>, unalteredPitches) {
        const keySiganatureAlterations = GenericStaffDrawingUtilities.GetKeySignatureAlteredPitches(bar.keySignature.key)
        // If key signature has sharps we add sharps
        // If the key is C and we have F#. C# or G# we add sharps
        if (bar.keySignature.key > 0 ||
            bar.keySignature.key == 0 && this.areAlteredPitchesSharp(new Set([...pitchesOfThisBar, ...alterationsAddedInPreviousBar]))) {
            // if this note is not in the scale and there are no previous alterations in this bar for this pitch, 
            // add an alteration to it and store the fact in the currentAlterations array
            if (!unalteredPitches.has(e.pitch % 12) && !alterationsAddedInThisBar.has(e.pitch) && !keySiganatureAlterations.has(e.pitch)) {
                e.alterationShown = Alteration.sharp
                currentAlterations.add(e.pitch)
                alterationsAddedInThisBar.add(e.pitch)
            }
            // if this pitch is in the scale and there was an alteration for the corresponding note in the scale, cancel the 
            // previous alteration for this pitch
            if (unalteredPitches.has(e.pitch % 12) &&
                ((currentAlterations.has(e.pitch + 1)) || alterationsAddedInPreviousBar.has(e.pitch + 1))) {
                e.alterationShown = Alteration.cancel
                currentAlterations.delete(e.pitch + 1)
                alterationsAddedInPreviousBar.delete(e.pitch + 1)
                alterationsAddedInThisBar.delete(e.pitch + 1)
            }
        }
        // if the key signature has flats or key is C and we have Bb or Eb add flats
        else {

            // if this note is not in the scale and there are no previous alterations in this bar for this pitch, 
            // add an alteration to it and store the fact in the currentAlterations array
            if (!unalteredPitches.has(e.pitch % 12) && !alterationsAddedInThisBar.has(e.pitch) && !keySiganatureAlterations.has(e.pitch)) {
                e.alterationShown = Alteration.flat
                currentAlterations.add(e.pitch)
                alterationsAddedInThisBar.add(e.pitch)
            }
            // if this pitch is in the scale and there was an alteration for the corresponding note in the scale, cancel the 
            // previous alteration for this pitch
            if (unalteredPitches.has(e.pitch % 12) &&
                (currentAlterations.has(e.pitch - 1) || alterationsAddedInPreviousBar.has(e.pitch - 1))) {
                e.alterationShown = Alteration.cancel
                currentAlterations.delete(e.pitch - 1)
                alterationsAddedInPreviousBar.delete(e.pitch - 1)
                alterationsAddedInThisBar.delete(e.pitch - 1)
            }
        }
    }
    private getTonicOfScaleFromKeySignature(keySig: KeySignature): number {
        if (keySig.scale == ScaleType.minor) return (69 + keySig.key * 7) % 12
        return (60 + keySig.key * 7) % 12
    }
    private processAlterationsOfMinorScale(e: SoundEvent, bar: Bar, currentAlterations: Set<number>, alterationsAddedInPreviousBar: Set<number>,
        alterationsAddedInThisBar: Set<number>, pitchesOfThisBar: Set<number>, unalteredPitches) {
        // In a minor scale, it is comon to raise the 6th and the 7th. In those cases we use sharps, regardless of the current key signature
        const tonic = this.getTonicOfScaleFromKeySignature(bar.keySignature)
        const majorSixth = (tonic + 9) % 12
        const majorSeventh = (tonic + 11) % 12
        const keySiganatureAlterations = GenericStaffDrawingUtilities.GetKeySignatureAlteredPitches(bar.keySignature.key)
        // If key signature has sharps we add sharps
        // If the key is C and we have F#. C# or G# we add sharps
        if (bar.keySignature.key > 0 || e.pitch % 12 == majorSixth || e.pitch % 12 == majorSeventh ||
            bar.keySignature.key == 0 && this.areAlteredPitchesSharp(new Set([...pitchesOfThisBar, ...alterationsAddedInPreviousBar]))) {
            // if this note is not in the scale and there are no previous alterations in this bar for this pitch, 
            // add an alteration to it and store the fact in the currentAlterations array
            const keySiganatureAlterations = GenericStaffDrawingUtilities.GetKeySignatureAlteredPitches(bar.keySignature.key)
            if (!unalteredPitches.has(e.pitch % 12) && !alterationsAddedInThisBar.has(e.pitch) && !keySiganatureAlterations.has(e.pitch)) {
                e.alterationShown = Alteration.sharp
                currentAlterations.add(e.pitch)
                alterationsAddedInThisBar.add(e.pitch)
            }
            // if this pitch is in the scale and there was an alteration for the corresponding note in the scale, cancel the 
            // previous alteration for this pitch
            if (unalteredPitches.has(e.pitch % 12) &&
                ((currentAlterations.has(e.pitch + 1)) || alterationsAddedInPreviousBar.has(e.pitch + 1))) {
                e.alterationShown = Alteration.cancel
                currentAlterations.delete(e.pitch + 1)
                alterationsAddedInPreviousBar.delete(e.pitch + 1)
                alterationsAddedInThisBar.delete(e.pitch + 1)
            }
        }
        // if the key signature has flats or key is C and we have Bb or Eb add flats
        else {
            // if this note is not in the scale and there are no previous alterations in this bar for this pitch, 
            // add an alteration to it and store the fact in the currentAlterations array
            if (!unalteredPitches.has(e.pitch % 12) && !alterationsAddedInThisBar.has(e.pitch) && !keySiganatureAlterations.has(e.pitch)) {
                e.alterationShown = Alteration.flat
                currentAlterations.add(e.pitch)
                alterationsAddedInThisBar.add(e.pitch)
            }
            // if this pitch is in the scale and there was an alteration for the corresponding note in the scale, cancel the 
            // previous alteration for this pitch
            if (unalteredPitches.has(e.pitch % 12) &&
                (currentAlterations.has(e.pitch - 1) || alterationsAddedInPreviousBar.has(e.pitch - 1))) {
                e.alterationShown = Alteration.cancel
                currentAlterations.delete(e.pitch - 1)
                alterationsAddedInPreviousBar.delete(e.pitch - 1)
                alterationsAddedInThisBar.delete(e.pitch - 1)
            }
        }
    }

    // The most common added sharps in a C scale are F# C# and G# 
    // So if the key signature is C and we have the pitch 6, it is probably a F# and not a Gb
    // We use this information to decide if we are going to add sharps or flats for notes not in the scale
    private areAlteredPitchesSharp(pitches: Set<number>): boolean {
        const pitchesMod12 = new Set(Array.from(pitches.values(), x => x % 12))
        if (pitchesMod12.has(6) || pitchesMod12.has(1) || pitchesMod12.has(8)) return true
        return false
    }
    private getBarEvents(bar: Bar) {
        const barDuration = bar.timeSignature.numerator * 4 / bar.timeSignature.denominator * 96
        const barStart = bar.ticksFromBeginningOfSong
        const barEnd = barStart + barDuration
        return this.eventsToDraw
            .filter(e => e.startTick >= barStart && e.startTick < barEnd)
            .sort((a, b) => a.startTick - b.startTick)
    }

    // When drawing notes in the pentagram, we need to know which notes will need an alteration added
    // The notes that belong to the scale defined by the key signature are the ones that don't have alterations
    // If the key is C (no alterations) then the notes with piches 0,2,4,5,7,9,11 are the ones that will have no
    // This function returns the pitches that will have no alterations given a certain key signature
    private getPitchesOfKeySignature(keySignature: number): Set<number> {
        let retObj: number[] = [0, 2, 4, 5, 7, 9, 11]
        // Adding 7 * keySignature is equivalent to "transpose the scale" to the 5th, so for ex for the G scale
        // keySignature=1 (1 sharp) and adding 7 to each pitch in retObj we change from the C scale to the G scale
        // We add 60, because KeySignature is negative for flats, so for example if we have 7 flats 7 * keysig = -49
        // Adding 60 in that case leave us with 11 instead of -49, so adding 11 to retObj we end up with the 
        // B major scale
        return new Set(retObj.map(x => (x + (7 * keySignature) + 60) % 12))
    }

    private clearSVGbox(svgBox: HTMLElement) {
        while (svgBox.firstChild) {
            svgBox.removeChild(svgBox.firstChild)
        }
    }

    // Returns the average distance from the left side of the notes painted red
    // This information can be used to move the viewBox, so the notes being played are always in the center of the svg box
    public paintNotesBeingPlayed(tick: number): number | null {
        let notesToPaint = this.eventsToDraw.filter(e => e.type == SoundEventType.note && e.startTick <= tick && e.endTick >= tick)
        this.paintAllNotesBlack()
        let totalX = 0
        let totalNotes = 0
        if (tick === null || tick == undefined) return
        for (const e of notesToPaint) {
            totalX += e.x
            totalNotes++
            for (const g of e.graphic) {
                for (let i = 0; i < g.children.length; i++) {
                    g.children[i].setAttributeNS(null, 'fill', 'red')
                    g.children[i].setAttributeNS(null, 'stroke', 'red')
                }
            }
        }
        if (totalNotes > 0) return totalX / totalNotes
        return null
    }

    public paintAllNotesBlack() {
        if (!this.eventsToDraw) return
        for (const e of this.eventsToDraw) {
            for (const g of e.graphic) {
                for (let i = 0; i < g.children.length; i++) {
                    g.children[i].setAttributeNS(null, 'fill', 'black')
                    g.children[i].setAttributeNS(null, 'stroke', 'black')
                }
            }
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
        // when the time signature is 12/4 we process the beats in groups of 3
        if (bar.timeSignature.numerator % 3 == 0 && bar.timeSignature.denominator == 8) {
            let startOfBeat = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
            let endOfBeat = startOfBeat + 3 * beatDurationInTicks
            let noteStartsInBeat = this.allNoteStarts
                .filter(e => e >= startOfBeat && e < endOfBeat).map(n => n - startOfBeat)

            return new BeatGraphNeeds(bar.barNumber, 1, noteStartsInBeat)
        }
        // in normal cases we process the beats one at a time
        let startOfBeat = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        let endOfBeat = startOfBeat + beatDurationInTicks
        let noteStartsInBeat = this.allNoteStarts
            .filter(e => e >= startOfBeat && e < endOfBeat).map(n => n - startOfBeat)

        return new BeatGraphNeeds(bar.barNumber, beat, noteStartsInBeat)

    }



    // bar is the bar number, that is 1 for the first bar of the song
    // x is the coordinate in pixels where we must start drawing
    private drawBar(bar: Bar, x: number, startTieX: number | null, isPercussionVoice: boolean = false): BeatDrawingInfo {
        const timeSig = bar.timeSignature
        const keySig = bar.keySignature
        const totalBeats = timeSig.numerator
        let deltaX = 0

        if (Pentagram.mustDrawKeySignature(bar.barNumber, this.bars))
            deltaX += Pentagram.drawKeySignature(this.svgBox, x + deltaX, keySig, isPercussionVoice)

        if (Pentagram.mustDrawTimeSignature(bar.barNumber, this.bars))
            deltaX += Pentagram.drawTimeSignature(this.svgBox, x + deltaX, timeSig, isPercussionVoice)

        for (let beat = 1; beat <= totalBeats; beat++) {
            let beatGraphNeeds: BeatGraphNeeds
            beatGraphNeeds = this.getBeatGraphicNeeds(bar, beat)
            const beatDrawInfo = StaffElements.drawBeat(this.svgBox, x + deltaX, bar, beat, beatGraphNeeds, this.eventsToDraw, this.bars, startTieX)
            deltaX += beatDrawInfo.deltaX
            startTieX = beatDrawInfo.startTieX
        }
        deltaX += Pentagram.drawBarLine(this.svgBox, x + deltaX, isPercussionVoice)
        Pentagram.drawBarNumber(this.svgBox, x + deltaX / 2 - 10, bar.barNumber)
        return new BeatDrawingInfo(startTieX, deltaX)

    }


    private calculateYofNotes() {
        for (let e of this.eventsToDraw) {
            if (e.type == SoundEventType.note)
                if (e.isPercussion)
                    e.bottomY = DrumsShapes.getYForDrumNote(e.pitch)
                else
                    e.bottomY = GenericStaffDrawingUtilities.getBottomYofNote(e, this.bars, this.eventsToDraw)
        }
    }
    private calculateYofRests() {
        for (let e of this.eventsToDraw) {
            if (e.type == SoundEventType.rest)
                e.bottomY = GenericStaffDrawingUtilities.getYofRest(e, this.eventsToDraw)
        }
    }

}
