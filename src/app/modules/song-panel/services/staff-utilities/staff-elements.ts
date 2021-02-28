import { Bar } from 'src/app/core/models/bar'
import { BeatGraphNeeds } from 'src/app/core/models/beat-graph-needs'
import { NoteDuration } from 'src/app/core/models/note-duration'
import { SoundEvent } from 'src/app/core/models/sound-event'
import { SoundEventType } from 'src/app/core/models/sound-event-type.enum'
import { DrawingCalculations } from './drawing-calculations'
import { BeatDrawingInfo } from 'src/app/core/models/beat-drawing-info'
import { GenericStaffDrawingUtilities } from './generic-staff-drawing-utilities'
import { Rests } from './rests'
import { Notes } from './notes'

export abstract class StaffElements {


    // We draw beat by beat. This is because when we have multiple notes in a beat, like 4 sixteens, we have to draw
    // a beam that connects them together. But if we have 8 sixteens in 2 consecutive beats, we connect the first 4
    // and the second 4, we don't connect the 8 together  
    // When we have a tie between beats, we pass in the tieStartX parameter the start point of a tie that started in a previous beat
    // A tie may span several beats
    public static drawBeat(g: Element, x: number, bar: Bar, beat: number, beatGraphNeeds: BeatGraphNeeds, eventsToDraw: SoundEvent[], bars: Bar[], tieStartX: number | null): BeatDrawingInfo {
        const timeSig = bar.timeSignature


        if (timeSig.numerator % 3 == 0 && timeSig.denominator == 8)
            return this.drawBeatOfbarWithTimeSig3x8(g, x, bar, beat, beatGraphNeeds, eventsToDraw, bars, tieStartX)
        const beatDurationInTicks = 96 * 4 / timeSig.denominator
        const beatStartTick = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        const beatEndTick = beatStartTick + beatDurationInTicks
        const beatEvents = eventsToDraw
            .filter(e => e.startTick >= beatStartTick && e.startTick < beatEndTick)
            .sort((e1, e2) => e1.startTick - e2.startTick)

        // Check if first note has a tie that comes from a previous beat        
        if (beatEvents[0]?.isTiedToPrevious && beatEvents[0]?.type == SoundEventType.note) {
            beatEvents[0].bottomY = GenericStaffDrawingUtilities.getBottomYofNote(beatEvents[0], bars, eventsToDraw)
            Notes.drawTie(g, tieStartX, x, beatEvents[0].bottomY)
            tieStartX = x
        }
        let tieEndX: number | null = null


        for (let i = 0; i < beatEvents.length; i++) {
            const e: SoundEvent = beatEvents[i]

            let deltaX = DrawingCalculations.calculateXofEventInsideBeat(e, beatGraphNeeds, beatStartTick)
            e.x = x + deltaX

            if (e.type == SoundEventType.note) {
                const notesSimultaneousToThisOne = beatEvents.filter(x => x.startTick == e.startTick && x.endTick == e.endTick && x.pitch != e.pitch)
                // if there is a single note, or there are some but they are simultaneous to this one,
                // we don't have to care about beams, just draw it
                if ( beatEvents.filter(x => x.type == SoundEventType.note && !notesSimultaneousToThisOne.includes(x)).length == 1) {
                    const graph = Notes.drawSingleNote(g, e)
                    e.graphic.push(graph)
                }
                // if there are several notes, draw a 'quarter' that later will be converted to whatever it is by adding beams
                else {
                    const graph = Notes.drawBasicNote(g, e)
                    e.graphic.push(graph)
                }
            }
            // if it is a rest, draw the rest
            else {
                Rests.drawRest(g, e)
            }

            // Take care of ties

            // If the note is tied to previous, draw the tie
            if (e.type == SoundEventType.note && e.isTiedToPrevious) {
                tieEndX = x + deltaX
                Notes.drawTie(g, tieStartX, tieEndX, e.bottomY)
            }
            // Update the start point for the next tie
            tieStartX = x + deltaX

        }
        Notes.drawBeatBeams(g, x, beatStartTick, beatGraphNeeds, beatEvents)

        return new BeatDrawingInfo(tieStartX, DrawingCalculations.calculateWidthInPixelsOfBeat(beatGraphNeeds))
    }


    // Draws beats of bars with a time signature of 3x/8 like 3/8, 6/8 or 12/8
    public static drawBeatOfbarWithTimeSig3x8(g: Element, x: number, bar: Bar, beat: number, beatGraphNeeds: BeatGraphNeeds, eventsToDraw: SoundEvent[], bars: Bar[], tieStartX: number | null): BeatDrawingInfo {
        // we draw the beats in groups of 3, so we make drawings in beat 1, 4, 7 and 10
        if ((beat - 1) % 3 != 0) return new BeatDrawingInfo(tieStartX, 0)

        const beatDurationInTicks = 48
        const beatStartTick = bar.ticksFromBeginningOfSong + (beat - 1) * beatDurationInTicks
        const beatEndTick = beatStartTick + beatDurationInTicks * 3
        const beatEvents = eventsToDraw
            .filter(e => e.startTick >= beatStartTick && e.startTick < beatEndTick)
            .sort((e1, e2) => e1.startTick - e2.startTick)

        // Check if first note has a tie that comes from a previous beat        
        if (beatEvents[0]?.isTiedToPrevious && beatEvents[0]?.type == SoundEventType.note) {
            beatEvents[0].bottomY = GenericStaffDrawingUtilities.getBottomYofNote(beatEvents[0], bars, eventsToDraw)
            Notes.drawTie(g, tieStartX, x, beatEvents[0].bottomY)
            tieStartX = x
        }
        let tieEndX: number | null = null


        for (let i = 0; i < beatEvents.length; i++) {
            const e: SoundEvent = beatEvents[i]
            let deltaX = DrawingCalculations.calculateXofEventInsideBeat(e, beatGraphNeeds, beatStartTick)
            e.x = x + deltaX

            if (e.type == SoundEventType.note) {
                // if there is a single note, we don't have to care about beams, just draw it
                if (beatEvents.filter(x => x.type == SoundEventType.note).length == 1 ||
                    // if there are 2 notes and one of them is a quarter
                    (beatEvents.filter(x => x.type == SoundEventType.note).length == 2 &&
                        beatEvents.filter(x => x.type == SoundEventType.note && x.duration == NoteDuration.quarter).length > 0)
                ) {
                    const graph = Notes.drawSingleNote(g, e)
                    e.graphic.push(graph)
                }
                // if there are several notes, draw a 'quarter' that later will be converted to whatever it is by adding beams
                else {
                    const graph = Notes.drawBasicNote(g, e)
                    e.graphic.push(graph)
                }
            }
            // if it is a rest, draw the rest
            else {
                Rests.drawRest(g, e)
            }

            // Take care of ties
            // If the note is tied to previous, draw the tie
            if (e.type == SoundEventType.note && e.isTiedToPrevious) {
                tieEndX = x + deltaX
                Notes.drawTie(g, tieStartX, tieEndX, e.bottomY)
            }
            // Update the start point for the next tie
            tieStartX = x + deltaX
        }
        Notes.drawBeatBeams(g, x, beatStartTick, beatGraphNeeds, beatEvents)
        return new BeatDrawingInfo(tieStartX, DrawingCalculations.calculateWidthInPixelsOfBeat(beatGraphNeeds))
    }






}



