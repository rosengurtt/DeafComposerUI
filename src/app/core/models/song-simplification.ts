import { Note } from './note'

export class SongSimplification {
    id: number
    songId: number
    simplificationVersion: number
    notes: Note[]
    numberOfVoices: number

    constructor(data: any) {
        this.id = data.id
        this.songId = data.songId
        this.simplificationVersion = data.simplificationVersion
        this.notes = data.notes
        this.numberOfVoices = data.numberOfVoices
    }

    public getNotesOfVoice(voice: number): Note[] {
        if (this.notes && this.notes.length > 0) {
            return this.notes.filter(note => note.voice === voice)
                .sort(
                    (a, b) => (a.startSinceBeginningOfSongInTicks < b.startSinceBeginningOfSongInTicks ? -1 : 1)
                )
        }
        return []
    }

    public getInstrumentOfVoice(voice: number): number | null {
        if (this.notes && this.notes.length > 0) {
            const note = this.notes.find(note => note.voice === voice)
            if (note) return note.instrument
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