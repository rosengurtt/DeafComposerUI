import { Injectable } from '@angular/core'

import { Instrument } from '../../../core/models/midi/midi-codes/instrument.enum'
import { SongSimplification } from '../../../core/models/song-simplification'
import { Song } from '../../../core/models/song'
import { Note } from '../../../core/models/note'
import { SongStats } from 'src/app/core/models/song-stats'
import { Bar } from 'src/app/core/models/bar'


@Injectable()
export class DrawingPianoRollService {
    svgns = 'http://www.w3.org/2000/svg'
    colorMusicBar = 'rgb(250,200,190)'
    colorProgressBar = 'rgb(255,190,190)'
    // keyboards are blue
    colorKeyboard = 'rgb(100,100,224)'
    // bass is violet
    colorBass = 'rgb(224,100,224)'
    // guitar is red
    colorGuitar = 'rgb(224,100,100)'
    // drums are green
    colorDrums = 'rgb(100,224,100)'
    // others are yellow
    colorOthers = 'rgb(224,224,100)'

    noteDotRadio = 1
    svgBox: HTMLElement
    song: Song
    songSimplification: SongSimplification
    bars: Bar[]

    public drawPianoRollGraphic(
        trackNumber: number,
        svgBoxId: string,
        song: Song,
        simplificationNo: number): string {
        this.svgBox = document.getElementById(svgBoxId)
        if (!this.svgBox) return

        this.clearSVGbox(this.svgBox)
        this.song = song
        this.songSimplification = new SongSimplification(song.songSimplifications[simplificationNo])
        this.bars = song.bars

        const instrument = this.songSimplification.getInstrumentOfVoice(trackNumber)
        const isPercusion = this.songSimplification.isVoicePercusion(trackNumber)
        const color = this.getColor(instrument, isPercusion)

        this.paintNotesTrack(trackNumber, color)

        this.createStaffBars()

       // this.createHorizontalLinesAtCnotes()
    }
    // Draws in one canvas all tracks mixed together
    public drawTracksCollapsedGraphic(
        svgBoxId: string,
        song: Song,
        simplificationNo: number,
        createProgressBar: boolean,
        progressBarId?: string): string {

        this.svgBox = document.getElementById(svgBoxId)
        if (!this.svgBox) return

        this.clearSVGbox(this.svgBox)
        this.song = song
        this.songSimplification = new SongSimplification(song.songSimplifications[simplificationNo])
        this.bars = song.bars

        for (let i = 0; i < this.songSimplification.numberOfVoices; i++) {
            const instrument = this.songSimplification.getInstrumentOfVoice(i)
            const isPercusion = this.songSimplification.isVoicePercusion(i)
            const color = this.getColor(instrument, isPercusion)
            this.paintNotesTrack(null, color)
        }
        this.createStaffBars()
        if (createProgressBar) this.createProgressBar(progressBarId, 0)
    }


    private getColor(instrument: Instrument, isPercusion: boolean): string {
        if (isPercusion) return this.colorDrums
        if (instrument < 8) return this.colorKeyboard
        if (instrument < 16) return this.colorDrums
        if (instrument < 24) return this.colorKeyboard
        if (instrument < 32) return this.colorGuitar
        if (instrument < 40) return this.colorBass
        if (instrument < 48) return this.colorGuitar
        if (instrument < 80) return this.colorOthers
        if (instrument < 96) return this.colorKeyboard
        if (instrument == 128) return this.colorDrums
        return this.colorOthers
    }

    public createProgressBar(progressBarId: string, ticks: number | null): any {
        let progressBar = document.getElementById(progressBarId)
        this.deleteProgressBar(progressBarId)
        if (ticks)
            progressBar = this.createLine(ticks, ticks, 0, 128, 8, this.colorProgressBar, 0, progressBarId)
    }

    public deleteProgressBar(progressBarId: string) {
        const progressBar = document.getElementById(progressBarId)
        if (progressBar) {
            try {
                this.svgBox.removeChild(progressBar)
            } catch (error) {
                console.log('The progressBar object is not null, but when trying to remove it an exception was raised')
                console.log(error)
            }
        }
    }

