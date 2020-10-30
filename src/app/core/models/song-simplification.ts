import { Note } from './note'

export class SongSimplification {
    id: number
    songId: number
    simplificationVersion: number
    notes: Note[]
    numberOfVoices: number
    voicesWithNotes: number[]

    constructor(data: any) {
        this.id = data.id
        this.songId = data.songId
        this.simplificationVersion = data.simplificationVersion
        this.notes = data.notes
        this.numberOfVoices = data.numberOfVoices
        this.voicesWithNotes = this.getVoicesWithNotes()
    }

    private getVoicesWithNotes(): number[] {
        let voices: Set<number> = new Set()
        this.notes.forEach(x => voices.add(x.voice))
        return Array.from(voices.values())
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