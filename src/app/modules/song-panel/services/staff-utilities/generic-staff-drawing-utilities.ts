import { Bar } from "src/app/core/models/bar";
import { Alteration } from 'src/app/core/models/alteration.enum'
import { keys } from "lodash-es";
import { SoundEvent } from "src/app/core/models/sound-event";
import { SoundEventType } from "src/app/core/models/sound-event-type.enum";

export abstract class GenericStaffDrawingUtilities {
    // Returns the bar number (first bar=1) in which a tick is located
    // If a tick is in the separation of 2 bars, it returns the second
    public static getBarOfTick(bars: Bar[], tick: number): number {
        return bars.filter(b => b.ticksFromBeginningOfSong <= tick).length
    }


    // Given a key (expressed as the number of sharps or the number of flats)
    // it returns all the pitches that don't belong to the key. For example if the key is 2
    // (2 sharps, that is the D key) it returns all F# and all C# pitches
    public static GetKeySignatureAlteredPitches(key: number): Set<number> {
        let retObj = new Set<number>()
        const fSharpGflatPitches = Array.from(new Array(11), (val, index) => 6 + index * 12)
        const cSharpDflatPitches = Array.from(new Array(11), (val, index) => 1 + index * 12)
        const gSharpAflatPitches = Array.from(new Array(11), (val, index) => 8 + index * 12)
        const dSharpEflatPitches = Array.from(new Array(11), (val, index) => 3 + index * 12)
        const aSharpBflatPitches = Array.from(new Array(11), (val, index) => 10 + index * 12)
        const eSharpPitches = Array.from(new Array(11), (val, index) => 5 + index * 12)
        const FflatPitches = Array.from(new Array(11), (val, index) => 4 + index * 12)
        const bSharpPitches = Array.from(new Array(11), (val, index) => 0 + index * 12)
        const CflatPitches = Array.from(new Array(11), (val, index) => 11 + index * 12)
        if (key > 0)
            retObj = new Set([...retObj, ...fSharpGflatPitches])
        if (key > 1)
            retObj = new Set([...retObj, ...cSharpDflatPitches])
        if (key > 2)
            retObj = new Set([...retObj, ...gSharpAflatPitches])
        if (key > 3)
            retObj = new Set([...retObj, ...dSharpEflatPitches])
        if (key > 4)
            retObj = new Set([...retObj, ...aSharpBflatPitches])
        if (key > 5)
            retObj = new Set([...retObj, ...eSharpPitches])
        if (key > 6)
            retObj = new Set([...retObj, ...bSharpPitches])


        if (key < 0)
            retObj = new Set([...retObj, ...aSharpBflatPitches])
        if (key < -1)
            retObj = new Set([...retObj, ...dSharpEflatPitches])
        if (key < -2)
            retObj = new Set([...retObj, ...gSharpAflatPitches])
        if (key < -3)
            retObj = new Set([...retObj, ...cSharpDflatPitches])
        if (key < -4)
            retObj = new Set([...retObj, ...fSharpGflatPitches])
        if (key < -6)
            retObj = new Set([...retObj, ...CflatPitches])
        if (key < -7)
            retObj = new Set([...retObj, ...FflatPitches])

        return retObj
    }

