import { Injectable } from '@angular/core'
import { SongSimplification } from 'src/app/core/models/song-simplification'
import { Song } from 'src/app/core/models/song'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { TimeSignature } from 'src/app/core/models/time-signature'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { timestamp } from 'rxjs/operators'
import { Time } from '@angular/common'
import { NumberInput } from '@angular/cdk/coercion'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'
    separation = 50
    ticksPerQuarterNote = 96
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
    public drawTrackGraphic(
        voice: number,
        svgBoxId: string,
        song: Song,
        simplificationNo: number,
        fromBar: number,
        toBar: number): number {
        const svgBox = document.getElementById(svgBoxId)
        if (!svgBox) {
            return
        }
        this.clearSVGbox(svgBox)
        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])

        const isPercusion = simplif.isVoicePercusion(voice)

        const notes = simplif.getNotesOfVoice(voice, song, fromBar, toBar)

        this.timeSignature = song.songStats.timeSignature
        this.barLengthInTicks = this.ticksPerQuarterNote * this.timeSignature.numerator * 4 / this.timeSignature.denominator
        this.barSeparationInPixels= this.ticksPerQuarterNote * 1.3 * this.timeSignature.numerator
        this.standardWidth = this.barLengthInTicks / 12

        return this.drawNotes(svgBox, song, voice, simplificationNo, fromBar, toBar)
    }

    private clearSVGbox(svgBox: HTMLElement) {
        while (svgBox.firstChild) {
            svgBox.removeChild(svgBox.firstChild)
        }
    }


    private drawNotes(svgBox: HTMLElement, song: Song, voice: number, simplificationNo: number, fromBar: number, toBar: number): number {
        let x = 0
        x += this.drawTimeSignature(svgBox, 0, song.songStats.timeSignature)

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
                this.drawBarLine(svgBox, barLine * this.barSeparationInPixels)
                x = barLine * this.barSeparationInPixels + this.standardWidth
            }
        }
        return x
    }

    // When we draw the events, there are cases where we have to draw together a group of notes:
    // - when we have consecutive eights, sixteenths, thirtyseconds, etc. in the same bar, we draw them together with a beam
    // - when we have a duration of a note that is something like a quarter and an eight, we draw them as 2 symbols with a tie
    private getNextGroupToDrawTogehter(events: SoundEvent[], eventStart: number, barLength: number): SoundEvent[] {
        // If it is a silence return it, we don't group silences when we draw them
        if (events[eventStart].type == SoundEventType.silence) return new Array(events[eventStart])

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
        return this.standardizeSequenceOfNotesAndSilences(retObj, this.barLengthInTicks)
    }

    // A silence can be divided in a sequence of silences. For example if a silence extends to the next bar, we split it
    // in 2, one that ends with the first bar and one that starts with the second.
    // If a silence is a quarter and a half, we split it in one of 1 quarter and 1 eight. In this case we have to decide which
    // one goes first. We select the option that makes the silences start in the hardest bit
    // The same with the notes
    private standardizeSequenceOfNotesAndSilences(input: SoundEvent[], barLength: number): SoundEvent[] {
        let retObj = this.splitEventsThatExtendToNextBar(input, barLength)
        return this.splitEventsThatHaveOddDurations(retObj)
    }

    private splitEventsThatExtendToNextBar(input: SoundEvent[], barLength: number): SoundEvent[] {
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
        for (let i = 0; i < input.length; i++) {
            retObj = retObj.concat(this.normalizeInterval(input[i]))
        }
        return retObj
    }



    // We want all intervals of notes and silences to be a full quarter, or eight, etc and not a quarter and a half,
    // or stil worse a quarter plus an eight plus a sixteenth
    // This function splits a quarter and a half in 2 notes, a quarter plus an eight plus a sixteenth in 3, in such
    // a way tat all durations returned are a full interval and not a mix of intervals
    private normalizeInterval(e: SoundEvent, depht = 0): SoundEvent[] {
        // the following  line is needed because of typescript/javascript limitations
        e = new SoundEvent(e.type, e.startTick, e.endTick, e.isTiedToPrevious, e.isAccented)

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
                    const splitPoints = [this.getSplitPoint(e)]
                    const splittedEvent = this.splitEvent(e, splitPoints)
                    return this.normalizeInterval(splittedEvent[0], depht + 1).concat(this.normalizeInterval(splittedEvent[1], depht + 1))
                }
            }
        }

    }

    // When we want to split a note or silence in 2, we prefer to select intervals that start and stop in 
    // hard beats. This functions tries to find the point inside an interval where it makes more sense to
    // split a note
    private getSplitPoint(e: SoundEvent): number {
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
    private splitEvent(e: SoundEvent, splitPoints: number[]): SoundEvent[] {
        let retObj = <SoundEvent[]>[]
        let lastStartPoint = e.startTick
        for (let i = 0; i < splitPoints.length; i++) {
            retObj.push(new SoundEvent(e.type, lastStartPoint, splitPoints[i], i == 0 ? false : true))
            lastStartPoint = splitPoints[i]
        }
        retObj.push(new SoundEvent(e.type, lastStartPoint, e.endTick, true))
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

    private drawTimeSignature(svgBox: HTMLElement, x: number, timeSignature: TimeSignature): number {
        this.createText(svgBox, timeSignature.numerator.toString(), x + 10, 40, 20, 'black')
        this.createText(svgBox, timeSignature.denominator.toString(), x + 10, 80, 20, 'black')
        return 50
    }

    private drawBarLine(svgBox: HTMLElement, x: number): number {
        this.drawPath(svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
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


}