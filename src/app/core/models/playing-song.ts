export class PlayingSong {
    songId: number
    startFromInSeconds: number
    elapsedSeconds: number
    durationInSeconds: number
    isPaused: boolean

    constructor(songId: number, startFromInSeconds: number, durationInSeconds: number) {
        this.songId = songId
        this.startFromInSeconds = startFromInSeconds
        this.durationInSeconds = durationInSeconds
        this.isPaused = false
        this.elapsedSeconds = startFromInSeconds
    }
}