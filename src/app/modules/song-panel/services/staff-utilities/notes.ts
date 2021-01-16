import { BasicShapes } from './basic-shapes'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { Alteration } from 'src/app/core/models/alteration.enum'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { DrawingCalculations } from './drawing-calculations'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'

export abstract class Notes {
    private static svgns = 'http://www.w3.org/2000/svg'
    public static drawSharp(g: Element, x: number, y: number): number {
        let deltaX: number = 11
        const path = "M 86.102,447.457 L 86.102,442.753 L 88.102,442.201 L 88.102,446.881 L 86.102,447.457 z M 90.04,446.319 L 88.665,446.713 L 88.665,442.033 L 90.04,441.649 L 90.04,439.705 L 88.665,440.089 L 88.665,435.30723 L 88.102,435.30723 L 88.102,440.234 L 86.102,440.809 L 86.102,436.15923 L 85.571,436.15923 L 85.571,440.986 L 84.196,441.371 L 84.196,443.319 L 85.571,442.935 L 85.571,447.606 L 84.196,447.989 L 84.196,449.929 L 85.571,449.545 L 85.571,454.29977 L 86.102,454.29977 L 86.102,449.375 L 88.102,448.825 L 88.102,453.45077 L 88.665,453.45077 L 88.665,448.651 L 90.04,448.266 L 90.04,446.319 z"
        const style = "fill:#000000"
        let sharp = BasicShapes.drawPath(g, 'black', 0, path, style)
        sharp.setAttributeNS(null, 'transform', `translate(${-180 + x + deltaX},${-763 + y}) scale(1.9 1.9)`)
        return deltaX
    }
    public static drawFlat(g: Element, x: number, y: number): number {
        let deltaX: number = 11
        const path = "M 97.359,444.68428 C 96.732435,445.46734 96.205,445.91553 95.51,446.44253 L 95.51,443.848 C 95.668,443.449 95.901,443.126 96.21,442.878 C 96.518,442.631 96.83,442.507 97.146,442.507 C 98.621857,442.72115 98.104999,443.97562 97.359,444.68428 z M 95.51,442.569 L 95.51,435.29733 L 94.947,435.29733 L 94.947,446.91453 C 94.947,447.26653 95.043,447.44253 95.235,447.44253 C 95.346,447.44253 95.483913,447.34953 95.69,447.22653 C 97.091908,446.36314 97.992494,445.6642 98.89183,444.43098 C 99.16986,444.04973 99.366461,443.18512 98.96397,442.5813 C 98.71297,442.20474 98.234661,441.80922 97.621641,441.6923 C 96.828092,441.54095 96.14376,441.93605 95.51,442.569 z"
        const style = "fill:#000000"
        let flat = BasicShapes.drawPath(g, 'black', 0, path, style)
        flat.setAttributeNS(null, 'transform', `translate(${-236 + x + deltaX},${-939 + y}) scale(2.3 2.3)`)
        return deltaX
    }
    public static drawCancelAlteration(g: Element, x: number, y: number): number {
        let deltaX: number = 11
        const path = "M 233.072,24.112 V 51.52 h -1.248 V 41.248 l -6.672,1.728 V 15.232 h 1.2 v 10.704 l 6.72,-1.824 z m -6.72,6.432 v 7.536 l 5.472,-1.44 v -7.536 l -5.472,1.44 z"
        const style = "fill:#000000"
        let natural = BasicShapes.drawPath(g, 'black', 0, path, style)
        natural.setAttributeNS(null, 'transform', `translate(${-246 + x + deltaX},${49 + y}) scale(1 1)`)


        return deltaX
    }

    public static drawStem(g: Element, x: number, y: number) {
        BasicShapes.drawPath(g, 'black', 2, `M ${x + 19},${30 + y} V ${78 + y} z`)
    }

    public static drawCircleAndStem(parent: Element, x: number, y: number, isCircleFull = true) {
        this.drawNoteCircle(parent, x, y, isCircleFull)
        this.drawStem(parent, x, y)
    }

    public static drawNoteCircle(g: Element, x: number, y, number, isCircleFull = true) {
        BasicShapes.drawEllipse(g, x + 13, 81 + y, 7, 5, 'black', 2, `rotate(-25 ${x + 13} ${81 + y})`, isCircleFull)
    }

