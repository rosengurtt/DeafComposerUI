import { MusicStyle } from '../../../models/music-style'

export class MusicStylesPaginated {
    pageNo: number
    pageSize: number
    totalItems: number
    totalPages: number
    styles: MusicStyle[]
}