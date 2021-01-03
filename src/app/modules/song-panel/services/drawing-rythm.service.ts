import { Injectable } from '@angular/core'
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
import { State } from 'src/app/core/state/app.state'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { KeySignature } from 'src/app/core/models/key-signature.enum'
import { Clef } from 'src/app/core/models/clef.enum'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'
    svgBox: HTMLElement
    song: Song
    voice: number
    simplification: SongSimplification
    bars: Bar[]             // Info include the start and end tick and the time signature of each bar of the song
    songNotes: Note[]
    voiceNotes: Note[]
    isPercusion: boolean
    eventsToDraw: SoundEvent[]  // Represents all the notes and rests we have in this voice
    eventsToDrawForAllVoices: Array<Array<SoundEvent>>
    allNoteStarts: number[] // Represents all the ticks where there is a note starting in any of the voices

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
        simplificationNo: number): number {
        this.svgBox = document.getElementById(svgBoxId)
        if (!this.svgBox) {
            return
        }


        this.clearSVGbox(this.svgBox)
        this.voice = voice
        this.song = song
        this.simplification = new SongSimplification(song.songSimplifications[simplificationNo])
        this.bars = song.bars
        console.log(song.bars)
        // Order notes by start time
        const aux = [... this.simplification.notes]
            .sort((i, j) => i.startSinceBeginningOfSongInTicks - j.startSinceBeginningOfSongInTicks)
        // normalize start time of notes
        this.songNotes = aux.map(n => Normalization.normalizeNoteStart(this.bars, n))


        console.log(`voice ${voice}`)
        this.isPercusion = this.simplification.isVoicePercusion(voice)
        this.voiceNotes = this.simplification.getNotesOfVoice(voice, song)

        this.eventsToDrawForAllVoices = []
        for (let v = 0; v < this.simplification.numberOfVoices; v++) {
            this.eventsToDrawForAllVoices.push(DrawingCalculations.getEventsToDraw(song, simplificationNo, v))
        }
        this.eventsToDraw = this.eventsToDrawForAllVoices[voice]

        this.allNoteStarts = DrawingCalculations.getAllNoteStarts(song, simplificationNo, this.eventsToDrawForAllVoices)

        let x = 0
        x += StaffElements.drawClefs(this.svgBox, x)
        //  x += StaffElements.drawKeySignature(this.svgBox, KeySignature.sevenFlats, x)

        let startTieX: number | null = null
        for (const bar of this.bars) {

            // if it is the last bar and it has no notes, don't show it
            if (bar.barNumber == this.bars.length &&
                this.simplification.notes.filter(n => n.endSinceBeginningOfSongInTicks > bar.ticksFromBeginningOfSong).length == 0)
                break

            let beatDrawingInfo = this.drawBar(bar, x, startTieX)
            x += beatDrawingInfo.deltaX
            startTieX = beatDrawingInfo.startTieX
        }
        StaffElements.drawPentagram(this.svgBox, x)
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
        let startOfBeat = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        let endOfBeat = startOfBeat + beatDurationInTicks
        let noteStartsInBeat = this.allNoteStarts
            .filter(e => e >= startOfBeat && e < endOfBeat).map(n => n - startOfBeat)

        return new BeatGraphNeeds(bar.barNumber, beat, noteStartsInBeat)

    }
    private getBarGraphicNeeds(bar: Bar): BeatGraphNeeds {
        const beatDurationInTicks = 96 * 4 / bar.timeSignature.denominator
        let startOfBar = bar.ticksFromBeginningOfSong
        let endOfBar = startOfBar + bar.timeSignature.numerator * beatDurationInTicks
        let noteStartsInBeat = this.allNoteStarts
            .filter(e => e >= startOfBar && e < endOfBar).map(n => n - startOfBar)

        return new BeatGraphNeeds(bar.barNumber, 1, noteStartsInBeat)

    }


    // bar is the bar number, that is 1 for the first bar of the song
    // x is the coordinate in pixels where we must start drawing
    private drawBar(bar: Bar, x: number, startTieX: number | null): BeatDrawingInfo {
        const timeSig = bar.timeSignature
        const keySig = bar.keySignature
        const totalBeats = timeSig.numerator
        let deltaX = 0

        if (StaffElements.mustDrawKeySignature(bar.barNumber, this.bars))
            deltaX += StaffElements.drawKeySignature(this.svgBox, x + deltaX, keySig)

        if (StaffElements.mustDrawTimeSignature(bar.barNumber, this.bars))
            deltaX += StaffElements.drawTimeSignature(this.svgBox, x + deltaX, timeSig)

        for (let beat = 1; beat <= totalBeats; beat++) {
            let beatGraphNeeds: BeatGraphNeeds
            if (timeSig.numerator == 3 && timeSig.denominator == 8)
                beatGraphNeeds = this.getBarGraphicNeeds(bar)
            else
                beatGraphNeeds = this.getBeatGraphicNeeds(bar, beat)
            const beatDrawInfo = StaffElements.drawBeat(this.svgBox, x + deltaX, bar, beat, beatGraphNeeds, this.eventsToDraw, startTieX)
            deltaX += beatDrawInfo.deltaX
            startTieX = beatDrawInfo.startTieX
        }
        deltaX += StaffElements.drawBarLine(this.svgBox, x + deltaX)
        StaffElements.drawBarNumber(this.svgBox, x + deltaX / 2 - 10, bar.barNumber)
        return new BeatDrawingInfo(startTieX, deltaX)

    }




}
