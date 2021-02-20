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
        return group
    }

    public static drawSingleNote(svgBox: Element, e: SoundEvent, color: string = 'black'): Element {
        BasicShapes.writeEventInfo(svgBox, e)
        let group = document.createElementNS(this.svgns, 'g')
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
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 1)
                break;
            case NoteDuration.sixteenth:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 2)
                break;
            case NoteDuration.thirtysecond:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 3)
                break;
            case NoteDuration.sixtyfourth:
                e.bottomY = this.drawDrumCircleAndStem(group, e.x, color, e.pitch, true)
                BasicShapes.drawSubStems(group, e.x, e.bottomY, color, 4)
                break;
        }

        return group
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