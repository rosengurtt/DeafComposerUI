export class BeatDrawingInfo {
    startTieX: number        // We pass here the start of the last note of the beat, in case we have to draw a tie between it and a follwoing note
    deltaX: number      // Represent the space taken in the x coordinate by this beat

    constructor(startTieX:number, deltaX: number) {
        this.startTieX = startTieX
        this.deltaX = deltaX
    }
}