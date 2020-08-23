import { BandsPaginated } from './bands-paginated'

export class GetBandsResponse {
    statusCode: number
    message: string
    result: BandsPaginated
}