import { BasicShapes } from './basic-shapes'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { Alteration } from 'src/app/core/models/alteration.enum'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { DrawingCalculations } from './drawing-calculations'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'
import { DrumsShapes } from './drums-shapes'

export abstract class Notes {
    private static svgns = 'http://www.w3.org/2000/svg'
    public static drawSharp(g: Element, x: number, y: number, color: string = 'black'): number {
        let deltaX: number = 11
        const path = "M 86.102,447.457 L 86.102,442.753 L 88.102,442.201 L 88.102,446.881 L 86.102,447.457 z M 90.04,446.319 L 88.665,446.713 L 88.665,442.033 L 90.04,441.649 L 90.04,439.705 L 88.665,440.089 L 88.665,435.30723 L 88.102,435.30723 L 88.102,440.234 L 86.102,440.809 L 86.102,436.15923 L 85.571,436.15923 L 85.571,440.986 L 84.196,441.371 L 84.196,443.319 L 85.571,442.935 L 85.571,447.606 L 84.196,447.989 L 84.196,449.929 L 85.571,449.545 L 85.571,454.29977 L 86.102,454.29977 L 86.102,449.375 L 88.102,448.825 L 88.102,453.45077 L 88.665,453.45077 L 88.665,448.651 L 90.04,448.266 L 90.04,446.319 z"
        const style = "fill:#000000"
        let sharp = BasicShapes.drawPath(g, 'black', 0, path, style)
        sharp.setAttributeNS(null, 'transform', `translate(${-180 + x + deltaX},${-763 + y}) scale(1.9 1.9)`)
        sharp.setAttributeNS(null, 'fill', color)
        return deltaX
    }
    public static drawFlat(g: Element, x: number, y: number, color: string = 'black'): number {
        let deltaX: number = 11
        const path = "M 97.359,444.68428 C 96.732435,445.46734 96.205,445.91553 95.51,446.44253 L 95.51,443.848 C 95.668,443.449 95.901,443.126 96.21,442.878 C 96.518,442.631 96.83,442.507 97.146,442.507 C 98.621857,442.72115 98.104999,443.97562 97.359,444.68428 z M 95.51,442.569 L 95.51,435.29733 L 94.947,435.29733 L 94.947,446.91453 C 94.947,447.26653 95.043,447.44253 95.235,447.44253 C 95.346,447.44253 95.483913,447.34953 95.69,447.22653 C 97.091908,446.36314 97.992494,445.6642 98.89183,444.43098 C 99.16986,444.04973 99.366461,443.18512 98.96397,442.5813 C 98.71297,442.20474 98.234661,441.80922 97.621641,441.6923 C 96.828092,441.54095 96.14376,441.93605 95.51,442.569 z"
        const style = "fill:#000000"
        let flat = BasicShapes.drawPath(g, 'black', 0, path, style)
        flat.setAttributeNS(null, 'transform', `translate(${-236 + x + deltaX},${-939 + y}) scale(2.3 2.3)`)
        flat.setAttributeNS(null, 'fill', color)
        return deltaX
    }
    public static drawCancelAlteration(g: Element, x: number, y: number, color: string = 'black'): number {
        let deltaX: number = 11
        const path = "M 233.072,24.112 V 51.52 h -1.248 V 41.248 l -6.672,1.728 V 15.232 h 1.2 v 10.704 l 6.72,-1.824 z m -6.72,6.432 v 7.536 l 5.472,-1.44 v -7.536 l -5.472,1.44 z"
        const style = "fill:#000000"
        let natural = BasicShapes.drawPath(g, 'black', 0, path, style)
        natural.setAttributeNS(null, 'transform', `translate(${-246 + x + deltaX},${49 + y}) scale(1 1)`)
        natural.setAttributeNS(null, 'fill', color)

        return deltaX
    }





