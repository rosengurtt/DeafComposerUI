import { Song } from '../../../models/song'

export class SongsPaginated {
    pageNo: number
    pageSize: number
    totalItems: number
    totalPages: number
    songs: Song[]

}