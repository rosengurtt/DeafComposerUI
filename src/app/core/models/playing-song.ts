export class PlayingSong {
    songId: number
    startFromInSeconds: number
    elapsedMilliSeconds: number
    durationInSeconds: number
    isPaused: boolean
    // when the song is played with a different tempo than the original, this field says how faster or slowed is played
    // 1 means it is played with the normal tempo of the song
    tempoRatio: number

    constructor(songId: number, startFromInSeconds: number, durationInSeconds: number, tempoRatio: number) {
        this.songId = songId
        this.startFromInSeconds = startFromInSeconds
        this.durationInSeconds = durationInSeconds
        this.isPaused = false
        this.elapsedMilliSeconds = startFromInSeconds
        this.tempoRatio = tempoRatio
    }
}