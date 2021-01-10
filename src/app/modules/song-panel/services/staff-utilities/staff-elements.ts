import { Bar } from 'src/app/core/models/bar'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { TimeSignature } from 'src/app/core/models/time-signature'
import { DrawingCalculations } from './drawing-calculations'
import { BeatDrawingInfo } from 'src/app/core/models/beat-drawing-info'
import { KeySignatureEnum } from 'src/app/core/models/key-signature.enum'
import { Alteration } from 'src/app/core/models/alteration.enum'
import { KeySignature } from 'src/app/core/models/key-signature'

export abstract class StaffElements {
    private static svgns = 'http://www.w3.org/2000/svg'
    private static standardWidth = 50


    // We draw beat by beat. This is because when we have multiple notes in a beat, like 4 sixteens, we have to draw
    // a beam that connects them together. But if we have 8 sixteens in 2 consecutive beats, we connect the first 4
    // and the second 4, we don't connect the 8 together  
    // When we have a tie between beats, we pass in the tieStartX parameter the start point of a tie that started in a previous beat
    // A tie may span several beats
    public static drawBeat(g: Element, x: number, bar: Bar, beat: number, beatGraphNeeds: BeatGraphNeeds, eventsToDraw: SoundEvent[], tieStartX: number | null): BeatDrawingInfo {
        const timeSig = bar.timeSignature

        // if (timeSig.numerator == 3 && timeSig.denominator == 8)
        //     return this.drawBeatOf3_8bar(g, x, bar, beat, beatGraphNeeds, eventsToDraw, tieStartX)
        if (timeSig.numerator % 3 == 0 && timeSig.denominator == 8)
            return this.drawBeatOfbarWithTimeSig3x8(g, x, bar, beat, beatGraphNeeds, eventsToDraw, tieStartX)
        const beatDurationInTicks = 96 * 4 / timeSig.denominator
        const beatStartTick = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        const beatEndTick = beatStartTick + beatDurationInTicks
        const beatEvents = eventsToDraw
            .filter(e => e.startTick >= beatStartTick && e.startTick < beatEndTick)
            .sort((e1, e2) => e1.startTick - e2.startTick)

        // Check if first note has a tie that comes from a previous beat        
        if (beatEvents[0]?.isTiedToPrevious && beatEvents[0]?.type == SoundEventType.note) {
            this.drawTie(g, tieStartX, x)
            tieStartX = x
        }
        let tieEndX: number | null = null

        if (bar.barNumber == 22) {
            let lolo = 1
        }

        for (let i = 0; i < beatEvents.length; i++) {
            const e: SoundEvent = beatEvents[i]
            let deltaX = DrawingCalculations.calculateXofEventInsideBeat(e, beatGraphNeeds, beatStartTick)

            if (e.type == SoundEventType.note) {
                const notesSimultaneousToThisOne = beatEvents.filter(x => x.startTick == e.startTick && x.endTick == e.endTick && x.pitch != e.pitch)
                // if there is a single note, or there are some but they are simultaneous to this one,
                // we don't have to care about beams, just draw it
                if (beatEvents.filter(x => x.type == SoundEventType.note && !notesSimultaneousToThisOne.includes(x)).length == 1) {
                    const graph = this.drawSingleNote(g, e, x + deltaX)
                    e.graphic.push(graph)
                    e.x = x + deltaX
                }
                // if there are several notes, draw a 'quarter' that later will be converted to whatever it is by adding beams
                else {
                    const graph = StaffElements.drawBasicNote(g, x + deltaX, e)
                    e.graphic.push(graph)
                    e.x = x + deltaX
                }
            }
            // if it is a rest, draw the rest
            else this.drawRest(g, e.duration, x + deltaX)

            // Take care of ties

            // If the note is tied to previous, draw the tie
            if (e.type == SoundEventType.note && e.isTiedToPrevious) {
                tieEndX = x + deltaX
                this.drawTie(g, tieStartX, tieEndX)
            }
            // Update the start point for the next tie
            tieStartX = x + deltaX

        }
        this.drawBeatBeams(g, x, beatStartTick, beatGraphNeeds, beatEvents)

        return new BeatDrawingInfo(tieStartX, DrawingCalculations.calculateWidthInPixelsOfBeat(beatGraphNeeds))
    }