    // Given a key (expressed as the number of sharps or the number of flats)
    // it returns all the alterations introduced by the key. So if for ex the key is 2
    // (2 sharps, that is the D key) it will return map elements like
    // (66, Alteration.Sharp) (73, Alteration.Sharp)
    public static GetAlterationsOfKey(key: number): Map<number, Alteration> {
        let retObj = new Map<number, Alteration>()

        if (key > 0)
            Array.from(new Array(11), (val, index) => retObj.set(6 + index * 12, Alteration.sharp))
        if (key > 1)
            Array.from(new Array(11), (val, index) => retObj.set(1 + index * 12, Alteration.sharp))
        if (key > 2)
            Array.from(new Array(11), (val, index) => retObj.set(8 + index * 12, Alteration.sharp))
        if (key > 3)
            Array.from(new Array(11), (val, index) => retObj.set(3 + index * 12, Alteration.sharp))
        if (key > 4)
            Array.from(new Array(11), (val, index) => retObj.set(10 + index * 12, Alteration.sharp))
        if (key > 5)
            Array.from(new Array(11), (val, index) => retObj.set(5 + index * 12, Alteration.sharp))
        if (key > 6)
            Array.from(new Array(11), (val, index) => retObj.set(0 + index * 12, Alteration.sharp))

        if (key < 0)
            Array.from(new Array(11), (val, index) => retObj.set(10 + index * 10, Alteration.flat))
        if (key < -1)
            Array.from(new Array(11), (val, index) => retObj.set(3 + index * 12, Alteration.flat))
        if (key < -2)
            Array.from(new Array(11), (val, index) => retObj.set(8 + index * 12, Alteration.flat))
        if (key < -3)
            Array.from(new Array(11), (val, index) => retObj.set(1 + index * 12, Alteration.flat))
        if (key < -4)
            Array.from(new Array(11), (val, index) => retObj.set(6 + index * 12, Alteration.flat))
        if (key < -5)
            Array.from(new Array(11), (val, index) => retObj.set(0 + index * 12, Alteration.flat))
        if (key < -6)
            Array.from(new Array(11), (val, index) => retObj.set(5 + index * 12, Alteration.flat))

        return retObj
    }

    // When we draw a note in the pentagram, bottomY=0 is the circle of the A inside the G clef pentagram. We have to calculate
    // the number of pixels to move the note up or down so it shows in the correct place for the pitch
    // The same pitch may be shown for ex as an A# or a Bb, depending on the alterations being used at that
    // point of the song. So we need that information too. 
    // alterations is an array that defines the alteration of each pitch, so  if alterations[37] is 
    // Alteration.Flat, it will be displayed as a Db, if it is Alteration.Sharp it will be displayed as C#
    public static getBottomYofNote(e: SoundEvent, bars: Bar[], eventsToDraw: SoundEvent[]): number {
        const alterations = this.getAlterationsAtTick(bars, e.startTick, eventsToDraw)
        let alterationOfNote = (e.alterationShown != null && e.alterationShown != Alteration.cancel) ? e.alterationShown : alterations.get(e.pitch)
        if (e.alterationShown === Alteration.cancel) alterationOfNote = null
        let majorScalePitches = [0, 2, 4, 5, 7, 9, 11]
        const basicPitch = e.pitch % 12
        const octave = ((e.pitch - basicPitch) / 12) - 1    // C4 that is the central C in the piano has pitch 60 and octave 4 starts in C4
        const octaveHeightInPixels = 42
        const yOfC4inGclef = 30
        const yOfC3inFclef = 100
        const linesSeparation = 12
        let y: number

        // F clef
        if (octave < 4) {
            // Simpler case, pitch is in C scale with no alterations
            if (majorScalePitches.includes(basicPitch)) {
                y = yOfC3inFclef - linesSeparation / 2 * majorScalePitches.indexOf(basicPitch) - (octave - 3) * octaveHeightInPixels
            }

            // Case when pitch is not in C scale, so there is an alteration for sure
            else
                y = alterationOfNote == Alteration.sharp ?
                    yOfC3inFclef - linesSeparation / 2 * majorScalePitches.indexOf(basicPitch - 1) - (octave - 3) * octaveHeightInPixels :
                    yOfC3inFclef - linesSeparation / 2 * majorScalePitches.indexOf(basicPitch + 1) - (octave - 3) * octaveHeightInPixels
        }
        // G clef
        else {
            // Simpler case, pitch is in C scale with no alterations
            if (majorScalePitches.includes(basicPitch))
                y = yOfC4inGclef - linesSeparation / 2 * majorScalePitches.indexOf(basicPitch) - (octave - 4) * octaveHeightInPixels

            // Case when pitch is not in C scale, so there is an alteration for sure
            else
                y = alterationOfNote == Alteration.sharp ?
                    yOfC4inGclef - linesSeparation / 2 * majorScalePitches.indexOf(basicPitch - 1) - (octave - 4) * octaveHeightInPixels :
                    yOfC4inGclef - linesSeparation / 2 * majorScalePitches.indexOf(basicPitch + 1) - (octave - 4) * octaveHeightInPixels
        }

        // We consider now the special cases of E-F and B-C. These are special because pitch 4 may be a natural E or a Fb.
        // pitch 5 can be a natural F or an E#, so depending on the alterations they can be drawn higher or lower (apart from the fact
        // that we may have to draw an alteration)
        // The y we calculated initially assumed that pitch 4 was a natural E, pitch F a natural F, etc We make corrections now if that
        // was not the case

        // Case where pitch 5 is an E# and not an F. We have to move down our initial calcualtion 6 pixels
        if (e.pitch % 12 == 5 && alterationOfNote == Alteration.sharp) {
            y = y + linesSeparation / 2
        }
        // Case where pitch 4 is an Fb. We have to move it up 6 pixels
        else if (e.pitch % 12 == 4 && alterationOfNote == Alteration.flat) {
            y = y - linesSeparation / 2
        }
        // Case pitch 0 is a B#                
        if (e.pitch % 12 == 0 && alterationOfNote == Alteration.sharp) {
            y = y + linesSeparation / 2
        }
        // Case pitch 11 is a Cb
        else if (e.pitch % 12 == 11 && alterationOfNote == Alteration.flat) {
            y = y - linesSeparation / 2
        }
        return y
    }

