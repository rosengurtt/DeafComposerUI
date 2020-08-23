import { Song } from '../../../models/song'

export class GetStylesResponse {
    statusCode: number
    message: string
    result: Song
}