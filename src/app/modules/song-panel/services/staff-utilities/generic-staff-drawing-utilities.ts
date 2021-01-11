import { Bar } from "src/app/core/models/bar";
import { Alteration } from 'src/app/core/models/alteration.enum'
import { keys } from "lodash-es";

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
        if (key <-3)
            Array.from(new Array(11), (val, index) => retObj.set(1 + index * 12, Alteration.flat))
        if (key <-4)
            Array.from(new Array(11), (val, index) => retObj.set(6 + index * 12, Alteration.flat))
        if (key <-5)
            Array.from(new Array(11), (val, index) => retObj.set(0 + index * 12, Alteration.flat))
        if (key < -6)
            Array.from(new Array(11), (val, index) => retObj.set(5 + index * 12, Alteration.flat))

        return retObj
    }
}