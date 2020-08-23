import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GetStylesResponse } from './responses-format/get-styles-response';
import { GetBandsResponse } from './responses-format/get-bands-response';
import { GetSongsResponse } from './responses-format/get-songs-response';
import { PaginationData } from '../../models/pagination-data';

@Injectable({
    providedIn: 'root'
})



export class SongsRepositoryService {
    private songLibraryUrl: string


    constructor(private http: HttpClient) {
        this.songLibraryUrl = environment.GetEnvironment().DeafComposerBackend
    }

    getStyles(paginationData?: PaginationData): Observable<GetStylesResponse> {
        let url = this.songLibraryUrl + 'style'
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetStylesResponse>(this.songLibraryUrl + 'style')
    }

    getBands(styleId?: number, paginationData?: PaginationData): Observable<GetBandsResponse> {
        let url = this.songLibraryUrl + 'band'
        if (styleId)
            url += '?styleId=' + styleId
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetBandsResponse>(url)
    }
    getSongsForBand(bandId: number, paginationData?: PaginationData): Observable<GetSongsResponse> {
        let url = this.songLibraryUrl + 'song?bandId=' + bandId
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetSongsResponse>(url);
    }
    getSongsForStyle(styleId: number, paginationData?: PaginationData): Observable<GetSongsResponse> {
        let url = this.songLibraryUrl + 'song?styleId=' + styleId
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetSongsResponse>(url);
    }
    getAllSongs(paginationData?: PaginationData): Observable<any> {
        let url = this.songLibraryUrl + 'song'
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetSongsResponse>(url);
    }

    getSongById(id: number): Observable<any> {
        return this.http.get<GetSongsResponse>(this.songLibraryUrl + 'song/' + id);
    }

    addPaginationParameters(url: string, paginationData?: PaginationData) {
        if (paginationData) {
            url += (url.includes('?')) ? '&pageNo=' + paginationData.pageNo : '?pageNo=' + paginationData.pageNo
            url +=  '&pageSize=' + paginationData.pageSize
        }
        return url
    }
}
