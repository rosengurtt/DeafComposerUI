import { Injectable, SimpleChange } from '@angular/core'
import { SongSimplification } from '../../../core/models/song-simplification'
import { Song } from '../../../core/models/song'
import { SoundEvent } from '../../../core/models/sound-event'
import { DrawingCalculations } from './staff-utilities/drawing-calculations'

@Injectable()
export class DrawingMusicalNotationGlobalService {
    // We keep a cche of the songs we have processed
    songIds: number[] = []
    eventsToDraw: Array<Array<Array<SoundEvent>>> = []

    // When we draw different tracks in musical notation, we want the events that happen in different tracks at the same time
    // (like 2 notes played by different instruments at the same time) to be shown aligned vertically
    // To be able to do that, when we draw one track, we need to know what is going on at that time on the other tracks
    // To avoid calculating the space taken by the events on different tracks every time we draw one track, this method has
    // been extracted from the code to draw a single track, so it is executed only once and its results are shared
    // by the individual tracks
    // Because we may have several songs open at the same time, it needs to keep the information it processed for each song
    public getEventsToDrawForSong(
        song: Song,
        simplificationNo: number): Array<Array<SoundEvent>> {

        // if we haven't processed this song before, process it and save it to the cache
        if (this.songIds.filter(x => x == song.id).length === 0) {

            const simplification = new SongSimplification(song.songSimplifications[simplificationNo])


            let eventsToDrawForAllVoices: Array<Array<SoundEvent>> = []
            const voicesWithNotes = simplification.getVoicesWithNotes()
            for (let v of voicesWithNotes) {
                eventsToDrawForAllVoices.push(DrawingCalculations.getEventsToDraw(song, simplificationNo, v))
            }
            this.songIds.push(song.id)
            this.eventsToDraw.push(eventsToDrawForAllVoices)
        }

        // At this point we know we have the data in the cache, so return it from there
        const index = this.songIds.indexOf(song.id)

        return this.eventsToDraw[index]

    }









}
