import { Injectable } from '@angular/core'
import { Instrument } from '../../../core/models/midi/midi-codes/instrument.enum'
import { SongSimplification } from '../../../core/models/song-simplification'
import { Song } from '../../../core/models/song'
import { Note } from '../../../core/models/note'

@Injectable()
export class DrawingRythmService {
    svgns = 'http://www.w3.org/2000/svg'

    // We assign to each quarter, eightth, sixteenth or whatever a total of 50 px width
    // The height is always 50 px
    // We insert a vertical bar between compases that ocupies a total space of 50 px
    // The total length is dependent on the number of notes that have to be drawn, a song
    // that consists mostly of quarter notes will occupy less space per bar than a song
    // that consists of sixteenths
    public drawTrackGraphic(
        trackNumber: number,
        svgBoxId: string,
        song: Song,
        simplificationNo: number): string {
        const svgBox = document.getElementById(svgBoxId)
        if (!svgBox) {
            return
        }
        this.removeChildren(svgBox)
        const simplif = new SongSimplification(song.songSimplifications[simplificationNo])

        const instrument = simplif.getInstrumentOfVoice(trackNumber)
        const isPercusion = simplif.isVoicePercusion(trackNumber)

        this.drawNote(trackNumber, svgBox, song, simplificationNo, null)
    }

    private removeChildren(svgBox: HTMLElement){
        while (svgBox.firstChild){
            svgBox.removeChild(svgBox.firstChild)
        }
    }


    private drawNote(trackNumber: number,
        svgBox: HTMLElement,
        song: Song,
        simplificationNo: number,
        n: Note): void {
        this.addQuarter(svgBox, null, 30)

    }


    private addQuarter(svgBox:HTMLElement, n: Note, x: number){
        const group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        const ellipse = document.createElementNS(this.svgns, 'ellipse')
        ellipse.setAttributeNS(null, 'cx', (x+13).toString())
        ellipse.setAttributeNS(null, 'cy', '42')
        ellipse.setAttributeNS(null, 'rx', '8')
        ellipse.setAttributeNS(null, 'ry', '6')
        ellipse.setAttributeNS(null, 'transform', `rotate(-25 ${x+13} 42)`)
        group.appendChild(ellipse)
        const stem = document.createElementNS(this.svgns, 'path')
        stem.setAttributeNS(null, 'stroke', '#000')
        stem.setAttributeNS(null, 'stroke-width', '2')
        stem.setAttributeNS(null, 'd', `M${x+19},3V40z`)
        group.appendChild(stem)



    }

    // Used to increase the width of the viewbox of the SVG element
    // Changing the wi
    private resizeSVGviewbox(svgBox: HTMLElement, widthToAdd: number): number {
        const currentViewBox = svgBox.getAttribute("viewBox")
        const dimensions = currentViewBox.split(" ")
        let currentViewBoxWidth = +dimensions[2]
        const newViewBoxWidth = currentViewBoxWidth + widthToAdd
        dimensions[2] = newViewBoxWidth.toString()
        const newViewBox = dimensions.join(" ")
        svgBox.setAttribute("viewBox", newViewBox)
        return newViewBoxWidth
    }

}