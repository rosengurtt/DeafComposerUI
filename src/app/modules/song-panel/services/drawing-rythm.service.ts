import { Injectable } from '@angular/core'
import { Instrument } from '../../../core/models/midi/midi-codes/instrument.enum'
import { SongSimplification } from '../../../core/models/song-simplification'
import { Song } from '../../../core/models/song'
import { Note } from '../../../core/models/note'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { noMonitor } from '@ngrx/store-devtools/src/config'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'

    // We assign to each quarter, eightth, sixteenth or whatever a total of 50 px width
    // The height is always 50 px
    // We insert a vertical bar between compases that ocupies a total space of 50 px
    // The total length is dependent on the number of notes that have to be drawn, a song
    // that consists mostly of quarter notes will occupy less space per bar than a song
    // that consists of sixteenths
    public drawTrackGraphic(
        trackNumber: number,
        svgBoxId: string,
        song: Song,
        simplificationNo: number): string {
        const svgBox = document.getElementById(svgBoxId)
        if (!svgBox) {
            return
        }
        this.removeChildren(svgBox)
        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])

        const instrument = simplif.getInstrumentOfVoice(trackNumber)
        const isPercusion = simplif.isVoicePercusion(trackNumber)

        this.drawNotes(trackNumber, svgBox, song, simplificationNo, null)
    }

    private removeChildren(svgBox: HTMLElement) {
        while (svgBox.firstChild) {
            svgBox.removeChild(svgBox.firstChild)
        }
    }


    private drawNotes(trackNumber: number,
        svgBox: HTMLElement,
        song: Song,
        simplificationNo: number,
        n: Note): void {
        let x = 30
        this.drawNote(NoteDuration.whole, svgBox, x)
        x += 50
        this.drawNote(NoteDuration.half, svgBox, x)
        x += 50
        this.drawNote(NoteDuration.quarter, svgBox, x)
        x += 50
        this.drawNote(NoteDuration.eight, svgBox, x)
        x += 50
        this.drawBarLine(svgBox, x)
        x+=40
        this.drawNote(NoteDuration.sixteenth, svgBox, x)
        x += 50
        this.drawNote(NoteDuration.thirtysecond, svgBox, x)
        x += 50
        this.drawNote(NoteDuration.sixtyfourth, svgBox, x)
        x += 50
        this.drawNote(NoteDuration.eight, svgBox, x, 2)
        x += 70
        this.drawNote(NoteDuration.eight, svgBox, x, 3)
        x += 90
        this.drawNote(NoteDuration.eight, svgBox, x, 4)

        this.drawTie(svgBox, x+80,x+120)
        x += 110
        this.drawNote(NoteDuration.sixteenth, svgBox, x, 2)
        x += 70
        this.drawNote(NoteDuration.sixteenth, svgBox, x, 3)
        x += 90
        this.drawNote(NoteDuration.sixteenth, svgBox, x, 4)
        x += 110
        this.drawRest(NoteDuration.eight, svgBox, x)
        x += 40
        this.drawRest(NoteDuration.sixteenth, svgBox, x)
        x += 40
        this.drawRest(NoteDuration.thirtysecond, svgBox, x)
        x += 40
        this.drawRest(NoteDuration.sixtyfourth, svgBox, x)
        x += 40
        this.drawRest(NoteDuration.quarter, svgBox, x)
    }

    private drawBarLine(svgBox: HTMLElement, x: number){
        this.drawPath(svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
    }

    private drawTie(svgBox: HTMLElement, x1: number, x2:number){
        this.drawPath(svgBox, 'black', 2, `M ${x1},95 Q ${(x1+x2)/2},110 ${x2},95 z`)
        this.drawPath(svgBox, 'white', 7, `M ${x1},92 Q ${(x1+x2)/2},100 ${x2},92 z`)
    }

    private drawNote(type: NoteDuration, svgBox: HTMLElement, x: number, qty: number = 1): Element {
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

        return group
    }

    private drawRest(type: NoteDuration, svgBox: HTMLElement, x: number) {
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        if (type == NoteDuration.quarter)
            this.drawQuarterRest(group, x)
        else {
            this.drawRestStem(group, x, type)
            this.drawRestSubStems(group, x, type)
        }
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
       this.drawPath(g, 'black', 12, `M ${8+x},40 V 79 z`)
       this.drawPath(g, 'white', 5, `M ${x+4},40 Q ${x+8},50 ${x+4},54 z`)
       this.drawPath(g, 'white', 6, `M ${x+10},40  ${x+18},52  z`)
       this.drawPath(g, 'white', 6, `M ${x+16},54 Q ${x+8},60 ${x+18},70  z`)
       this.drawPath(g, 'white', 10, `M ${x-4},54  ${x+6},70  z`)
       this.drawPath(g, 'white', 6, `M ${x+4},66  ${x+4},80  z`)
       this.drawPath(g, 'black', 4, `M ${x+14},72 Q ${x-2},62 ${x+10},80  z`)
       this.drawPath(g, 'white', 4, `M ${x+14},75 Q ${x+6},70 ${x+12},79  z`)
       this.drawPath(g, 'white', 4, `M ${x+16},66 V 80  z`)
      
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
                this.drawPath(g, 'black', 1,  `M${x + 10},${44 + 6 * i} Q ${x + 14},${47 + 6 * i} ${x + 19},${40 + 6 * i} z`)
            }
        }
        for (let i = 0; i < qtySubstems; i++) {
            this.drawPath(g, 'black', 2,  `M${x + 19},${40 + 4 * i} L ${x + qtyNotes * 20},${40 + 4 * i} z`)
        }
    }



}