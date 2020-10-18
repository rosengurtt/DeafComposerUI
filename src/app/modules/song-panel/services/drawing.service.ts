import { Injectable } from '@angular/core'

import { Instrument } from '../../../core/models/midi/midi-codes/instrument.enum'
import { SongSimplification } from '../../../core/models/song-simplification'
import { Song } from '../../../core/models/song'
import { Note } from '../../../core/models/note'
import { SongStats } from 'src/app/core/models/song-stats'


@Injectable()
export class DrawingService {
    svgns = 'http://www.w3.org/2000/svg'
    colorMusicBar = 'rgb(200,180,170)'
    colorProgressBar = 'rgb(200,0,0)'
    // keyboards are blue
    colorPiano = 'rgb(51,0,153)'
    colorOrgan = 'rgb(71,0,214)'
    colorSynthLead = 'rgb(0,102,153)'
    colorSynthPad = 'rgb(99,20,255)'
    colorSynthEffects = 'rgb(0,0,102)'
    colorEnsemble = 'rgb(122,122,255)'
    // bass is violet
    colorBass = 'rgb(163,0,163)'
    // string are red
    colorGuitar = 'rgb(214,0,0)'
    colorStrings = 'rgb(255,20,99)'
    // viento are green
    colorBrass = 'rgb(0,102,0)'
    colorReed = 'rgb(102,102,0)'
    colorPipe = 'rgb(0,224,0)'
    // drums and percussion are black
    colorDrums = 'rgb(0,0,0)'
    colorPercussion = 'rgb(50,50,50)'
    colorEthnic = 'rgb(100,100,100'
    colorSoundEffects = 'rgb(140,140,140)'

    noteDotRadio = 1