    // Draws a circle and a stem. The idea is that regardless of a note being a quarter, and eight or a
    // sixteenth, we draw it as a quarter, and then we add the needed beams to convert it to an eight or whatever
    public static drawBasicNote(svgBox: Element, e: SoundEvent, isCircleFull = true, color: string = 'black'): Element {
        BasicShapes.writeEventInfo(svgBox, e)
        if (e.isPercussion)
            return DrumsShapes.drawBasicNote(svgBox, e, color)
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        BasicShapes.drawNoteCircle(group, e.x, e.bottomY, color, isCircleFull)
        BasicShapes.drawStem(group, e.x, e.bottomY, null, color)
        if (e.alterationShown != null) {
            switch (<Alteration>e.alterationShown) {
                case Alteration.flat:
                    Notes.drawFlat(group, e.x, e.bottomY, color)
                    break
                case Alteration.cancel:
                    Notes.drawCancelAlteration(group, e.x, e.bottomY, color)
                    break
                case Alteration.sharp:
                    Notes.drawSharp(group, e.x, e.bottomY, color)
                    break
            }
        }
        return group
    }

    public static drawSingleNote(svgBox: Element, e: SoundEvent, color: string = 'black'): Element {
        e.areSubstemsDrawn = true
        if (e.isPercussion)
            return DrumsShapes.drawSingleNote(svgBox, e, color)
        BasicShapes.writeEventInfo(svgBox, e)
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        switch (e.duration) {
            case NoteDuration.whole:
                BasicShapes.drawNoteCircle(group, e.x, e.bottomY, color, false)
                break;
            case NoteDuration.half:
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY, null, color, false)
                break;
            case NoteDuration.quarter:
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY, null, color)
                break;
            case NoteDuration.eight:
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY, null, color)
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 1)
                break;
            case NoteDuration.sixteenth:
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY)
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 2)
                break;
            case NoteDuration.thirtysecond:
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY)
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 3)
                break;
            case NoteDuration.sixtyfourth:
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY)
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 4)
                break;
        }
        if (e.alterationShown != null) {
            switch (<Alteration>e.alterationShown) {
                case Alteration.flat:
                    Notes.drawFlat(group, e.x, e.bottomY, color)
                    break
                case Alteration.cancel:
                    Notes.drawCancelAlteration(group, e.x, e.bottomY, color)
                    break
                case Alteration.sharp:
                    Notes.drawSharp(group, e.x, e.bottomY, color)
                    break
            }
        }
        return group
    }



    // x1 is the x of the starting note and x2 is the x of the ending note
    public static drawTie(svgBox: Element, x1: number, x2: number, y: number, color: string = 'black') {
        BasicShapes.drawPath(svgBox, color, 2, `M ${x1},${100 + y} Q ${(x1 + x2) / 2},${115 + y} ${x2},${100 + y} z`)
        BasicShapes.drawPath(svgBox, 'white', 7, `M ${x1},${97 + y} Q ${(x1 + x2) / 2},${105 + y} ${x2},${97 + y} z`)
    }


    // When a beat has several eights and/or sixteens, etc. we have to draw a beam connecting them
    // This method draws them
    public static drawBeatBeams(g: Element, x: number, beatStartTick: number, beatGraphNeeds: BeatGraphNeeds, beatEvents: SoundEvent[], color: string = 'black'): void {
        const thisBeatNoteEvents = beatEvents.filter(x => x.type == SoundEventType.note).sort((a, b) => a.startTick - b.startTick)
        const areAllStemsUp = thisBeatNoteEvents.filter(e => e.isStemUp == false).length == 0

         // we connect the notes if there are more than 1 notes and they have all stems up
        if (thisBeatNoteEvents && thisBeatNoteEvents.length > 1 && areAllStemsUp) {
            const firstX = thisBeatNoteEvents[0].x - x
            const firstBottomY = thisBeatNoteEvents[0].bottomY
            const lastX = thisBeatNoteEvents[thisBeatNoteEvents.length - 1].x - x
            const lastBottomY = thisBeatNoteEvents[thisBeatNoteEvents.length - 1].bottomY
            if (firstX == lastX) return
            const shortestStem = this.calculateShortestStem(firstX + x, firstBottomY, lastX + x, lastBottomY, thisBeatNoteEvents)
            // verticalDisplacement is the value we will have to extend the stems of the first and last notes, so all the stems of the 
            // intermediate notes are at least as long as defaultStemLength minus 6
            const verticalDisplacement = shortestStem

            for (let i = 0; i < thisBeatNoteEvents.length - 1; i++) {
                const eventito = thisBeatNoteEvents[i]
                const nextEvent = thisBeatNoteEvents[i + 1]
                const startX = DrawingCalculations.calculateXofEventInsideBeat(eventito, beatGraphNeeds, beatStartTick)
                const endX = DrawingCalculations.calculateXofEventInsideBeat(nextEvent, beatGraphNeeds, beatStartTick)
                const startY = firstBottomY + ((lastBottomY - firstBottomY) / (lastX - firstX)) * (startX - firstX) - verticalDisplacement
                const endY = firstBottomY + ((lastBottomY - firstBottomY) / (lastX - firstX)) * (endX - firstX) - verticalDisplacement
                // if verticalDisplacement > 0 we have to extend the stems so they reach the top beam
                eventito.topY = startY
                BasicShapes.drawStem(g, eventito.x, eventito.bottomY, eventito.topY)
                nextEvent.topY = endY
                BasicShapes.drawStem(g, nextEvent.x, nextEvent.bottomY, nextEvent.topY)


                if (this.isNoteShorterThan(eventito, NoteDuration.quarter) && this.isNoteShorterThan(nextEvent, NoteDuration.quarter)) {
                    BasicShapes.drawBeam(g, x + startX, startY, x + endX, endY, color, NoteDuration.eight)
                    eventito.areSubstemsDrawn = true
                    nextEvent.areSubstemsDrawn = true
                }
                if (this.isNoteShorterThan(eventito, NoteDuration.eight) && this.isNoteShorterThan(nextEvent, NoteDuration.eight))
                    BasicShapes.drawBeam(g, x + startX, startY, x + endX, endY, color, NoteDuration.sixteenth)
                if (this.isNoteShorterThan(eventito, NoteDuration.sixteenth) && this.isNoteShorterThan(nextEvent, NoteDuration.sixteenth))
                    BasicShapes.drawBeam(g, x + startX, startY, x + endX, endY, color, NoteDuration.thirtysecond)
                if (this.isNoteShorterThan(eventito, NoteDuration.thirtysecond) && this.isNoteShorterThan(nextEvent, NoteDuration.thirtysecond))
                    BasicShapes.drawBeam(g, x + startX, startY, x + endX, endY, color, NoteDuration.sixtyfourth)
            }
        }
        this.drawAsSingleNotesIfnotDrawnYet(g, thisBeatNoteEvents)

    }
    private static drawAsSingleNotesIfnotDrawnYet(g: Element, events: SoundEvent[]) {
        for (let e of events) {
            if (!e.areSubstemsDrawn) {
                if (e.isPercussion)
                    DrumsShapes.drawSingleNote(g, e, 'black')
                else
                    this.drawSingleNote(g, e, 'black')
            }
        }
    }

    // When we draw the beams between notes, depending on the vertical location of the note, some stems will be shorter than others
    // For esthetic reasons we want to avoid the situation when a stem is too short or even negative (that would happen when the circle
    // of the note is above the beams) So we need to find the length of the shortest stem and ensure that we draw the beams in such
    // a way that all stems are of acceptable length
    // We calcualate for each note the number of pixels that the intermediate note is above or below the line that connects the first 
    // and last notes. Positive numbers are notes that are above the line and viceversa. This is because a higher y value means the note
    // is lower, since y coordinates in a screen grow when going down
    // We want the biggest positive value. This will be the note that will have the shortest stem
    private static calculateShortestStem(firstX: number, firstBottomY: number, lastX: number, lastBottomY: number, beatEvents: SoundEvent[]): number {
        // we intersect the line defined by (firstX,firstBottomY) and (lastX, lastBottomY) with the vertical in each note
        // we then calculate the distance between that point and the bottomY value of the note. This is the value we are after
        let stemsLengths: number[] = []
        for (let e of beatEvents) {
            const intersection = firstBottomY + ((lastBottomY - firstBottomY) / (lastX - firstX)) * (e.x - firstX)
            stemsLengths.push(intersection - e.bottomY)
        }
        return Math.max(...stemsLengths)
    }



    // Given a sound event and an note duration, it returns if the event is a note shorther than the duration passed as parameter
    private static isNoteShorterThan(event: SoundEvent, duration: NoteDuration): boolean {
        if (event.type == SoundEventType.rest) return false
        // We have defined the enum with longest durations first, so the higher the enum, the shorter the note
        return event.duration > duration
    }


}