    // Draws a circle and a stem. The idea is that regardless of a note being a quarter, and eight or a
    // sixteenth, we draw it as a quarter, and then we add the needed beams to convert it to an eight or whatever
    public static drawBasicNote(svgBox: Element, e: SoundEvent, isCircleFull = true): Element {
        this.writeEventInfo(svgBox,e)
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        this.drawNoteCircle(group, e.x, e.y, isCircleFull)
        this.drawStem(group, e.x, e.y)
        if (e.alterationShown != null) {
            switch (<Alteration>e.alterationShown) {
                case Alteration.flat:
                    Notes.drawFlat(group, e.x, e.y)
                    break
                case Alteration.cancel:
                    Notes.drawCancelAlteration(group, e.x, e.y)
                    break
                case Alteration.sharp:
                    Notes.drawSharp(group, e.x, e.y)
                    break
            }
        }
        return group
    }

    public static drawSingleNote(svgBox: Element, e: SoundEvent): Element {
        this.writeEventInfo(svgBox,e)
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        switch (e.duration) {
            case NoteDuration.whole:
                this.drawNoteCircle(group, e.x, e.y, false)
                break;
            case NoteDuration.half:
                this.drawCircleAndStem(group, e.x, e.y, false)
                break;
            case NoteDuration.quarter:
                this.drawCircleAndStem(group, e.x, e.y)
                break;
            case NoteDuration.eight:
                this.drawCircleAndStem(group, e.x, e.y)
                this.drawSubStems(group, e.x, 1, 1)
                break;
            case NoteDuration.sixteenth:
                this.drawCircleAndStem(group, e.x, e.y)
                this.drawSubStems(group, e.x, 2, 1)
                break;
            case NoteDuration.thirtysecond:
                this.drawCircleAndStem(group, e.x, e.y)
                this.drawSubStems(group, e.x, 3, 1)
                break;
            case NoteDuration.sixtyfourth:
                this.drawCircleAndStem(group, e.x, e.y)
                this.drawSubStems(group, e.x, 4, 1)
                break;
        }
        if (e.alterationShown != null) {
            switch (<Alteration>e.alterationShown) {
                case Alteration.flat:
                    Notes.drawFlat(group, e.x, e.y)
                    break
                case Alteration.cancel:
                    Notes.drawCancelAlteration(group, e.x, e.y)
                    break
                case Alteration.sharp:
                    Notes.drawSharp(group, e.x, e.y)
                    break
            }
        }
        return group
    }

    private static drawSubStems(g: Element, x: number, qtySubstems: number, qtyNotes: number) {
        if (qtyNotes == 1) {
            for (let i = 0; i < qtySubstems; i++) {
                BasicShapes.drawPath(g, 'black', 1, `M${x + 10},${44 + 6 * i} Q ${x + 14},${47 + 6 * i} ${x + 19},${40 + 6 * i} z`)
            }
        }
        for (let i = 0; i < qtySubstems; i++) {
            BasicShapes.drawPath(g, 'black', 2, `M${x + 19},${40 + 4 * i} L ${x + qtyNotes * 20},${40 + 4 * i} z`)
        }
    }

    // x1 is the x of the starting note and x2 is the x of the ending note
    public static drawTie(svgBox: Element, x1: number, x2: number, y: number) {
        BasicShapes.drawPath(svgBox, 'black', 2, `M ${x1},${100 + y} Q ${(x1 + x2) / 2},${115 + y} ${x2},${100 + y} z`)
        BasicShapes.drawPath(svgBox, 'white', 7, `M ${x1},${97 + y} Q ${(x1 + x2) / 2},${105 + y} ${x2},${97 + y} z`)
        // BasicShapes.drawPath(svgBox, 'black', 2, `M ${x1},95 Q ${(x1 + x2) / 2},110 ${x2},95 z`)
        // BasicShapes.drawPath(svgBox, 'white', 7, `M ${x1},92 Q ${(x1 + x2) / 2},100 ${x2},92 z`)
    }