    private getColor(instrument: Instrument, isPercusion: boolean): string {
        if (isPercusion) { return this.colorDrums }
        if (instrument < 8) { return this.colorPiano }
        if (instrument < 16) { return this.colorPercussion }
        if (instrument < 24) { return this.colorOrgan }
        if (instrument < 32) { return this.colorGuitar }
        if (instrument < 40) { return this.colorBass }
        if (instrument < 48) { return this.colorStrings }
        if (instrument < 56) { return this.colorEnsemble }
        if (instrument < 64) { return this.colorBrass }
        if (instrument < 72) { return this.colorReed }
        if (instrument < 80) { return this.colorPipe }
        if (instrument < 88) { return this.colorSynthLead }
        if (instrument < 96) { return this.colorSynthPad }
        if (instrument < 104) { return this.colorSynthEffects }
        if (instrument < 112) { return this.colorEthnic }
        if (instrument < 120) { return this.colorPercussion }
        return this.colorSoundEffects
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
                    this.colorProgressBar, progressBarId, svgBox)
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
        id: string,
        svgBox: any): any {
        const line: any = document.createElementNS(this.svgns, 'line')
        line.setAttributeNS(null, 'width', width)
        line.setAttributeNS(null, 'x1', x1)
        line.setAttributeNS(null, 'x2', x2)
        line.setAttributeNS(null, 'y1', y1)
        line.setAttributeNS(null, 'y2', y2)
        line.setAttributeNS(null, 'style', 'stroke:' + color)
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
        line.setAttributeNS(null, 'style', 'stroke:' + color)
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
        fontSize: string,
        svgBox: any) {
        const textElement: any = document.createElementNS(this.svgns, 'text')
        const textNode = document.createTextNode(text)
        textElement.appendChild(textNode)
        textElement.setAttributeNS(null, 'x', x)
        textElement.setAttributeNS(null, 'y', y)
        textElement.setAttributeNS(null, 'font-size', fontSize)
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
        const svgBoxWidth = svgBox.clientWidth
        const svgBoxHeight = svgBox.clientHeight
        //this.cleanSvg(svgBoxId)
        let horizontalScale: number = svgBoxWidth / song.songStats.numberOfTicks

        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])
        const notes = simplif.getNotesOfVoice(trackNumber)
        const pitchSpaceLength = 128
        const verticalScale: number = svgBoxHeight / pitchSpaceLength
        const instrument = simplif.getInstrumentOfVoice(trackNumber)
        const isPercusion = simplif.isVoicePercusion(trackNumber)
        const color = this.getColor(instrument, isPercusion)


        this.paintNotesTrack(notes, horizontalScale, verticalScale, svgBoxId, color)

        this.createStaffBars(horizontalScale, svgBoxId, song)
        if (createProgressBar) {
            this.createProgressBar(svgBoxId, progressBarId, 0)
        }
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
        if (!svgBox) {
            return
        }
        const svgBoxWidth = svgBox.clientWidth
        const svgBoxHeight = svgBox.clientHeight
        //this.cleanSvg(svgBoxId)
        let horizontalScale: number = svgBoxWidth / song.songStats.numberOfTicks

        const pitchSpaceLength = 128
        const verticalScale: number = svgBoxHeight / pitchSpaceLength
        for (let i = 0; i < simplif.numberOfVoices; i++) {
            const instrument = simplif.getInstrumentOfVoice(i)
            const isPercusion = simplif.isVoicePercusion(i)
            const color = this.getColor(instrument, isPercusion)

            this.paintNotesTrack(simplif.getNotesOfVoice(i), horizontalScale, verticalScale, svgBoxId, color)
        }
        this.createStaffBars(horizontalScale, svgBoxId, song)
        if (createProgressBar) {
            this.createProgressBar(svgBoxId, progressBarId, 0)
        }
    }
    private paintNotesTrack(
        noteSeq: Note[],
        horizontalScale: number,
        verticalScale: number,
        svgBoxId: string,
        color: string) {
        const svgBox = document.getElementById(svgBoxId)
        const svgBoxWidth = svgBox.clientWidth
        const svgBoxHeight = svgBox.clientHeight
        for (const note of noteSeq) {
            const cx: number = note.startSinceBeginningOfSongInTicks * horizontalScale
            const cy: number = svgBoxHeight - note.pitch * verticalScale
            if (cx  < svgBoxWidth &&
                cx  > 0 &&
                cy < svgBoxHeight &&
                cy > 0) {
                this.createNote(cx, cy, note.durationInTicks * horizontalScale, color, svgBoxId)
            }
        }
    }
    private createStaffBars(
        horizontalScale: number,
        svgBoxId: string,
        song: Song) {
        const svgBox = document.getElementById(svgBoxId)
        if (svgBox) {
            const svgBoxWidth = svgBox.clientWidth
            const svgBoxHeight = svgBox.clientHeight
            const fontSize = 10
            let barx = 0
            const songStats= new SongStats(song.songStats)
            const barwidth = songStats.getTicksPerBar() * horizontalScale
            let barNo = 1 
            let xOfPreviousBarNumber = 0
            while (barx < svgBoxWidth) {
                this.createLine(barx, barx, 0, svgBoxHeight, 1, this.colorMusicBar, '', svgBox)
                const xOfText = ((barwidth < 15) || (barNo > 100)) ? barx + 1 : barx + barwidth / 3
                // Show the bar number if there is enough space between bars
                if (xOfText - xOfPreviousBarNumber > 20) {
                    this.createText(barNo.toString(), xOfText, fontSize, fontSize.toString(), svgBox)
                    xOfPreviousBarNumber = xOfText
                }
                barx += barwidth
                barNo++
            }
        }
    }


    // Cleans the graphic and the information svg boxes
    private cleanSvg(svgBoxId: string) {
        let svgBox = document.getElementById(svgBoxId)
        const parentElement = svgBox.parentElement
        const emptySvg = svgBox.cloneNode(false)
        parentElement.removeChild(svgBox)
        parentElement.appendChild(emptySvg)
        svgBox = document.getElementById(svgBoxId)
    }
}