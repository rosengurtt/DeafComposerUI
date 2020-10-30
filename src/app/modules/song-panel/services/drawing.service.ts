import { Injectable } from '@angular/core'

import { Instrument } from '../../../core/models/midi/midi-codes/instrument.enum'
import { SongSimplification } from '../../../core/models/song-simplification'
import { Song } from '../../../core/models/song'
import { Note } from '../../../core/models/note'
import { SongStats } from 'src/app/core/models/song-stats'


@Injectable()
export class DrawingService {
    svgns = 'http://www.w3.org/2000/svg'
    colorMusicBar = 'rgb(250,200,190)'
    colorProgressBar = 'rgb(200,0,0)'
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

    public createProgressBar(
        svgBoxId: string,
        progressBarId: string,
        progress: number): any {
        let progressBar = document.getElementById(progressBarId)
        const svgBox = document.getElementById(svgBoxId)
        if (svgBox) {
            const svgBoxWidth = svgBox.clientWidth
            const x = progress * svgBoxWidth
            this.deleteProgressBar(svgBoxId, progressBarId)
            if (x > 0 && x < svgBoxWidth) {
                progressBar = this.createLine(x, x, 0, svgBox.clientHeight, 2,
                    this.colorProgressBar, 0, progressBarId, svgBox)
            }
        }
    }

    public deleteProgressBar(svgBoxId: string, progressBarId: string) {
        const progressBar = document.getElementById(progressBarId)
        const svgBox = document.getElementById(svgBoxId)
        if (progressBar) {
            try {
                svgBox.removeChild(progressBar)
            } catch (error) {
                console.log('The progressBar object is not null, but when trying to remove it an exception was raised')
                console.log(error)
            }
        }
    }

    public createLine(
        x1: number,
        x2: number,
        y1: number,
        y2: number,
        width: number,
        color: string,
        dotSize: number,
        id: string,
        svgBox: any): any {
        const line: any = document.createElementNS(this.svgns, 'line')
        line.setAttributeNS(null, 'width', width)
        line.setAttributeNS(null, 'x1', x1)
        line.setAttributeNS(null, 'x2', x2)
        line.setAttributeNS(null, 'y1', y1)
        line.setAttributeNS(null, 'y2', y2)
        line.setAttributeNS(null, 'style', `stroke: ${color}; stroke-width: ${width}`)
        if (dotSize) line.setAttributeNS(null, 'stroke-dasharray', dotSize.toString())

        if (id) {
            line.setAttributeNS(null, 'id', id)
        }
        svgBox.appendChild(line)
        return line
    }
    private createNote(
        x: number,
        y: number,
        l: number,
        color: string,
        svgBoxId: string): any {
        const svgBox = document.getElementById(svgBoxId)
        const line: any = document.createElementNS(this.svgns, 'line')
        line.setAttributeNS(null, 'width', 1)
        line.setAttributeNS(null, 'x1', x)
        line.setAttributeNS(null, 'x2', x + l)
        line.setAttributeNS(null, 'y1', y)
        line.setAttributeNS(null, 'y2', y)
        line.setAttributeNS(null, 'style', `stroke: ${color}`)
        svgBox.appendChild(line)
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

    private createText(
        text: string,
        x: number,
        y: number,
        fontSize: number,
        textLength,
        svgBox: any) {
        const textElement: any = document.createElementNS(this.svgns, 'text')
        const textNode = document.createTextNode(text)
        textElement.appendChild(textNode)
        textElement.setAttributeNS(null, 'x', x)
        textElement.setAttributeNS(null, 'y', y)
        textElement.setAttributeNS(null, 'font-size', fontSize.toString())
        textElement.setAttributeNS(null, 'textLength', textLength.toString())
        textElement.setAttributeNS(null, 'lengthAdjust', 'spacingAndGlyphs')
        textElement.setAttributeNS(null, 'fill', 'white')
        svgBox.appendChild(textElement)
        return textElement
    }

    public drawTrackGraphic(
        trackNumber: number,
        svgBoxId: string,
        song: Song,
        simplificationNo: number,
        createProgressBar: boolean,
        progressBarId?: string): string {
        const svgBox = document.getElementById(svgBoxId)
        if (!svgBox) {
            return
        }

        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])
        const notes = simplif.getNotesOfVoice(trackNumber)

        const instrument = simplif.getInstrumentOfVoice(trackNumber)
        const isPercusion = simplif.isVoicePercusion(trackNumber)
        const color = this.getColor(instrument, isPercusion)


        this.paintNotesTrack(song, simplificationNo, trackNumber, svgBoxId, color)

        this.createStaffBars(svgBoxId, song)

        this.createHorizontalLinesAtCnotes(svgBoxId, song)
        // if (createProgressBar) {
        //     this.createProgressBar(svgBoxId, progressBarId, 0)
        // }
    }

    // Draws in one canvas all tracks mixed together
    public drawTracksCollapsedGraphic(
        svgBoxId: string,
        song: Song,
        simplificationNo: number,
        createProgressBar: boolean,
        progressBarId?: string): string {

        const svgBox = document.getElementById(svgBoxId)
        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])
        if (!svgBox) return

        for (let i = 0; i < simplif.numberOfVoices; i++) {
            const instrument = simplif.getInstrumentOfVoice(i)
            const isPercusion = simplif.isVoicePercusion(i)
            const color = this.getColor(instrument, isPercusion)
            this.paintNotesTrack(song, simplificationNo, null, svgBoxId, color)
        }
        this.createStaffBars(svgBoxId, song)
        if (createProgressBar) this.createProgressBar(svgBoxId, progressBarId, 0)
    }
    private paintNotesTrack(
        song: Song,
        simplificationNo: number,
        trackNumber: number,
        svgBoxId: string,
        color: string) {
        const totalHeight = 128
        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])
        const notes = trackNumber === null ? simplif.notes : simplif.getNotesOfVoice(trackNumber)
        for (const note of notes) {
            const cx: number = note.startSinceBeginningOfSongInTicks
            const cy: number = totalHeight - note.pitch
            this.createNote(cx, cy, note.durationInTicks, color, svgBoxId)
        }
    }
    private createStaffBars(
        svgBoxId: string,
        song: Song) {
        const svgBox = document.getElementById(svgBoxId)
        if (svgBox) {
            const fontSize = 10
            const songStats = new SongStats(song.songStats)
            const barwidth = songStats.getTicksPerBar()
            const textLength = barwidth / 3
            const totalBars = songStats.numberBars
            const pitchSpaceLength = 128
            for (let bar = 0; bar < totalBars; bar++) {
                const barx = barwidth * bar
                this.createLine(barx, barx, 0, pitchSpaceLength, 10, this.colorMusicBar, 0, '', svgBox)
                const xOfText = barx + barwidth / 3
                this.createText((bar + 1).toString(), xOfText, fontSize,
                    fontSize, textLength, svgBox)

            }
        }
    }

    private createHorizontalLinesAtCnotes(
        svgBoxId: string,
        song: Song) {
        const lineStart = 0
        const svgBox = document.getElementById(svgBoxId)
        const totalLength = song.songStats.numberOfTicks
        const width = 1
        const dotSize = 1
        if (svgBox) {
            for (let i = 0; i < 128; i += 12) {

                this.createLine(lineStart, totalLength, i, i, width, this.colorMusicBar, dotSize, '', svgBox)
            }
        }
    }



}
