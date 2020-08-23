import { Band } from './band';
import { MusicStyle } from './music-style';
import { SongStats } from './song-stats';
import { SongSimplification } from './song-simplification';
import { Bar } from './bar';
import { TempoChange } from './tempo-change';

export class Song {
    // tslint:disable-next-line: variable-name
    id: number
    name: string
    band: Band
    style: MusicStyle
    midiBase64Encoded: string
    songStats: SongStats
    songSimplifications: SongSimplification[]
    bars: Bar[]
    tempoChanges: TempoChange[]
}
