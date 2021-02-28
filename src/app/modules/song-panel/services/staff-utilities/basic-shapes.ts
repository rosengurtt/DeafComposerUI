import { NoteDuration } from "src/app/core/models/note-duration"

export abstract class BasicShapes {
    private static svgns = 'http://www.w3.org/2000/svg'

    public static drawPath(g: Element, color: string, strokeWidth: number, path: string, style: string = null, transform: string = null): Element {
        const arc = document.createElementNS(this.svgns, 'path')
        if (style != null)
            arc.setAttributeNS(null, 'style', style)
        else {
            arc.setAttributeNS(null, 'stroke', color)
            arc.setAttributeNS(null, 'style', `fill:${color}`)
            arc.setAttributeNS(null, 'stroke-width', strokeWidth.toString())
        }
        if (transform != null)
            arc.setAttributeNS(null, 'transform', transform)
        arc.setAttributeNS(null, 'd', path)
        g.appendChild(arc)
        return arc
    }
    public static drawEllipse(g: Element, cx: number, cy: number, rx: number, ry: number, color: string,
        strokeWidth: number, transform: string, isFilled: boolean): void {
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

    // Draws the cross used in drums notation for some instruments like the hi hat
    // The parameters drawCircleAround and drawHorizontalLine are used to draw diferent versions of the cross (i.e. the open hi hat uses a circle)
    public static drawCross(g: Element, x: number, y: number, color: string = 'black', drawCircleAround: boolean = false,
        drawHorizontalMiddleLine: boolean = false, drawUnderline: boolean = false): void {
        y = y + 82
        x = x + 10
        this.drawPath(g, color, 2, `M ${x - 6}, ${y - 6} l 12,12 M ${x + 6}, ${y - 6} l -12,12 Z`)
        if (drawCircleAround)
            this.drawEllipse(g, x, y, 7, 7, color, 2, null, false)
        if (drawHorizontalMiddleLine)
            this.drawPath(g, color, 2, `M ${x - 12},${y} h 22 Z`)
        if (drawUnderline)
            this.drawPath(g, color, 2, `M ${x - 12},${y + 6} h 22 Z`)
    }
    // Draws a rombus used for some drums notes like splash and rid bell
    public static drawRombus(g: Element, x: number, y: number, color: string = 'black', isFilled: boolean = true) {
        y += 81
        x += 11
        let path = this.drawPath(g, color, 2, `M ${x},${y - 7} L ${x + 7},${y} L ${x},${y + 7} L ${x - 7},${y} L ${x},${y - 7}  Z`)
        if (!isFilled) path.setAttributeNS(null, 'fill', 'none')
    }

    // Draws the triangle used by the drums note of the cowbell
    public static drawTriangle(g: Element, x: number, y: number, color: string = 'black') {
        y += 86
        x += 11
        this.drawPath(g, color, 2, `M ${x},${y} L ${x + 7},${y - 10} L ${x - 7},${y - 10} L ${x},${y}  Z`)
    }


    public static createText(g: Element, text: string, x: number, y: number, fontSize: number, color: string,
        textLength: number | null = null, fontWeight: string = 'normal', opacity: number = 1): void {
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
        textElement.setAttributeNS(null, 'opacity', opacity.toString())
        g.appendChild(textElement)
    }

    public static drawStem(g: Element, x: number, bottomY: number, topY: number = null, color: string = 'black', isUp: boolean = true) {
        let y: number
        const zero = 30
        const defaultStemLength = 48
        if (topY === null) {
            y = bottomY + defaultStemLength
        }
        else
            y = topY

        if (isUp)
            this.drawPath(g, color, 2, `M ${x + 19},${zero + bottomY} V ${zero + y} z`)
        else
            this.drawPath(g, color, 2, `M ${x + 7},${zero + y} v 55 z`)
    }
    public static drawCircleAndStem(parent: Element, x: number, bottomY: number, topY: number = null, color: string = 'black',
        isCircleFull = true, isUp: boolean = true) {
        this.drawNoteCircle(parent, x, bottomY, color, isCircleFull)
        this.drawStem(parent, x, bottomY, topY, color, isUp)
    }

    public static drawNoteCircle(g: Element, x: number, y: number, color: string = 'black', isCircleFull = true) {
        this.drawEllipse(g, x + 13, 81 + y, 7, 5, color, 2, `rotate(-25 ${x + 13} ${81 + y})`, isCircleFull)
    }

    public static drawBeam(g: Element, startX: number, startY: number, endX: number, endY: number, color: string = 'black', duration: NoteDuration): void {
        switch (duration) {
            case NoteDuration.eight:
                BasicShapes.drawPath(g, color, 1, `M ${startX + 19},${30 + startY} L ${endX + 19},${30 + endY} z`)
                break;
            case NoteDuration.sixteenth:
                BasicShapes.drawPath(g, color, 1, `M ${startX + 19},${36 + startY} L ${endX + 19},${36 + endY} z`)
                break;
            case NoteDuration.thirtysecond:
                BasicShapes.drawPath(g, color, 1, `M ${startX + 19},${42 + startY} L ${endX + 19},${42 + endY} z`)
                break;
            case NoteDuration.sixtyfourth:
                BasicShapes.drawPath(g, color, 1, `M ${startX + 19},${48 + startY} L ${endX + 19},${48 + endY} z`)
                break;
        }
    }
    public static drawSubStems(g: Element, x: number, y: number, color: string = 'black', qtySubstems: number) {
        for (let i = 0; i < qtySubstems; i++) {
            BasicShapes.drawPath(g, color, 1,
                `m ${27},${61 + 6 * i} c 19.5,4.9 10.5,22.1 8.8,28.1 16,-21.9 -8.5,-30.8 -8.8,-44.1 z`,
                null, `translate(${x},${y}) scale(0.7)`)
        }
    }
    public static writeEventInfo(g: Element, e: any): void {
        // BasicShapes.createText(g, `st=${e.startTick}`, e.x, 100, 12, `red`)
        // BasicShapes.createText(g, `pit=${e.pitch}`, e.x, 112, 12, `red`)
        // BasicShapes.createText(g, `dur=${e.durationInTicks}`, e.x, 124, 12, `red`)
        // BasicShapes.createText(g, `alt=${e.alterationShown != null ? e.alterationShown : ''}`, e.x, 136, 12, `red`)
        // BasicShapes.createText(g, `tie=${e.isTiedToPrevious}`, e.x, 148, 12, `red`)
        // BasicShapes.createText(g, `x=${e.x}`, e.x, 160, 12, `red`)
        // BasicShapes.createText(g, `y=${e.bottomY}`, e.x, 172, 12, `red`)

    }
    public static writeBeamInfo(g: Element, startX: number, endX: number, startY: number, endY: number): void {
        BasicShapes.createText(g, `startX=${startX}`, startX, 184, 12, `red`)
        BasicShapes.createText(g, `endX=${endX}`, startX, 196, 12, `red`)
        BasicShapes.createText(g, `startY=${startY}`, startX, 208, 12, `red`)
        BasicShapes.createText(g, `endY=${endY}`, startX, 220, 12, `red`)
    }
}