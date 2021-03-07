import { Note } from './note'
import { Song } from './song'

export class SongSimplification {
    id: number
    songId: number
    simplificationVersion: number
    notes: Note[]
    numberOfVoices: number
    voicesWithNotes: number[]

    constructor(data: any) {
        if (data != null) {
            this.id = data.id
            this.songId = data.songId
            this.simplificationVersion = data.simplificationVersion
            this.notes = data.notes
            this.numberOfVoices = data.numberOfVoices
            this.voicesWithNotes = this.getVoicesWithNotes()
        }
        else {
            this.id = 0
            this.songId = 0
            this.simplificationVersion = 0
            this.notes = null
            this.numberOfVoices = 0
            this.voicesWithNotes = null
        }
    }

    public getVoicesWithNotes(): number[] {
        let voices: Set<number> = new Set()
        this.notes.forEach(x => voices.add(x.voice))
        return Array.from(voices.values())
    }

    public getNotesOfVoice(voice: number): Note[] {
        if (this.notes && this.notes.length > 0) {
            return this.notes
                .filter(note => note.voice === voice)
                .sort(
                    (a, b) => (a.startSinceBeginningOfSongInTicks < b.startSinceBeginningOfSongInTicks ? -1 : 1)
                )
        }
        return []
    }



    // Returns the notes in bar fromBar, the ones in bar toBar, and all intermiediary bars
    // It includes notes that started before fromBar bur are still playing in fromBar and notes that
    // started playing but have not finish playing by the time toBar finished
    public getNotes(song: Song = null, fromBar: number | null = null, toBar: number | null = null): Note[] {
        let startTick = 0
        let endTick = 10000000
        if (song && fromBar) startTick = song.bars[fromBar - 1].ticksFromBeginningOfSong
        if (song && toBar) endTick = song.bars[toBar].ticksFromBeginningOfSong
        if (this.notes && this.notes.length > 0) {
            return this.notes
                .filter(note => note.startSinceBeginningOfSongInTicks < endTick &&
                    note.endSinceBeginningOfSongInTicks > startTick)
                .sort(
                    (a, b) => (a.startSinceBeginningOfSongInTicks < b.startSinceBeginningOfSongInTicks ? -1 : 1)
                )
        }
        return []
    }

    public getInstrumentOfVoice(voice: number): number | null {
        if (this.notes && this.notes.length > 0) {
            const note = this.notes.find(note => note.voice === voice)
            if (note && !note.isPercussion) return note.instrument
            // 128 is not really a valid code. We use it to denote that the track is a drums track
            if (note && note.isPercussion) return 128
        }
        return 0
    }

    public isVoicePercusion(voice: number): boolean {
        if (this.notes && this.notes.length > 0) {
            const note = this.notes.find(note => note.voice === voice)
            if (note) return note.isPercussion
        }
        return false
    }


}