    // When we draw a note in the pentagram, y=0 is the A inside the G clef pentagram. We have to calculate
    // the number of pixels to move the note up or down so it shows in the correct place for the pitch#
    // The same pitch may be shown for ex as an A# or a Bb, depending on the alterations being used at that
    // point of the song. So we need that information too. 
    // alterations is an array that defines the alteration of each pitch, so  if alterations[37] is 
    // Alteration.Flat, it will be displayed as a Db, if it is Alteration.Sharp it will be displayed as C#
    private static getYofPitch(pitch: number, alterations: Map<number, Alteration>): number {
        let yOfPitches = new Map<number, number>()
        let majorScalePitches = [0, 2, 4, 5, 7, 9, 11]
        let pitchesNotInMajorScale = [1, 3, 6, 8, 10]

        // G cleff and up
        for (let i = 5; i < 8; i++) {
            for (const j of majorScalePitches) {
                let p = 12 * i + j
                let y = 30 - 6 * j - (i - 5) * 42  // 30 is the y of C4, 42 is the distance to the next C (C5)
                yOfPitches.set(p, y)
            }
            for (const j of pitchesNotInMajorScale) {
                let p= 12 * i + j
                let y = alterations.get(p) == Alteration.sharp ? 30 - 6 * j - (i - 5) * 42 : 24 - 6 * j - (i - 5) * 42
                yOfPitches.set(p, y)
            }
        }
        // F cleff and down
        for (let i = 2; i < 5; i++) {
            for (const j of majorScalePitches) {
                let p= 12 * i + j
                let y = 100 - 6 * j - (i - 4) * 42  // 100 is the y of C3
                yOfPitches.set(p, y)
            }
            for (const j of pitchesNotInMajorScale) {
                let p = 12 * i + j
                let y = alterations.get(p) == Alteration.sharp ? 100 - 6 * j - (i - 4) * 42: 94 - 6 * j - (i - 4) * 42
                yOfPitches.set(p, y)
            }
        }
        return yOfPitches.get(pitch)
    }


    // Draws beats of bars with a time signature of 3x/8 like 3/8, 6/8 or 12/8
    public static drawBeatOfbarWithTimeSig3x8(g: Element, x: number, bar: Bar, beat: number, beatGraphNeeds: BeatGraphNeeds, eventsToDraw: SoundEvent[], tieStartX: number | null): BeatDrawingInfo {
        // we draw the beats in groups of 3, so we make drawings in beat 1, 4, 7 and 10
        if ((beat - 1) % 3 != 0) return new BeatDrawingInfo(tieStartX, 0)

        const beatDurationInTicks = 48
        const beatStartTick = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        const beatEndTick = beatStartTick + beatDurationInTicks * 3
        const beatEvents = eventsToDraw
            .filter(e => e.startTick >= beatStartTick && e.startTick < beatEndTick)
            .sort((e1, e2) => e1.startTick - e2.startTick)

        // Check if first note has a tie that comes from a previous beat        
        if (beatEvents[0]?.isTiedToPrevious && beatEvents[0]?.type == SoundEventType.note) {
            this.drawTie(g, tieStartX, x)
            tieStartX = x
        }
        let tieEndX: number | null = null


        for (let i = 0; i < beatEvents.length; i++) {
            const e: SoundEvent = beatEvents[i]
            let deltaX = DrawingCalculations.calculateXofEventInsideBeat(e, beatGraphNeeds, beatStartTick)

            if (e.type == SoundEventType.note) {
                // if there is a single note, we don't have to care about beams, just draw it
                if (beatEvents.filter(x => x.type == SoundEventType.note).length == 1 ||
                    // if there are 2 notes and one of them is a quarter
                    (beatEvents.filter(x => x.type == SoundEventType.note).length == 2 &&
                        beatEvents.filter(x => x.type == SoundEventType.note && x.duration == NoteDuration.quarter).length > 0)
                ) {
                    const graph = this.drawSingleNote(g, e, x + deltaX)
                    e.graphic.push(graph)
                    e.x = x + deltaX
                }
                // if there are several notes, draw a 'quarter' that later will be converted to whatever it is by adding beams
                else {
                    const graph = StaffElements.drawBasicNote(g, x + deltaX, e)
                    e.graphic.push(graph)
                    e.x = x + deltaX
                }
            }
            // if it is a rest, draw the rest
            else this.drawRest(g, e.duration, x + deltaX)

            // Take care of ties
            // If the note is tied to previous, draw the tie
            if (e.type == SoundEventType.note && e.isTiedToPrevious) {
                tieEndX = x + deltaX
                this.drawTie(g, tieStartX, tieEndX)
            }
            // Update the start point for the next tie
            tieStartX = x + deltaX
        }
        this.drawBeatBeams(g, x, beatStartTick, beatGraphNeeds, beatEvents)
        return new BeatDrawingInfo(tieStartX, DrawingCalculations.calculateWidthInPixelsOfBeat(beatGraphNeeds))
    }