    public createLine(x1: number, x2: number, y1: number, y2: number, width: number, color: string, dotSize: number, id: string): any {
        const line: any = document.createElementNS(this.svgns, 'line')
        line.setAttributeNS(null, 'width', width)
        line.setAttributeNS(null, 'x1', x1)
        line.setAttributeNS(null, 'x2', x2)
        line.setAttributeNS(null, 'y1', y1)
        line.setAttributeNS(null, 'y2', y2)
        line.setAttributeNS(null, 'style', `stroke: ${color}; stroke-width: ${width}`)
        if (dotSize) line.setAttributeNS(null, 'stroke-dasharray', dotSize.toString())
        if (id) line.setAttributeNS(null, 'id', id)
        this.svgBox.appendChild(line)
        return line
    }
    private createNote(x: number, y: number, l: number, color: string): any {
        const line: any = document.createElementNS(this.svgns, 'line')
        line.setAttributeNS(null, 'x1', x)
        line.setAttributeNS(null, 'x2', x + l)
        line.setAttributeNS(null, 'y1', y)
        line.setAttributeNS(null, 'y2', y)
        line.setAttributeNS(null, 'style', `stroke: ${color};stroke-width:0.8`)
        this.svgBox.appendChild(line)
        return line
    }

    // returns a reference to the dot created
    private createDot(
        x: number,
        y: number,
        r: number,
        color: string,
        svgBoxId: string): any {
        const svgBox = document.getElementById(svgBoxId)
        const dot: any = document.createElementNS(this.svgns, 'circle')
        dot.setAttributeNS(null, 'cx', x)
        dot.setAttributeNS(null, 'cy', y)
        dot.setAttributeNS(null, 'r', r)
        dot.setAttributeNS(null, 'fill', color)
        svgBox.appendChild(dot)
        return dot
    }

    private createText(text: string, x: number, y: number, fontSize: number, textLength) {
        const textElement: any = document.createElementNS(this.svgns, 'text')
        const textNode = document.createTextNode(text)
        textElement.appendChild(textNode)
        textElement.setAttributeNS(null, 'x', x)
        textElement.setAttributeNS(null, 'y', y)
        textElement.setAttributeNS(null, 'font-size', fontSize.toString())
        textElement.setAttributeNS(null, 'textLength', textLength.toString())
        textElement.setAttributeNS(null, 'lengthAdjust', 'spacingAndGlyphs')
        textElement.setAttributeNS(null, 'fill', 'white')
        this.svgBox.appendChild(textElement)
        return textElement
    }


    private clearSVGbox(svgBox: HTMLElement) {
        while (svgBox.firstChild)
            svgBox.removeChild(svgBox.firstChild)
    }

    private paintNotesTrack(trackNumber: number, color: string) {
        const notes = trackNumber === null ? this.songSimplification.notes : this.songSimplification.getNotesOfVoice(trackNumber)
        for (const note of notes) {
            const cx: number = note.startSinceBeginningOfSongInTicks
            const cy: number = note.pitch
            this.createNote(cx, cy, note.durationInTicks, color)
        }
    }
    private createStaffBars() {
        const fontSize = 10
        const pitchSpaceLength = 128
        for (let bar of this.bars) {
            bar =  new Bar(bar)
            const barx = bar.barWidthInTicks * (bar.barNumber - 1)
            const textLength = bar.barWidthInTicks / 3
            this.createLine(barx, barx, 0, pitchSpaceLength, 10, this.colorMusicBar, 0, '')
            const xOfText = barx + bar.barWidthInTicks / 3
            this.createText((bar.barNumber).toString(), xOfText, fontSize, fontSize, textLength)
        }
    }

    private createHorizontalLinesAtCnotes() {
        const lineStart = 0
        const totalLength = this.song.songStats.numberOfTicks
        const width = 1
        const dotSize = 1
        for (let i = 0; i < 128; i += 12)
            this.createLine(lineStart, totalLength, i, i, width, this.colorMusicBar, dotSize, '')
    }



}
