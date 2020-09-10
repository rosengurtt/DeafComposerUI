import { MusicStyle } from './music-style';

export class Band {
    name: string
    id: number
    style: MusicStyle

    constructor(name: string, id: number, style?: MusicStyle) {
        this.name = name
        this.id = id
        this.style = style
    }
}