    // When a beat has several eights and/or sixteens, etc. we have to draw a beam connecting them
    // This method draws them
    private static drawBeatBeams(g: Element, x: number, beatStartTick: number, beatGraphNeeds: BeatGraphNeeds, beatEvents: SoundEvent[]): void {
        const thisBeatNoteEvents = beatEvents.filter(x => x.type == SoundEventType.note)
        for (let i = 0; i < thisBeatNoteEvents.length - 1; i++) {
            const startX = DrawingCalculations.calculateXofEventInsideBeat(thisBeatNoteEvents[i], beatGraphNeeds, beatStartTick)
            const endX = DrawingCalculations.calculateXofEventInsideBeat(thisBeatNoteEvents[i + 1], beatGraphNeeds, beatStartTick)

            if (this.isNoteShorterThan(thisBeatNoteEvents[i], NoteDuration.quarter) && this.isNoteShorterThan(thisBeatNoteEvents[i + 1], NoteDuration.quarter)) {

                this.drawBeam(g, x + startX, x + endX, NoteDuration.eight)
            }
            if (this.isNoteShorterThan(thisBeatNoteEvents[i], NoteDuration.eight) && this.isNoteShorterThan(thisBeatNoteEvents[i + 1], NoteDuration.eight)) {

                this.drawBeam(g, x + startX, x + endX, NoteDuration.sixteenth)
            }
            if (this.isNoteShorterThan(thisBeatNoteEvents[i], NoteDuration.sixteenth) && this.isNoteShorterThan(thisBeatNoteEvents[i + 1], NoteDuration.sixteenth))
                this.drawBeam(g, x + startX, x + endX, NoteDuration.thirtysecond)
            if (this.isNoteShorterThan(thisBeatNoteEvents[i], NoteDuration.thirtysecond) && this.isNoteShorterThan(thisBeatNoteEvents[i + 1], NoteDuration.thirtysecond))
                this.drawBeam(g, x + startX, x + endX, NoteDuration.sixtyfourth)
        }
    }

    private static drawBeam(g: Element, startX: number, endX: number, duration: NoteDuration): void {
        switch (duration) {
            case NoteDuration.eight:
                this.drawPath(g, "black", 1, `M ${startX + 19},40 L ${endX + 19},40 z`)
                break;
            case NoteDuration.sixteenth:
                this.drawPath(g, "black", 1, `M ${startX + 19},46 L ${endX + 19},46 z`)
                break;
            case NoteDuration.thirtysecond:
                this.drawPath(g, "black", 1, `M ${startX + 19},52 L ${endX + 19},52 z`)
                break;
            case NoteDuration.sixtyfourth:
                this.drawPath(g, "black", 1, `M ${startX + 19},58 L ${endX + 19},58 z`)
                break;
        }
    }

    public static drawPentagram(g: Element, length: number): void {
        this.drawPath(g, 'black', 1, `M 5,52 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,64 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,76 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,88 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,100 H ${length}`)

        this.drawPath(g, 'black', 1, `M 5,152 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,164 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,176 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,188 H ${length}`)
        this.drawPath(g, 'black', 1, `M 5,200 H ${length}`)
    }

    public static drawClefs(g: Element, x: number): number {
        this.drawGclef(g)
        this.drawFclef(g)
        return 55
    }

    // Given a sound event and an note duration, it returns if the event is a note shorther than the duration passed as parameter
    private static isNoteShorterThan(event: SoundEvent, duration: NoteDuration): boolean {
        if (event.type == SoundEventType.rest) return false
        // We have defined the enum with longest durations first, so the higher the enum, the shorter the note
        return event.duration > duration
    }

