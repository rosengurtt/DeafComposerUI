import { BasicShapes } from './basic-shapes'
import { NoteDuration } from '../../../../core/models/note-duration'
import { SoundEvent } from '../../../../core/models/sound-event'

export abstract class Rests {
    private static svgns = 'http://www.w3.org/2000/svg'
    private static standardWidth = 50

    public static drawQuarterRest(g: Element, x: number, y: number) {
        BasicShapes.drawPath(g, 'black', 12, `M ${8 + x},${40 + y} V ${79 + y} z`)
        BasicShapes.drawPath(g, 'white', 5, `M ${x + 4},${40 + y} Q ${x + 8},${50 + y} ${x + 4},${54 + y} z`)
        BasicShapes.drawPath(g, 'white', 6, `M ${x + 10},${40 + y} ${x + 18},${52 + y}  z`)
        BasicShapes.drawPath(g, 'white', 6, `M ${x + 16},${54 + y} Q ${x + 8},${60 + y} ${x + 18},70  z`)
        BasicShapes.drawPath(g, 'white', 10, `M ${x - 4},${54 + y} ${x + 6},${70 + y}  z`)
        BasicShapes.drawPath(g, 'white', 6, `M ${x + 4},${66 + y} ${x + 4},${80 + y}  z`)
        BasicShapes.drawPath(g, 'black', 4, `M ${x + 14},${72 + y} Q ${x - 2},${62 + y} ${x + 10},${80 + y}  z`)
        BasicShapes.drawPath(g, 'white', 4, `M ${x + 14},${75 + y} Q ${x + 6},${70 + y} ${x + 12},${79 + y}  z`)
        BasicShapes.drawPath(g, 'white', 4, `M ${x + 16},${66 + y} V ${80 + y}  z`)

    }

    public static drawRest(svgBox: Element, e: SoundEvent): void {
        BasicShapes.writeEventInfo(svgBox, e)
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        if (e.duration == NoteDuration.whole) {
            for (let i = 0; i < 4; i++)
                this.drawQuarterRest(group, e.x + i * this.standardWidth, e.bottomY)
            return
        }
        if (e.duration == NoteDuration.half) {
            this.drawQuarterRest(group, e.x, e.bottomY)
            this.drawQuarterRest(group, e.x + this.standardWidth, e.bottomY)
            return
        }
        if (e.duration == NoteDuration.quarter)
            this.drawQuarterRest(group, e.x, e.bottomY)
        else {
            this.drawRestStem(group, e.x, e.bottomY, e.duration)
            this.drawRestSubStems(group, e.x, e.bottomY, e.duration)
        }
    }
    public static drawRestStem(g: Element, x: number, y: number, type: NoteDuration) {
        const stem = document.createElementNS(this.svgns, 'path')
        stem.setAttributeNS(null, 'stroke', 'black')
        stem.setAttributeNS(null, 'stroke-width', '2')
        switch (type) {
            case NoteDuration.sixtyfourth:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46 + y} ${x + 19},${82 + y} z`); break
            case NoteDuration.thirtysecond:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46 + y} ${x + 20},${81 + y} z`); break
            case NoteDuration.sixteenth:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46 + y} ${x + 21},${80 + y} z`); break
            case NoteDuration.eight:
                stem.setAttributeNS(null, 'd', `M${x + 30},${46 + y} ${x + 22},${79 + y} z`); break
        }
        g.appendChild(stem)
    }

    public static drawRestSubStems(g: Element, x: number, y: number, type: NoteDuration) {
        switch (type) {
            case NoteDuration.sixtyfourth:
                this.drawRestCircle(g, x + 15, y + 72)
                this.drawRestArc(g, x + 15, y + 73, x + 22, y + 72)
            case NoteDuration.thirtysecond:
                this.drawRestCircle(g, x + 16, y + 64)
                this.drawRestArc(g, x + 17, y + 65, x + 24, y + 64)
            case NoteDuration.sixteenth:
                this.drawRestCircle(g, x + 17, y + 56)
                this.drawRestArc(g, x + 18, y + 57, x + 27, y + 56)
            case NoteDuration.eight:
                this.drawRestCircle(g, x + 18, y + 48)
                this.drawRestArc(g, x + 19, y + 49, x + 28, y + 48)
        }
    }
    public static drawRestCircle(g: Element, x: number, y: number) {
        BasicShapes.drawEllipse(g, x, y, 4, 4, 'black', 0, '', true)
    }
    public static drawRestArc(g: Element, x1: number, y1: number, x2: number, y2: number) {
        BasicShapes.drawPath(g, 'black', 2, `M${x1},${y1} Q ${(x1 + x2) / 2},${y1 + 4} ${x2},${y2} z`)
    }
}