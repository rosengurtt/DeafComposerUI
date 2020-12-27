import { Bar } from 'src/app/core/models/bar'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { TimeSignature } from 'src/app/core/models/time-signature'
import { DrawingCalculations } from './drawing-calculations'
import { BeatDrawingInfo } from 'src/app/core/models/beat-drawing-info'

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
        const beatDurationInTicks = 96 * timeSig.denominator / 4
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


        for (let i = 0; i < beatEvents.length; i++) {
            const e: SoundEvent = beatEvents[i]

            let deltaX = DrawingCalculations.calculateXofEventInsideBeat(e, beatGraphNeeds, beatStartTick)

            if (e.type == SoundEventType.note) {
                // if there is a single note, we don't have to care about beams, just draw it
                if (beatEvents.filter(x => x.type == SoundEventType.note).length == 1) this.drawSingleNote(g, e.duration, x + deltaX)
                // if there are several notes, draw a 'quarter' that later will be converted to whatever it is by adding beams
                else StaffElements.drawBasicNote(g, x + deltaX)
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
        for (let i = 0; i < beatEvents.length - 1; i++) {
            const startX = DrawingCalculations.calculateXofEventInsideBeat(beatEvents[i], beatGraphNeeds, beatStartTick)
            const endX = DrawingCalculations.calculateXofEventInsideBeat(beatEvents[i + 1], beatGraphNeeds, beatStartTick)
            if (this.isNoteShorterThan(beatEvents[i], NoteDuration.quarter) && this.isNoteShorterThan(beatEvents[i + 1], NoteDuration.quarter)) {

                this.drawBeam(g, x + startX, x + endX, NoteDuration.eight)
            }
            if (this.isNoteShorterThan(beatEvents[i], NoteDuration.eight) && this.isNoteShorterThan(beatEvents[i + 1], NoteDuration.eight)) {

                this.drawBeam(g, x + startX, x + endX, NoteDuration.sixteenth)
            }
            if (this.isNoteShorterThan(beatEvents[i], NoteDuration.sixteenth) && this.isNoteShorterThan(beatEvents[i + 1], NoteDuration.sixteenth))
                this.drawBeam(g, x + startX, x + endX, NoteDuration.thirtysecond)
            if (this.isNoteShorterThan(beatEvents[i], NoteDuration.thirtysecond) && this.isNoteShorterThan(beatEvents[i + 1], NoteDuration.thirtysecond))
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
    // Returns the space it took in the drawing
    public static drawTimeSignature(g: Element, x: number, timeSignature: TimeSignature): number {
        StaffElements.createText(g, timeSignature.numerator.toString(), x + 10, 40, 20, 'black')
        StaffElements.createText(g, timeSignature.denominator.toString(), x + 10, 80, 20, 'black')
        return 50
    }
    public static drawBarLine(svgBox: Element, x: number): number {
        this.drawPath(svgBox, 'black', 2, `M ${x + 10},20 V 100 z`)
        return 50
    }
    public static drawBarNumber(g: Element, x: number, barNumber: number): number {
        this.createText(g, barNumber.toString(), x, 110, 20, 'blue')
        return 50
    }

    private static drawPath(g: Element, color: string, strokeWidth: number, path: string) {
        const arc = document.createElementNS(this.svgns, 'path')
        arc.setAttributeNS(null, 'stroke', color)
        arc.setAttributeNS(null, 'stroke-width', strokeWidth.toString())
        arc.setAttributeNS(null, 'd', path)
        g.appendChild(arc)
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
    public static drawBasicNote(g: Element, x: number, isCircleFull = true) {
        this.drawEllipse(g, x + 13, 80, 7, 5, 'black', 2, `rotate(-25 ${x + 13} 80)`, isCircleFull)
        this.drawPath(g, 'black', 2, `M ${x + 19},40 V 78 z`)
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

    public static drawSingleNote(svgBox: Element, type: NoteDuration, x: number): void {
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
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
        this.drawEllipse(g, x + 13, 80, 7, 5, 'black', 2, `rotate(-25 ${x + 13} 80)`, isCircleFull)
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


    public static createText(g: Element, text: string, x: number, y: number, fontSize: number, color: string, textLength: number | null = null): void {
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

    // x1 is the x of the starting note and x2 is the x of the ending note
    private static drawTie(svgBox: Element, x1: number, x2: number) {
        this.drawPath(svgBox, 'black', 2, `M ${x1},95 Q ${(x1 + x2) / 2},110 ${x2},95 z`)
        this.drawPath(svgBox, 'white', 7, `M ${x1},92 Q ${(x1 + x2) / 2},100 ${x2},92 z`)
    }


}



