import {BasicShapes} from './basic-shapes'
import { NoteDuration } from '../../../../core/models/note-duration'
import { SoundEvent } from '../../../../core/models/sound-event'

export abstract class Rests{
    private static svgns = 'http://www.w3.org/2000/svg'
    private static standardWidth = 50

    public static drawQuarterRest(g: Element, x: number) {
        BasicShapes.drawPath(g, 'black', 12, `M ${8 + x},40 V 79 z`)
        BasicShapes.drawPath(g, 'white', 5, `M ${x + 4},40 Q ${x + 8},50 ${x + 4},54 z`)
        BasicShapes.drawPath(g, 'white', 6, `M ${x + 10},40  ${x + 18},52  z`)
        BasicShapes.drawPath(g, 'white', 6, `M ${x + 16},54 Q ${x + 8},60 ${x + 18},70  z`)
        BasicShapes.drawPath(g, 'white', 10, `M ${x - 4},54  ${x + 6},70  z`)
        BasicShapes.drawPath(g, 'white', 6, `M ${x + 4},66  ${x + 4},80  z`)
        BasicShapes.drawPath(g, 'black', 4, `M ${x + 14},72 Q ${x - 2},62 ${x + 10},80  z`)
        BasicShapes.drawPath(g, 'white', 4, `M ${x + 14},75 Q ${x + 6},70 ${x + 12},79  z`)
        BasicShapes.drawPath(g, 'white', 4, `M ${x + 16},66 V 80  z`)

    }

    public static drawRest(svgBox: Element, e: SoundEvent): void {
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        if (e.duration == NoteDuration.whole) {
            for (let i = 0; i < 4; i++)
                this.drawQuarterRest(group, e.x + i * this.standardWidth)
            return
        }
        if (e.duration == NoteDuration.half) {
            this.drawQuarterRest(group, e.x)
            this.drawQuarterRest(group, e.x + this.standardWidth)
            return
        }
        if (e.duration == NoteDuration.quarter)
            this.drawQuarterRest(group, e.x)
        else {
            this.drawRestStem(group, e.x, e.duration)
            this.drawRestSubStems(group, e.x, e.duration)
        }
    }
    public static drawRestStem(g: Element, x: number, type: NoteDuration) {
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

    public static drawRestSubStems(g: Element, x: number, type: NoteDuration) {
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
    public static drawRestCircle(g: Element, x: number, y: number) {
        BasicShapes.drawEllipse(g, x, y, 4, 4, 'black', 0, '', true)
    }
    public static drawRestArc(g: Element, x1: number, y1: number, x2: number, y2: number) {
        BasicShapes.drawPath(g, 'black', 2, `M${x1},${y1} Q ${(x1 + x2) / 2},${y1 + 4} ${x2},${y2} z`)
    }
}