    // When drawing rests, the vertical location of the rest is not as important as with notes, it can be a bit higher
    // or lower without changing the meaning. But it should be more or less at the same height as surrounding notes 
    public static getYofRest(e: SoundEvent, eventsToDraw: SoundEvent[]): number {
        // For percussion tracks we put the rest aprox in the middle
        if (e.isPercussion)
            return 10

        const surroundingNotes = eventsToDraw
            .filter(x => x.type == SoundEventType.note)
            //sort by distance from e
            .sort((a, b) => Math.abs(a.startTick - e.startTick) - Math.abs(b.startTick - e.startTick))
            // take 30 notes
            .slice(0, 6)

        // Calculate average
        if (surroundingNotes && surroundingNotes.length > 0)
            return (surroundingNotes.map(x => x.bottomY).reduce((a, b) => a + b, 0) / surroundingNotes.length) + 10
        return 10
    }
    // When we are drawing notes in the pentagram, the vertical location when we put a note may depend on the alterations
    // affecting the notes at that point. For ex if the key is D, they key signature has 2 sharps, and if we have a note
    // with pitch 61, we have to draw it as C#, not Db. If the key signature has no alterations, but there was a previous
    // alteration in this bar or the previous bar for this note, we have to use that alteration info to decide which note
    // to draw. There may be also a precise alteration for this particular note shown in the pentagram.
    // This method returns the status of alterations at a moment of the song for a specific voice. If the alterations
    // added to the eventsToDraw object are correct, then we should have all the alterations info we need to draw any
    // note at any tick
    public static getAlterationsAtTick(bars: Bar[], tick: number, eventsToDraw: SoundEvent[]): Map<number, Alteration> {
        const barNumber = GenericStaffDrawingUtilities.getBarOfTick(bars, tick)
        const keySig = bars[barNumber - 1].keySignature

        const retObj = GenericStaffDrawingUtilities.GetAlterationsOfKey(keySig.key)

        const recentAlterations = this.getAlterationsOfLast2BarsAtTick(bars, tick, eventsToDraw)

        recentAlterations.forEach((value, key) => retObj.set(key, value))
        return retObj
    }
    // Returns the alterations that don't belong to the key signature that have been added in the current and previous
    // bar that affect the current note location in the pentagram
    // For ex if a note with pitch 65 (F# or Gb) was played in a bar with a key signature of C with and shown with a
    // sharp alteration (F#)  then a subsequent note with pitch 65 in the same bar or the next bar will be displayed as 
    // an F#, not a Gb
    // We have to look at the latest alteration affecting the note, because there can be cancellations after a sharp
    // or a flat alteration
    private static getAlterationsOfLast2BarsAtTick(bars: Bar[], tick: number, eventsToDraw: SoundEvent[]): Map<number, Alteration> {
        const barNumber = GenericStaffDrawingUtilities.getBarOfTick(bars, tick)
        let start = barNumber > 1 ? bars[barNumber - 1].ticksFromBeginningOfSong : 0
        let eventsWithAlterationsInTheLast2Bars = eventsToDraw.filter(e => e.startTick >= start && e.startTick < tick && e.alterationShown != null)
        let retObj = new Map<number, Alteration>()
        for (let e of eventsWithAlterationsInTheLast2Bars)
            retObj.set(e.pitch, e.alterationShown)
        return retObj
    }
}