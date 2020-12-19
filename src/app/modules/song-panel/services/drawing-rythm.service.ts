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
import { BeatDrawingInfo } from 'src/app/core/models/beat-drawing-info'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'
    svgBox: HTMLElement
    song: Song
    voice: number
    simplification: SongSimplification
    beats: BeatGraphNeeds[] // Represents the information we need about each beat to draw the notes and rests of that beat
    bars: Bar[]             // Info include the start and end tick and the time signature of each bar of the song
    songNotes: Note[]
    voiceNotes: Note[]
    isPercusion: boolean
    eventsToDraw: SoundEvent[]  // Represents all the notes and rests we have in this voice
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
        let startTieX: number | null = null
        for (const bar of this.bars) {
            let beatDrawingInfo = this.drawBar(bar, x, startTieX)
            x += beatDrawingInfo.deltaX
            startTieX = beatDrawingInfo.startTieX
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
    private drawBar(bar: Bar, x: number, startTieX: number | null): BeatDrawingInfo {
        const timeSig = bar.timeSignature
        const totalBeats = timeSig.numerator
        let deltaX = 0

        if (StaffElements.mustDrawTimeSignature(bar.barNumber, this.bars))
            deltaX += StaffElements.drawTimeSignature(this.svgBox, x + deltaX, timeSig)

        for (let beat = 1; beat <= totalBeats; beat++) {
            const beatGraphNeeds = this.getBeatGraphicNeeds(bar, beat)
            const beatDrawInfo = StaffElements.drawBeat(this.svgBox, x + deltaX, bar, beat, beatGraphNeeds, this.eventsToDraw, startTieX)
            deltaX += beatDrawInfo.deltaX
            startTieX = beatDrawInfo.startTieX
        }
        deltaX += StaffElements.drawBarLine(this.svgBox, x + deltaX)
        StaffElements.drawBarNumber(this.svgBox, x + deltaX / 2 - 10, bar.barNumber)
        return new BeatDrawingInfo(startTieX, deltaX)
    }




}
