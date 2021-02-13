import { BasicShapes } from './basic-shapes'
import { NoteDuration } from '../../../../core/models/note-duration'
import { SoundEvent } from '../../../../core/models/sound-event'
import { DrumPitch } from '../../../../core/models/midi/drum-pitch'
import { basename } from 'path'
import { Duplex } from 'stream'
// import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
// import { DrawingCalculations } from './drawing-calculations'
// import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'

export abstract class DrumsShapes {
    private static svgns = 'http://www.w3.org/2000/svg'


    public static drawSingleNote(svgBox: Element, e: SoundEvent, color: string = 'black'): Element {
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
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY)
                break;
            case NoteDuration.eight:
                BasicShapes.drawCircleAndStem(group, e.x, e.bottomY)
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

        return group
    }

    private static drawDrumCircleAndStem(parent: Element, x: number, color: string = 'black', pitch: DrumPitch): void {
        const y = this.getYForDrumNote(pitch)
        switch (pitch) {
            case DrumPitch.Tambourine:
            case DrumPitch.RideBell:
                BasicShapes.drawRombus(parent, x, y, color, false)
            case DrumPitch.SplashCymbal:
            case DrumPitch.SideStick:
            case DrumPitch.RideCymbal1:
            case DrumPitch.RideCymbal2:
            case DrumPitch.PedalHiHat:
            case DrumPitch.OpenHiConga:
            case DrumPitch.LowConga:
            case DrumPitch.ClosedHiHat:
            case DrumPitch.ChineseCymbal:
            case DrumPitch.CrashCymbal1:
            case DrumPitch.CrashCymbal2:
                BasicShapes.drawCross(parent, x, y, color)
            case DrumPitch.LowMidTom:
            case DrumPitch.LowFloorTom:
            case DrumPitch.LowTom:
            case DrumPitch.HiMidTom:
            case DrumPitch.HighTom:
            case DrumPitch.HighFloorTom:
            case DrumPitch.ElectricSnare:
            case DrumPitch.BassDrum1:
            case DrumPitch.AcousticBassDrum:
            case DrumPitch.AcousticSnare:
                BasicShapes.drawCircleAndStem(parent, x, y, null, color, true)
            case DrumPitch.Cowbell:
                BasicShapes.drawTriangle(parent, x, y, color)
            case DrumPitch.OpenHiHat:
                BasicShapes.drawCross(parent, x, y, color, true)

        }
        BasicShapes.drawStem(parent, x, y, y - 20)

    }


    // The drums notes have to be located in the pentagram. This function calculates the right height for each drum note
    private static getYForDrumNote(pitch: DrumPitch): number {
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