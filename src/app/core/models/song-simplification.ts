import { Note } from './note'

export class SongSimplification {
    id: number
    songId: number
    simplificationVersion: number
    notes: Note[]
    numberOfVoices: number

    getNotesOfVoice(voice: number): Note[] {
        return this.notes.filter(note => note.voice === voice)
            .sort(
                (a, b) => (a.startSinceBeginningOfSongInTicks < b.startSinceBeginningOfSongInTicks ? -1 : 1)
            )
    }

    getInstrumentOfVoice(voice: number): number {
        return this.notes.filter(note => note.voice === voice)[0].instrument
    }

    isVoicePercusion(voice: number): boolean {
        return this.notes.filter(note => note.voice === voice)[0].isPercussion
    }
}