    // We draw the time signature in a bar if it is the first bar or if the time signature is different from the
    // previous bar
    public static mustDrawTimeSignature(barNumber: number, bars: Bar[]): boolean {
        if (barNumber == 1) return true
        const previousTimeSig = bars[barNumber - 2].timeSignature
        const currentTimeSig = bars[barNumber - 1].timeSignature
        if (previousTimeSig.numerator == currentTimeSig.numerator &&
            previousTimeSig.denominator == currentTimeSig.denominator)
            return false
        return true
    }
    public static mustDrawKeySignature(barNumber: number, bars: Bar[]): boolean {
        if (barNumber == 1) return true
        const previousKeySig = bars[barNumber - 2].keySignature
        const currentKeySig = bars[barNumber - 1].keySignature
        if (previousKeySig.key == currentKeySig.key)
            return false
        return true
    }
    // Returns the space it took in the drawing
    public static drawTimeSignature(g: Element, x: number, timeSignature: TimeSignature): number {
        StaffElements.createText(g, timeSignature.numerator.toString(), x + 10, 68, 30, 'black', null, 'bold')
        StaffElements.createText(g, timeSignature.denominator.toString(), x + 10, 105, 28, 'black', null, 'bold')

        StaffElements.createText(g, timeSignature.numerator.toString(), x + 10, 168, 30, 'black', null, 'bold')
        StaffElements.createText(g, timeSignature.denominator.toString(), x + 10, 205, 28, 'black', null, 'bold')
        return 50
    }
    public static drawBarLine(svgBox: Element, x: number): number {
        this.drawPath(svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
        return 50
    }
    public static drawBarNumber(g: Element, x: number, barNumber: number): number {
        this.createText(g, barNumber.toString(), x, 250, 20, 'blue')
        return 50
    }

    private static drawPath(g: Element, color: string, strokeWidth: number, path: string, style: string = null): Element {
        const arc = document.createElementNS(this.svgns, 'path')
        if (style != null)
            arc.setAttributeNS(null, 'style', style)
        else {
            arc.setAttributeNS(null, 'stroke', color)
            arc.setAttributeNS(null, 'stroke-width', strokeWidth.toString())
        }
        arc.setAttributeNS(null, 'd', path)
        g.appendChild(arc)
        return arc
    }

    private static drawEllipse(g: Element, cx: number, cy: number, rx: number, ry: number, color: string,
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

    // Draws a circle and a stem. The idea is that regardless of a note being a quarter, and eight or a
    // sixteenth, we draw it as a quarter, and then we add the needed beams to convert it to an eight or whatever
    public static drawBasicNote(svgBox: Element, x: number, e: SoundEvent, isCircleFull = true): Element {
        this.writeEventInfo(svgBox, e, x)
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        this.drawNoteCircle(group, x, isCircleFull)
        //this.drawEllipse(group, x + 13, 81, 7, 5, 'black', 2, `rotate(-25 ${x + 13} 81)`, isCircleFull)
        this.drawStem(group, x)
        if (e.alteration != null) {
            switch (<Alteration>e.alteration) {
                case Alteration.flat:
                    this.drawFlat(group, x, 0)
                    break
                case Alteration.cancel:
                    this.drawCancelAlteration(group, x, 0)
                    break
                case Alteration.sharp:
                    this.drawSharp(group, x, 0)
                    break
            }
        }
        return group
    }

    private static drawQuarterRest(g: Element, x: number) {
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

    public static drawSingleNote(svgBox: Element, e: SoundEvent, x: number): Element {
        this.writeEventInfo(svgBox, e, x)
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        switch (e.duration) {
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
                this.drawCircleAndStem(group, x)
                this.drawSubStems(group, x, 1, 1)
                break;
            case NoteDuration.sixteenth:
                this.drawCircleAndStem(group, x)
                this.drawSubStems(group, x, 2, 1)
                break;
            case NoteDuration.thirtysecond:
                this.drawCircleAndStem(group, x)
                this.drawSubStems(group, x, 3, 1)
                break;
            case NoteDuration.sixtyfourth:
                this.drawCircleAndStem(group, x)
                this.drawSubStems(group, x, 4, 1)
                break;
        }
        if (e.alteration != null) {
            switch (<Alteration>e.alteration) {
                case Alteration.flat:
                    this.drawFlat(group, x, 0)
                    break
                case Alteration.cancel:
                    this.drawCancelAlteration(group, x, 0)
                    break
                case Alteration.sharp:
                    this.drawSharp(group, x, 0)
                    break
            }
        }
        return group
    }

    public static drawRest(svgBox: Element, type: NoteDuration, x: number): void {
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        if (type == NoteDuration.whole) {
            for (let i = 0; i < 4; i++)
                this.drawQuarterRest(group, x + i * this.standardWidth)
            return
        }
        if (type == NoteDuration.half) {
            this.drawQuarterRest(group, x)
            this.drawQuarterRest(group, x + this.standardWidth)
            return
        }
        if (type == NoteDuration.quarter)
            this.drawQuarterRest(group, x)
        else {
            this.drawRestStem(group, x, type)
            this.drawRestSubStems(group, x, type)
        }
    }
    private static drawRestStem(g: Element, x: number, type: NoteDuration) {
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

    private static drawRestSubStems(g: Element, x: number, type: NoteDuration) {
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
    private static drawRestCircle(g: Element, x: number, y: number) {
        this.drawEllipse(g, x, y, 4, 4, 'black', 0, '', true)
    }
    private static drawRestArc(g: Element, x1: number, y1: number, x2: number, y2: number) {
        this.drawPath(g, 'black', 2, `M${x1},${y1} Q ${(x1 + x2) / 2},${y1 + 4} ${x2},${y2} z`)
    }

    private static drawNoteCircle(g: Element, x: number, isCircleFull = true) {
        this.drawEllipse(g, x + 13, 81, 7, 5, 'black', 2, `rotate(-25 ${x + 13} 81)`, isCircleFull)
    }

    private static drawCircleAndStem(parent: Element, x: number, isCircleFull = true) {
        this.drawNoteCircle(parent, x, isCircleFull)
        this.drawStem(parent, x)
    }

    private static drawStem(g: Element, x: number) {
        this.drawPath(g, 'black', 2, `M ${x + 19},40 V 78 z`)
    }

    private static drawSubStems(g: Element, x: number, qtySubstems: number, qtyNotes: number) {
        if (qtyNotes == 1) {
            for (let i = 0; i < qtySubstems; i++) {
                this.drawPath(g, 'black', 1, `M${x + 10},${44 + 6 * i} Q ${x + 14},${47 + 6 * i} ${x + 19},${40 + 6 * i} z`)
            }
        }
        for (let i = 0; i < qtySubstems; i++) {
            this.drawPath(g, 'black', 2, `M${x + 19},${40 + 4 * i} L ${x + qtyNotes * 20},${40 + 4 * i} z`)
        }
    }


    // x1 is the x of the starting note and x2 is the x of the ending note
    private static drawTie(svgBox: Element, x1: number, x2: number) {
        this.drawPath(svgBox, 'black', 2, `M ${x1},95 Q ${(x1 + x2) / 2},110 ${x2},95 z`)
        this.drawPath(svgBox, 'white', 7, `M ${x1},92 Q ${(x1 + x2) / 2},100 ${x2},92 z`)
    }

    private static drawGclef(g: Element) {
        const path = "M 25.549,964.001 C 101.96,964.846 99.8204,966.272 98.13,968.28 96.4394,970.287 95.4093,972.48 95.0395,974.857 94.6697,977.234 94.9735,979.585 95.9508,981.909 96.9281,984.234 98.7639,986.109 101.458,987.536 102.092,987.536 102.488,987.8 102.647,988.328 102.805,988.856 102.567,989.12 101.934,989.12 99.345,988.592 97.0734,987.509 95.1188,985.872 91.4736,982.86 89.4662,978.978 89.0964,974.223 88.8851,971.846 89.1096,969.548 89.77,967.329 90.4303,965.11 91.3416,963.076 92.5038,961.227 93.9301,959.273 95.6206,957.582 97.5753,956.156 97.6809,956.05 97.9847,955.813 98.4865,955.443 98.9884,955.073 99.477,954.73 99.9525,954.413 100.428,954.096 101.141,953.594 102.092,952.907 L 99.1601,938.802 C 96.5715,940.968 94.0094,943.358 91.4737,945.973 88.9379,948.588 86.6399,951.349 84.5796,954.254 82.5194,957.16 80.8685,960.237 79.627,963.486 78.3856,966.735 77.7649,970.155 77.7649,973.748 77.7649,977.076 78.4648,980.206 79.8648,983.138 81.2647,986.07 83.1269,988.619 85.4513,990.784 87.7757,992.95 90.4567,994.654 93.4943,995.896 96.5319,997.137 99.6091,997.758 102.726,997.758 102.832,997.758 103.32,997.705 104.192,997.599 105.064,997.494 105.988,997.362 106.965,997.203 107.943,997.045 108.841,996.873 109.66,996.688 110.478,996.503 110.888,996.305 110.888,996.094 L 110.412,993.875 C 108.352,983.468 106.397,973.51 104.549,964.001 z M 107.322,963.684 113.82,995.143 C 117.571,993.716 120.106,991.273 121.427,987.813 122.748,984.353 123.051,980.84 122.338,977.274 121.625,973.708 119.948,970.551 117.306,967.804 114.665,965.057 111.337,963.684 107.322,963.684 z M 99.0016,921.29 C 100.639,920.444 102.158,919.177 103.558,917.486 104.958,915.796 106.252,913.986 107.441,912.058 108.629,910.13 109.66,908.162 110.531,906.154 111.403,904.147 112.103,902.325 112.631,900.687 113.212,898.944 113.608,896.989 113.82,894.823 114.031,892.657 113.688,890.835 112.79,889.355 112.156,888.035 111.324,887.269 110.294,887.057 109.263,886.846 108.233,886.925 107.203,887.295 106.173,887.665 105.196,888.259 104.271,889.078 103.347,889.897 102.673,890.623 102.251,891.257 101.088,893.317 100.071,895.615 99.1997,898.151 98.328,900.687 97.7337,903.315 97.4168,906.036 97.0998,908.756 97.0602,911.371 97.2979,913.881 97.5356,916.39 98.1035,918.86 99.0016,921.29 z M 96.6244,923.746 C 95.7263,920.26 94.9339,916.839 94.2471,913.484 93.5603,910.13 93.217,906.683 93.217,903.143 93.217,900.555 93.4019,897.715 93.7717,894.625 94.1414,891.535 94.815,888.523 95.7923,885.591 96.7696,882.659 98.1167,880.031 99.8336,877.707 101.551,875.382 103.835,873.692 106.688,872.635 106.952,872.53 107.216,872.477 107.48,872.477 107.85,872.477 108.286,872.688 108.788,873.111 109.29,873.533 109.818,874.154 110.373,874.973 110.927,875.792 111.416,876.637 111.839,877.509 112.261,878.38 112.578,878.975 112.79,879.292 114.216,881.986 115.259,884.852 115.92,887.889 116.58,890.927 116.963,893.951 117.069,896.962 117.28,901.506 117.029,905.996 116.316,910.434 115.603,914.871 114.163,919.203 111.997,923.429 111.258,924.697 110.505,925.978 109.739,927.272 108.973,928.567 108.062,929.821 107.005,931.036 106.794,931.248 106.411,931.631 105.856,932.185 105.301,932.74 104.733,933.308 104.152,933.889 103.571,934.47 103.056,935.012 102.607,935.513 102.158,936.015 101.934,936.319 101.934,936.425 L 105.182,952.273 C 105.203,952.377 106.807,952.273 106.807,952.273 109.907,952.312 113.189,952.814 116.039,953.937 118.786,955.205 121.15,956.948 123.131,959.167 125.112,961.386 126.696,963.882 127.885,966.655 129.074,969.429 129.668,972.242 129.668,975.095 129.668,977.947 129.245,980.853 128.4,983.811 126.234,989.411 122.774,993.558 118.02,996.252 117.491,996.569 116.738,996.926 115.761,997.322 114.784,997.718 114.401,998.339 114.612,999.184 115.88,1004.94 116.738,1008.9 117.188,1011.07 117.637,1013.24 117.967,1016.04 118.178,1019.47 118.389,1022.75 117.821,1025.7 116.474,1028.34 115.127,1030.99 113.318,1033.14 111.046,1034.8 108.775,1036.47 106.701,1037.44 104.826,1037.74 102.95,1038.03 101.669,1038.17 100.983,1038.17 98.6054,1038.17 96.281,1037.72 94.0094,1036.82 91.2095,1035.77 88.8587,1034.16 86.9569,1031.99 85.0551,1029.82 84.1042,1027.18 84.1042,1024.07 84.1042,1022.11 84.6721,1020.1 85.8079,1018.04 86.9437,1015.98 88.4361,1014.5 90.285,1013.61 92.3453,1012.55 94.2075,1012.26 95.8716,1012.73 97.5356,1013.21 98.9091,1014.11 99.9921,1015.43 101.075,1016.75 101.828,1018.35 102.251,1020.22 102.673,1022.1 102.647,1023.85 102.171,1025.49 101.696,1027.13 100.732,1028.52 99.279,1029.65 97.8262,1030.79 95.8055,1031.3 93.217,1031.2 94.2735,1033.1 95.7527,1034.3 97.6545,1034.8 99.5563,1035.31 101.511,1035.34 103.518,1034.92 105.526,1034.5 107.414,1033.72 109.184,1032.58 110.954,1031.45 112.341,1030.22 113.344,1028.9 113.978,1027.95 114.454,1026.71 114.771,1025.18 115.088,1023.64 115.273,1022.05 115.325,1020.38 115.378,1018.72 115.325,1017.42 115.167,1016.5 115.008,1015.57 114.744,1014.13 114.374,1012.18 112.79,1005.79 111.786,1001.77 111.363,1000.13 111.152,999.607 110.584,999.435 109.66,999.62 108.735,999.805 107.956,999.977 107.322,1000.13 102.779,1000.72 98.9752,1000.45 95.9112,999.343 91.1567,998.075 86.9701,995.816 83.3514,992.567 79.7327,989.319 76.8272,985.383 74.6348,980.76 72.4425,976.138 71.3463,972.625 71.3463,970.221 71.3463,967.818 71.3463,966.299 71.3463,965.665 71.3463,961.386 72.0859,957.371 73.5651,953.62 76.3649,947.756 79.6799,942.368 83.5099,937.455 87.3399,932.542 91.7114,927.972 96.6244,923.746 z"
        const style = "fill:#000000;stroke:none;"
        let clef = this.drawPath(g, 'black', 0, path, style)
        clef.setAttributeNS(null, 'transform', 'translate(-35,-500) scale(0.6 0.6)')
    }

    private static drawFclef(g: Element) {
        const path = "m 62.511677,127.84048 c 0,-0.83977 4.041963,-4.29526 8.982141,-7.67885 10.621365,-7.27471 18.291956,-15.2339 22.753427,-23.609504 10.231245,-19.207279 6.990215,-39.234197 -6.645392,-41.063116 -7.541825,-1.01157 -17.090176,4.491435 -17.090176,9.84959 0,1.98778 0.508501,2.147884 6.037438,1.900912 6.764925,-0.302182 11.341654,6.282702 7.680759,11.050886 -5.784567,7.53419 -19.718197,3.205925 -19.718197,-6.12515 0,-8.178104 4.976735,-14.686661 13.736031,-17.963933 18.744999,-7.013402 36.588252,5.915889 35.025872,25.379878 -1.28058,15.953347 -15.170703,30.852697 -42.135847,45.197347 -6.39814,3.40362 -8.626056,4.19445 -8.626056,3.06194 z"
        const style = "fill:#000000"
        let clef = this.drawPath(g, 'black', 0, path, style)
        this.drawEllipse(g, 45, 158, 3, 2, 'black', 2, '', true)
        this.drawEllipse(g, 45, 170, 3, 2, 'black', 2, '', true)
        clef.setAttributeNS(null, 'transform', 'matrix(3,0,0,3,15,-150) translate(-15,90) scale(0.2 0.2)')
    }

    private static drawSharpOfKeySignature(g: Element, sharpNo: number, x: number): number {
        let deltaX: number = 11
        let deltaY: number = 0
        switch (sharpNo) {
            case 1:
                deltaY = 81
                break
            case 2:
                deltaY = 101
                break
            case 3:
                deltaY = 75
                break
            case 4:
                deltaY = 95
                break
            case 5:
                deltaY = 111
                break
            case 6:
                deltaY = 89
                break
            case 7:
                deltaY = 106
                break
        }
        this.drawSharp(g, x, deltaY - 112)
        return this.drawSharp(g, x, deltaY)
    }


    private static drawFlatOfKeySignature(g: Element, flatNo: number, x: number): number {
        let deltaY: number = 0
        switch (flatNo) {
            case 1:
                deltaY = 104
                break
            case 2:
                deltaY = 84
                break
            case 3:
                deltaY = 110
                break
            case 4:
                deltaY = 92
                break
            case 5:
                deltaY = 116
                break
            case 6:
                deltaY = 99
                break
            case 7:
                deltaY = 121
                break
        }
        this.drawFlat(g, x, deltaY)
        return this.drawFlat(g, x, deltaY - 111)
    }
    private static drawSharp(g: Element, x: number, y: number): number {
        let deltaX: number = 11
        const path = "M 86.102,447.457 L 86.102,442.753 L 88.102,442.201 L 88.102,446.881 L 86.102,447.457 z M 90.04,446.319 L 88.665,446.713 L 88.665,442.033 L 90.04,441.649 L 90.04,439.705 L 88.665,440.089 L 88.665,435.30723 L 88.102,435.30723 L 88.102,440.234 L 86.102,440.809 L 86.102,436.15923 L 85.571,436.15923 L 85.571,440.986 L 84.196,441.371 L 84.196,443.319 L 85.571,442.935 L 85.571,447.606 L 84.196,447.989 L 84.196,449.929 L 85.571,449.545 L 85.571,454.29977 L 86.102,454.29977 L 86.102,449.375 L 88.102,448.825 L 88.102,453.45077 L 88.665,453.45077 L 88.665,448.651 L 90.04,448.266 L 90.04,446.319 z"
        const style = "fill:#000000"
        let sharp = this.drawPath(g, 'black', 0, path, style)
        sharp.setAttributeNS(null, 'transform', `translate(${-180 + x + deltaX},${-763 + y}) scale(1.9 1.9)`)
        return deltaX
    }
    private static drawFlat(g: Element, x: number, y: number): number {
        let deltaX: number = 11
        const path = "M 97.359,444.68428 C 96.732435,445.46734 96.205,445.91553 95.51,446.44253 L 95.51,443.848 C 95.668,443.449 95.901,443.126 96.21,442.878 C 96.518,442.631 96.83,442.507 97.146,442.507 C 98.621857,442.72115 98.104999,443.97562 97.359,444.68428 z M 95.51,442.569 L 95.51,435.29733 L 94.947,435.29733 L 94.947,446.91453 C 94.947,447.26653 95.043,447.44253 95.235,447.44253 C 95.346,447.44253 95.483913,447.34953 95.69,447.22653 C 97.091908,446.36314 97.992494,445.6642 98.89183,444.43098 C 99.16986,444.04973 99.366461,443.18512 98.96397,442.5813 C 98.71297,442.20474 98.234661,441.80922 97.621641,441.6923 C 96.828092,441.54095 96.14376,441.93605 95.51,442.569 z"
        const style = "fill:#000000"
        let flat = this.drawPath(g, 'black', 0, path, style)
        flat.setAttributeNS(null, 'transform', `translate(${-236 + x + deltaX},${-939 + y}) scale(2.3 2.3)`)
        return deltaX
    }
    private static drawCancelAlteration(g: Element, x: number, y: number): number {
        let deltaX: number = 11
        const path = "M 233.072,24.112 V 51.52 h -1.248 V 41.248 l -6.672,1.728 V 15.232 h 1.2 v 10.704 l 6.72,-1.824 z m -6.72,6.432 v 7.536 l 5.472,-1.44 v -7.536 l -5.472,1.44 z"
        const style = "fill:#000000"
        let natural = this.drawPath(g, 'black', 0, path, style)
        natural.setAttributeNS(null, 'transform', `translate(${-246 + x + deltaX},${49 + y}) scale(1 1)`)


        return deltaX
    }

    public static drawKeySignature(g: Element, x: number, k: KeySignature): number {
        let deltaX = 13
        // sharps
        for (let s = 1; s <= k.key; s++) {
            deltaX += this.drawSharpOfKeySignature(g, s, x + deltaX)
        }
        // flats
        for (let f = 1; f <= -k.key; f++) {
            deltaX += this.drawFlatOfKeySignature(g, f, x + deltaX)
        }
        return deltaX
    }


    public static createText(g: Element, text: string, x: number, y: number, fontSize: number, color: string,
        textLength: number | null = null, fontWeight: string = 'normal'): void {
        const textElement: any = document.createElementNS(this.svgns, 'text')
        const textNode = document.createTextNode(text)
        textElement.appendChild(textNode)
        textElement.setAttributeNS(null, 'x', x)
        textElement.setAttributeNS(null, 'y', y)
        textElement.setAttributeNS(null, 'font-size', fontSize.toString())
        if (textLength)
            textElement.setAttributeNS(null, 'textLength', textLength.toString())
        textElement.setAttributeNS(null, 'font-weight', fontWeight)
        textElement.setAttributeNS(null, 'lengthAdjust', 'spacingAndGlyphs')
        textElement.setAttributeNS(null, 'fill', color)
        g.appendChild(textElement)
    }

    private static writeEventInfo(g: Element, e: SoundEvent, x: number) {
        // this.createText(g, `st=${e.startTick}`, x, 100, 12, `red`)
        // this.createText(g, `pit=${e.pitch}`, x, 112, 12, `red`)
        // this.createText(g, `dur=${e.durationInTicks}`, x, 124, 12, `red`)
        // this.createText(g, `alt=${e.alteration != null ? e.alteration : ''}`, x, 136, 12, `red`)
        // this.createText(g, `tie=${e.isTiedToPrevious}`, x, 148, 12, `red`)
        // this.createText(g, `x=${x}`, x, 160, 12, `red`)
    }

}



