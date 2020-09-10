import { Song } from '../../../models/song'

export class GetSongResponse {
    statusCode: number
    message: string
    result: Song
}