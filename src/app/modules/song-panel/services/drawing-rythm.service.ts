import { Injectable } from '@angular/core'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { Song } from 'src/app/core/models/song'
import { Note } from 'src/app/core/models/note'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { TimeSignature } from 'src/app/core/models/time-signature'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { reportInvalidActions } from '@ngrx/effects/src/effect_notification'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'
    separation = 50

    // We assign to each quarter, eightth, sixteenth or whatever a total of 50 px width
    // The height is always 50 px
    // We insert a vertical bar between compases that ocupies a total space of 50 px
    // The total length is dependent on the number of notes that have to be drawn, a song
    // that consists mostly of quarter notes will occupy less space per bar than a song
    // that consists of sixteenths
    public drawTrackGraphic(
        voice: number,
        svgBoxId: string,
        song: Song,
        simplificationNo: number,
        fromBar: number,
        toBar: number): string {
        const svgBox = document.getElementById(svgBoxId)
        if (!svgBox) {
            return
        }
        this.clearSVGbox(svgBox)
        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])

        const isPercusion = simplif.isVoicePercusion(voice)

        const notes = simplif.getNotesOfVoice(voice, song, fromBar, toBar)

        this.drawNotes(svgBox, song, voice, simplificationNo, fromBar, toBar)
    }

    private clearSVGbox(svgBox: HTMLElement) {
        while (svgBox.firstChild) {
            svgBox.removeChild(svgBox.firstChild)
        }
    }


    private drawNotes(svgBox: HTMLElement, song: Song, voice: number, simplificationNo: number, fromBar: number, toBar: number): void {
        this.drawTimeSignature(svgBox, 0, song.songStats.timeSignature,)
        let x = 40
        let events = this.getSequenceOfNotesAndSilences(song, simplificationNo, voice, fromBar, toBar)
        for (let i = 0; i < events.length; i++) {

        }
    }

    private getDurationOfEvent(event: SoundEvent): NoteDuration {
        if (event.duration > 96 * 4) return NoteDuration.whole
        if (event.duration >= 80 && event.duration <= 110) return NoteDuration.quarter
        if (event.duration > 55 && event.duration < 80) {
            this.drawRest(svgBox, NoteDuration.eight, x)
            this.drawRest(svgBox, NoteDuration.sixteenth, x + 30)
            this.drawTie(svgBox, x, x + 50)
        }
        if (event.duration >= 35 && event.duration <= 55)
            this.drawRest(svgBox, NoteDuration.eight, x)
        if (event.duration >= 17 && event.duration <= 34)
            this.drawRest(svgBox, NoteDuration.sixteenth, x)
        if (event.duration >= 10 && event.duration <= 16)
            this.drawRest(svgBox, NoteDuration.thirtysecond, x)
        if (event.duration <= 9)
            this.drawRest(svgBox, NoteDuration.sixtyfourth, x)

    }

    private getSequenceOfNotesAndSilences(song: Song, simplificationNo: number, voice: number, fromBar: number, toBar: number): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        const tolerance = 10
        let startTick = song.bars[fromBar - 1].ticksFromBeginningOfSong
        let endOfLastComputedNote = 0
        const simplif = song.songSimplifications[simplificationNo]
        // Look at end of previous bar to see if we have a note still playing from the previous bar
        if (fromBar > 1) {
            let latestNoteFromPreviousBar = simplif.notes
                .filter(x => x.voice == voice && x.startSinceBeginningOfSongInTicks < startTick)
                .sort((n1, n2) => n2.startSinceBeginningOfSongInTicks - n1.startSinceBeginningOfSongInTicks)[0]
            if (latestNoteFromPreviousBar.endSinceBeginningOfSongInTicks > startTick + tolerance) {
                let event = new SoundEvent(SoundEventType.note, latestNoteFromPreviousBar.startSinceBeginningOfSongInTicks,
                    latestNoteFromPreviousBar.endSinceBeginningOfSongInTicks)
                retObj.push(event)
                endOfLastComputedNote = event.endTick
            }
        }
        const notes = simplif.getNotesOfVoice(voice, song, fromBar, toBar)
        for (let i = 0; i < notes.length; i++) {
            if (endOfLastComputedNote < notes[i].startSinceBeginningOfSongInTicks - tolerance) {
                let event = new SoundEvent(SoundEventType.silence, endOfLastComputedNote, notes[i].startSinceBeginningOfSongInTicks)
                retObj.push(event)
                endOfLastComputedNote = notes[i].startSinceBeginningOfSongInTicks
            }
            retObj.push(new SoundEvent(SoundEventType.note, notes[i].startSinceBeginningOfSongInTicks, notes[i].endSinceBeginningOfSongInTicks))
            endOfLastComputedNote = notes[i].endSinceBeginningOfSongInTicks
        }
        return retObj
    }

    // A silence can be divided in a sequence of silences. For example if a silence extends to the next bar, we split it
    // in 2, one that ends with the first bar and one that starts with the second.
    // If a silence is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    // The same with the notes
    private standardizeSequenceOfNotesAndSilences(input: SoundEvent[], barLength: number): SoundEvent[] {
        let retObj = this.splitEventsThatExtendToNextBar(input, barLength)
    }

    private splitEventsThatExtendToNextBar(input: SoundEvent[], barLength: number): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        for (let i = 0; i < input.length; i++) {
            const startBar = input[i].startTick / barLength
            const endBar = input[i].endTick / barLength
            const barDiff = endBar - startBar
            if (barDiff > 0) {
                let splitPoints = <number[]>[]
                for (let i = 0; i < barDiff; i++)
                    splitPoints.push((startBar + 1) * barLength)
                const splitEvents = this.splitEvent(input[i], splitPoints)
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
    private splitEventsThatHaveOddDurations(input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        retObj = this.splitEventsLongerThanAwhole(input)
        for (let i = 0; i < input.length; i++) {
        }
    }

    private splitEventsLongerThanAwhole(input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        const tolerance = 10
        for (let i = 0; i < input.length; i++) {
            const e = input[i]
            if (e.duration < 96 * 4 + tolerance) {
                retObj.push(input[i])
            }
            else {
                for (let j = 0; j < e.duration / (96 * 4); j++) {
                    let endTick = Math.min(e.endTick, e.startTick + ((j + 1) * 96 * 4))
                    const ev = new SoundEvent(e.type, e.startTick + (j * 96 * 4), endTick)
                    retObj.push(ev)
                }
            }
        }
        return retObj
    }

    private splitEventsLongerThanAHalfShorterThanAWhole(input: SoundEvent[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        const tolerance = 10
        for (let i = 0; i < input.length; i++) {
            const e = input[i]
            if (e.duration < 96 * 2 + tolerance || e.duration > 96 * 4 - tolerance) {
                retObj.push(input[i])
            }
            else {
                let splitPoints=<number[]>[]
                splitPoints.push(this.getSplitPoint(e.startTick,e.endTick))
                const splittedEvents = this.splitEvent(e, splitPoints)
                retObj= retObj.concat(splittedEvents)
            }
        }
        return retObj
    }

    // When we want to split a note or silence in 2, we prefer to select intervals that start and stop in 
    // hard beats. This functions tries to find the point inside an interval where the beat is hardest
    private getSplitPoint(start: number, end: number): number {
        const diff = end - start

        for (let n = 96 * 2; n > 3; n = n / 2) {
            if (diff > n) {
                const k = end % n
                return end - k
            }
        }
    }

    // When we want to split a sound event in many, for ex. because the event extends from one bar to the next, we
    // call this function and we pass the points where we want to split the event (it could for ex. extend several bars,
    // not just 2) and it returns a sequence of events that correspond to the split points we passed
    private splitEvent(e: SoundEvent, splitPoints: number[]) {
        let retObj = <SoundEvent[]>[]
        let lastStarPoint = 0
        for (let i = 0; i < splitPoints.length; i++) {
            retObj.push(new SoundEvent(e.type, lastStarPoint, splitPoints[i]))
            lastStarPoint = splitPoints[i]
        }
        return retObj
    }

    private drawSilenceFromTicks(svgBox: HTMLElement, x: number, lenghtInTicks: number) {
        if (lenghtInTicks >= 80 && lenghtInTicks <= 110)
            this.drawRest(svgBox, NoteDuration.quarter, x)
        if (lenghtInTicks > 55 && lenghtInTicks < 80) {
            this.drawRest(svgBox, NoteDuration.eight, x)
            this.drawRest(svgBox, NoteDuration.sixteenth, x + 30)
            this.drawTie(svgBox, x, x + 50)
        }
        if (lenghtInTicks >= 35 && lenghtInTicks <= 55)
            this.drawRest(svgBox, NoteDuration.eight, x)
        if (lenghtInTicks >= 17 && lenghtInTicks <= 34)
            this.drawRest(svgBox, NoteDuration.sixteenth, x)
        if (lenghtInTicks >= 10 && lenghtInTicks <= 16)
            this.drawRest(svgBox, NoteDuration.thirtysecond, x)
        if (lenghtInTicks <= 9)
            this.drawRest(svgBox, NoteDuration.sixtyfourth, x)
    }
    private drawNoteFromTicks(svgBox: HTMLElement, x: number, lenghtInTicks: number) {
        if (lenghtInTicks >= 80 && lenghtInTicks <= 110)
            this.drawRest(svgBox, NoteDuration.quarter, x)
        if (lenghtInTicks > 55 && lenghtInTicks < 80) {
            this.drawRest(svgBox, NoteDuration.eight, x)
            this.drawRest(svgBox, NoteDuration.sixteenth, x + 30)
            this.drawTie(svgBox, x, x + 50)
        }
        if (lenghtInTicks >= 35 && lenghtInTicks <= 55)
            this.drawRest(svgBox, NoteDuration.eight, x)
        if (lenghtInTicks >= 17 && lenghtInTicks <= 34)
            this.drawRest(svgBox, NoteDuration.sixteenth, x)
        if (lenghtInTicks >= 10 && lenghtInTicks <= 16)
            this.drawRest(svgBox, NoteDuration.thirtysecond, x)
        if (lenghtInTicks <= 9)
            this.drawRest(svgBox, NoteDuration.sixtyfourth, x)
    }

    private getLengthOfBarInTicks(timeSignature: TimeSignature) {
        const ticksPerQuarterNote = 96
        switch (timeSignature.denominator) {
            case 2:
                return ticksPerQuarterNote * 2 * timeSignature.numerator
            case 4:
                return ticksPerQuarterNote * timeSignature.numerator
            case 8:
                return ticksPerQuarterNote / 2 * timeSignature.numerator
            case 16:
                return ticksPerQuarterNote / 4 * timeSignature.numerator
        }
    }

    private drawTimeSignature(svgBox: HTMLElement, x: number, timeSignature: TimeSignature) {
        this.createText(svgBox, timeSignature.numerator.toString(), x + 10, 40, 20, 'black')
        this.createText(svgBox, timeSignature.denominator.toString(), x + 10, 80, 20, 'black')
    }

    private drawBarLine(svgBox: HTMLElement, x: number) {
        this.drawPath(svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
    }

    private drawTie(svgBox: HTMLElement, x1: number, x2: number) {
        this.drawPath(svgBox, 'black', 2, `M ${x1},95 Q ${(x1 + x2) / 2},110 ${x2},95 z`)
        this.drawPath(svgBox, 'white', 7, `M ${x1},92 Q ${(x1 + x2) / 2},100 ${x2},92 z`)
    }


    private drawNote(svgBox: HTMLElement, type: NoteDuration, x: number, qty: number = 1): Element {
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

    private drawRest(svgBox: HTMLElement, type: NoteDuration, x: number) {
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


}