    // When a beat has several eights and/or sixteens, etc. we have to draw a beam connecting them
    // This method draws them
    public static drawBeatBeams(g: Element, x: number, beatStartTick: number, beatGraphNeeds: BeatGraphNeeds, beatEvents: SoundEvent[]): void {
        const thisBeatNoteEvents = beatEvents.filter(x => x.type == SoundEventType.note).sort((a, b) => a.startTick - b.startTick)
        if (!thisBeatNoteEvents || thisBeatNoteEvents.length == 0) return
        const firstX = thisBeatNoteEvents[0].x - x
        const firstY = thisBeatNoteEvents[0].y
        const lastX = thisBeatNoteEvents[thisBeatNoteEvents.length - 1].x - x
        const lastY = thisBeatNoteEvents[thisBeatNoteEvents.length - 1].y

        for (let i = 0; i < thisBeatNoteEvents.length - 1; i++) {
            const eventito = thisBeatNoteEvents[i]
            const nextEvent = thisBeatNoteEvents[i + 1]
            const startX = DrawingCalculations.calculateXofEventInsideBeat(eventito, beatGraphNeeds, beatStartTick)
            const endX = DrawingCalculations.calculateXofEventInsideBeat(nextEvent, beatGraphNeeds, beatStartTick)
            const startY = firstY + ((lastY - firstY) / (lastX - firstX)) * (startX - firstX)
            const endY = firstY + ((lastY - firstY) / (lastX - firstX)) * (endX - firstX)

            if (this.isNoteShorterThan(eventito, NoteDuration.quarter) && this.isNoteShorterThan(nextEvent, NoteDuration.quarter))
                this.drawBeam(g, x + startX, startY, x + endX, endY, NoteDuration.eight)
            if (this.isNoteShorterThan(eventito, NoteDuration.eight) && this.isNoteShorterThan(nextEvent, NoteDuration.eight))
                this.drawBeam(g, x + startX, startY, x + endX, endY, NoteDuration.sixteenth)
            if (this.isNoteShorterThan(eventito, NoteDuration.sixteenth) && this.isNoteShorterThan(nextEvent, NoteDuration.sixteenth))
                this.drawBeam(g, x + startX, startY, x + endX, endY, NoteDuration.thirtysecond)
            if (this.isNoteShorterThan(eventito, NoteDuration.thirtysecond) && this.isNoteShorterThan(nextEvent, NoteDuration.thirtysecond))
                this.drawBeam(g, x + startX, startY, x + endX, endY, NoteDuration.sixtyfourth)
        }
    }

    public static drawBeam(g: Element, startX: number, startY: number, endX: number, endY: number, duration: NoteDuration): void {
        switch (duration) {
            case NoteDuration.eight:
                BasicShapes.drawPath(g, "black", 1, `M ${startX + 19},${30 + startY} L ${endX + 19},${30 + endY} z`)
                break;
            case NoteDuration.sixteenth:
                BasicShapes.drawPath(g, "black", 1, `M ${startX + 19},${36 + startY} L ${endX + 19},${36 + endY} z`)
                break;
            case NoteDuration.thirtysecond:
                BasicShapes.drawPath(g, "black", 1, `M ${startX + 19},${42 + startY} L ${endX + 19},${42 + endY} z`)
                break;
            case NoteDuration.sixtyfourth:
                BasicShapes.drawPath(g, "black", 1, `M ${startX + 19},${48 + startY} L ${endX + 19},${48 + endY} z`)
                break;
        }
    }

    // Given a sound event and an note duration, it returns if the event is a note shorther than the duration passed as parameter
    private static isNoteShorterThan(event: SoundEvent, duration: NoteDuration): boolean {
        if (event.type == SoundEventType.rest) return false
        // We have defined the enum with longest durations first, so the higher the enum, the shorter the note
        return event.duration > duration
    }
    
    private static writeEventInfo(g: Element, e: SoundEvent): void {
        // BasicShapes.createText(g, `st=${e.startTick}`, e.x, 100, 12, `red`)
        // BasicShapes.createText(g, `pit=${e.pitch}`, e.x, 112, 12, `red`)
        // BasicShapes.createText(g, `dur=${e.durationInTicks}`, e.x, 124, 12, `red`)
        // BasicShapes.createText(g, `alt=${e.alterationShown != null ? e.alterationShown : ''}`, e.x, 136, 12, `red`)
        // BasicShapes.createText(g, `tie=${e.isTiedToPrevious}`, e.x, 148, 12, `red`)
        // BasicShapes.createText(g, `x=${e.x}`, e.x, 160, 12, `red`)
        // BasicShapes.createText(g, `y=${e.y}`, e.x, 172, 12, `red`)
    }
    private static writeBeamInfo(g: Element, startX: number, endX: number, startY: number, endY: number): void {
        // BasicShapes.createText(g, `startX=${startX}`, startX, 184, 12, `red`)
        // BasicShapes.createText(g, `endX=${endX}`, startX, 196, 12, `red`)
        // BasicShapes.createText(g, `startY=${startY}`, startX, 208, 12, `red`)
        // BasicShapes.createText(g, `endY=${endY}`, startX, 220, 12, `red`)
    }
}