import { Band } from '../../../models/band'

export class BandsPaginated{
    pageNo: number
    pageSize: number
    totalItems: number
    totalPages: number
    bands: Band[]
}