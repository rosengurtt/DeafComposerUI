export abstract class BasicShapes {
    private static svgns = 'http://www.w3.org/2000/svg'

    public static drawPath(g: Element, color: string, strokeWidth: number, path: string, style: string = null): Element {
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
    public static drawEllipse(g: Element, cx: number, cy: number, rx: number, ry: number, color: string,
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
}