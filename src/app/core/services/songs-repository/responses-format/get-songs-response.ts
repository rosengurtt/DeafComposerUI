import { SongsPaginated } from './songs-paginated'

export class GetSongsResponse {
    statusCode: number
    message: string
    result: SongsPaginated
}