import { BasicShapes } from './basic-shapes'
import { NoteDuration } from '../../../../core/models/note-duration'
import { SoundEvent } from '../../../../core/models/sound-event'
import { DrumPitch } from '../../../../core/models/midi/drum-pitch'


export abstract class DrumsShapes {
    private static svgns = 'http://www.w3.org/2000/svg'


    public static drawBasicNote(svgBox: Element, e: SoundEvent, color: string = 'black'): Element {
        let group = document.createElementNS(this.svgns, 'g')
        svgBox.appendChild(group)
        e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
        e.isStemUp = this.isStemUp(e.pitch)
        return group
    }

    public static drawSingleNote(svgBox: Element, e: SoundEvent, color: string = 'black'): Element {
         BasicShapes.writeEventInfo(svgBox, e)
        let group = document.createElementNS(this.svgns, 'g')
        e.isStemUp = this.isStemUp(e.pitch)
        svgBox.appendChild(group)
        switch (e.duration) {
            case NoteDuration.whole:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, false, false)
                break;
            case NoteDuration.half:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, false)
                break;
            case NoteDuration.quarter:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                break;
            case NoteDuration.eight:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                this.drawSubStems(group, e.x, e.bottomY, color, 1, e.isStemUp)
                break;
            case NoteDuration.sixteenth:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                this.drawSubStems(group, e.x, e.bottomY, color, 2, e.isStemUp)
                break;
            case NoteDuration.thirtysecond:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                this.drawSubStems(group, e.x, e.bottomY, color, 3, e.isStemUp)
                break;
            case NoteDuration.sixtyfourth:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                this.drawSubStems(group, e.x, e.bottomY, color, 4, e.isStemUp)
                break;
        }

        return group
    }
    public static drawSubStems(g: Element, x: number, y: number, color: string = 'black', qtySubstems: number, isStemUp = true) {
        for (let i = 0; i < qtySubstems; i++) {
            if (isStemUp) {
                BasicShapes.drawPath(g, color, 1,
                    `m ${27},${57 + 14 * i} c 19.5,4.9 10.5,22.1 8.8,28.1 16,-21.9 -8.5,-30.8 -8.8,-44.1 z`,
                    null, `translate(${x},${y}) scale(0.7)`)
            }
            else {
                // BasicShapes.drawPath(g, color, 1,
                //     `m ${27},${57 + 14 * i} c 19.5,4.9 10.5,22.1 8.8,28.1 16,-21.9 -8.5,-30.8 -8.8,-44.1 z`,
                //     null, `scale(-0.7,0.7) rotate(180, ${0}, ${y + 80}) translate(${x - 12},${y})`)
                BasicShapes.drawPath(g, color, 1,
                `m ${27},${57 + 14 * i} c 13.7,3.4 7.4,15.5 6.2,19.7 11.2,-15.3 -6,-21.6 -6.2,-30.9 z`,
                null, `scale(-1,1) rotate(180, ${0}, ${y + 80}) translate(${x - 20},${y-20})`)
                // const arc = BasicShapes.drawPath(g, color, 1, `m ${20},${y + 43 + 4 * i} c 19.5,4.9 10.5,22.1 8.8,28.1 16,-21.9 -8.5,-30.8 -8.8,-44.1 z`, null)
                // arc.setAttributeNS(null, 'transform', `scale(-0.98,0.98) rotate(180, ${50}, ${y + 80}) translate(${x+150},-3)`)
            }
        }
    }
    private static drawDrumCircleAndStem(parent: Element, x: number, color: string = 'black', pitch: DrumPitch,
        isCircleFull: boolean = true, isStemPresent: boolean = true): number {
        const y = this.getYForDrumNote(pitch)
        switch (pitch) {
            case DrumPitch.Tambourine:
            case DrumPitch.RideBell:
                BasicShapes.drawRombus(parent, x, y, color, true)
                BasicShapes.drawStem(parent, x, y + 50, y)
                break
            case DrumPitch.SideStick:
            case DrumPitch.RideCymbal1:
            case DrumPitch.RideCymbal2:
            case DrumPitch.OpenHiConga:
            case DrumPitch.LowConga:
            case DrumPitch.ClosedHiHat:
            case DrumPitch.OpenHiHat:
                BasicShapes.drawCross(parent, x, y, color)
                BasicShapes.drawStem(parent, x, y + 45, y)
                break
            case DrumPitch.PedalHiHat:
                BasicShapes.drawCross(parent, x, y, color)
                BasicShapes.drawStem(parent, x - 5, y + 75, y + 55, color, false)
                break
            case DrumPitch.CrashCymbal1:
                BasicShapes.drawCross(parent, x, y, color, false, true)
                BasicShapes.drawStem(parent, x, y + 45, y)
                break
            case DrumPitch.ChineseCymbal:
            case DrumPitch.SplashCymbal:
            case DrumPitch.CrashCymbal2:
                BasicShapes.drawCross(parent, x, y, color, false, false, true)
                BasicShapes.drawStem(parent, x, y + 45, y)
                break
            case DrumPitch.LowMidTom:
            case DrumPitch.LowFloorTom:
            case DrumPitch.LowTom:
            case DrumPitch.HiMidTom:
            case DrumPitch.HighTom:
            case DrumPitch.ElectricSnare:
            case DrumPitch.AcousticSnare:
                if (isStemPresent)
                    BasicShapes.drawCircleAndStem(parent, x, y, null, color, isCircleFull)
                else
                    BasicShapes.drawNoteCircle(parent, x, y, color, false)
                break
            case DrumPitch.AcousticBassDrum:
            case DrumPitch.BassDrum1:
            case DrumPitch.HighFloorTom:
                if (isStemPresent)
                    BasicShapes.drawCircleAndStem(parent, x, y, null, color, isCircleFull, false)
                else
                    BasicShapes.drawNoteCircle(parent, x, y, color, false)
                break

            case DrumPitch.Cowbell:
                BasicShapes.drawTriangle(parent, x, y, color)
                BasicShapes.drawStem(parent, x, y + 47, y)
                break

        }
        return y
    }
    private static isStemUp(pitch: number): boolean {
        const pitchesWithStemsDown = [36, 43, 44]
        if (pitchesWithStemsDown.includes(pitch)) return false
        return true
    }


    // The drums notes have to be located in the pentagram. This function calculates the right height for each drum note
    public static getYForDrumNote(pitch: DrumPitch): number {
        const yOfC4inGclef = 30
        const distBetweenLines = 12
        switch (pitch) {
            case DrumPitch.Tambourine:
                return yOfC4inGclef - distBetweenLines * 4
            case DrumPitch.SplashCymbal:
                return yOfC4inGclef - distBetweenLines * 6.5
            case DrumPitch.SideStick:
                return yOfC4inGclef - distBetweenLines * 3.5
            case DrumPitch.RideCymbal2:
                return yOfC4inGclef - distBetweenLines * 4
            case DrumPitch.RideCymbal1:
                return yOfC4inGclef - distBetweenLines * 5
            case DrumPitch.RideBell:
                return yOfC4inGclef - distBetweenLines * 5
            case DrumPitch.PedalHiHat:
                return yOfC4inGclef - distBetweenLines * 0.5
            case DrumPitch.OpenHiHat:
                return yOfC4inGclef - distBetweenLines * 4.5
            case DrumPitch.OpenHiConga:
                return yOfC4inGclef - distBetweenLines * 3
            case DrumPitch.LowMidTom:
                return yOfC4inGclef - distBetweenLines * 4.5
            case DrumPitch.LowTom:
                return yOfC4inGclef - distBetweenLines * 4
            case DrumPitch.LowFloorTom:
                return yOfC4inGclef - distBetweenLines * 2.5
            case DrumPitch.LowConga:
                return yOfC4inGclef - distBetweenLines * 2
            case DrumPitch.HiMidTom:
                return yOfC4inGclef - distBetweenLines * 5
            case DrumPitch.HighTom:
                return yOfC4inGclef - distBetweenLines * 5
            case DrumPitch.HighFloorTom:
                return yOfC4inGclef - distBetweenLines * 2.5
            case DrumPitch.ElectricSnare:
                return yOfC4inGclef - distBetweenLines * 3.5
            case DrumPitch.CrashCymbal1:
                return yOfC4inGclef - distBetweenLines * 6
            case DrumPitch.CrashCymbal2:
                return yOfC4inGclef - distBetweenLines * 6.5
            case DrumPitch.Cowbell:
                return yOfC4inGclef - distBetweenLines * 4.5
            case DrumPitch.ClosedHiHat:
                return yOfC4inGclef - distBetweenLines * 5.5
            case DrumPitch.ChineseCymbal:
                return yOfC4inGclef - distBetweenLines * 6.5
            case DrumPitch.BassDrum1:
                return yOfC4inGclef - distBetweenLines * 1.5
            case DrumPitch.AcousticSnare:
                return yOfC4inGclef - distBetweenLines * 3.5
            case DrumPitch.AcousticBassDrum:
                return yOfC4inGclef - distBetweenLines * 1.5
            default:
                return yOfC4inGclef

        }
    }
}