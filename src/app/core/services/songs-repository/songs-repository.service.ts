import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GetStylesResponse } from './responses-format/get-styles-response';
import { GetBandsResponse } from './responses-format/get-bands-response';
import { GetSongsResponse } from './responses-format/get-songs-response';
import { GetSongResponse } from './responses-format/get-song-response';
import { PaginationData } from '../../models/pagination-data';

@Injectable({
    providedIn: 'root'
})



export class SongsRepositoryService {
    get songLibraryUrl(): string {
        return environment.GetEnvironment().DeafComposerBackend
    }


    constructor(private http: HttpClient) {
    }



    getStyles(paginationData: PaginationData, contains: string): Observable<GetStylesResponse> {
        let url = this.songLibraryUrl + 'style'
        url = this.addParameterToUrl(url, 'contains', contains)
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetStylesResponse>(url)
    }

    getBands(styleId: number, paginationData: PaginationData, contains: string): Observable<GetBandsResponse> {
        let url = this.songLibraryUrl + 'band'
        url = this.addParameterToUrl(url, 'contains', contains)
        url = this.addParameterToUrl(url, 'styleId', styleId)
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetBandsResponse>(url)
    }

    getSongs(styleId: number, bandId: number, paginationData: PaginationData, contains: string): Observable<any> {
        let url = this.songLibraryUrl + 'song'
        url = this.addParameterToUrl(url, 'contains', contains)
        url = this.addParameterToUrl(url, 'styleId', styleId)
        url = this.addParameterToUrl(url, 'bandId', bandId)
        url = this.addPaginationParameters(url, paginationData)
        return this.http.get<GetSongsResponse>(url);
    }

    getSongInfoById(id: number): Observable<GetSongResponse> {
        return this.http.get<GetSongResponse>(this.songLibraryUrl + 'song/' + id + '/info');
    }

    getSongById(id: number, simplificationVersion: number | null = null): Observable<GetSongResponse> {
        let url = this.songLibraryUrl + 'song/' + id
        if (simplificationVersion) url += `?simplificationVersion=${simplificationVersion}`

        return this.http.get<GetSongResponse>(url);
    }

    addPaginationParameters(url: string, paginationData?: PaginationData) {
        if (paginationData) {
            url += (url.includes('?')) ? '&pageNo=' + paginationData.pageNo : '?pageNo=' + paginationData.pageNo
            url += '&pageSize=' + paginationData.pageSize
        }
        return url
    }

    addParameterToUrl(url: string, paramName: string, paramValue: any) {
        if (paramValue) {
            url += (url.includes('?')) ? `&${paramName}=${paramValue}` : `?${paramName}=${paramValue}`
        }
        return url
    }

}
