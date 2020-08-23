import { Component, EventEmitter, Output, ViewChild, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { SongsRepositoryService } from 'src/app/core/services/songs-repository/songs-repository.service'
import { SongSearchService } from 'src/app/core/services/song-search.service'
import { SongsLibraryEventsService } from './services/songs-library-events.service'
import { MusicStyle } from 'src/app/core/models/music-style'
import { Band } from 'src/app/core/models/band'
import { Song } from 'src/app/core/models/song'
import { Subscription } from 'rxjs'
import { SongsLibraryEventTypes } from './services/songs-library-event-types.enum'
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { PaginationData } from '../../core/models/pagination-data';

@Component({
  selector: 'app-songs-library',
  templateUrl: './songs-library.component.html',
  styleUrls: ['./songs-library.component.scss']
})
export class SongsLibraryComponent implements OnInit {
  @Output() songSelected: EventEmitter<Song> = new EventEmitter<Song>()
  errorMessage: string
  styles: MusicStyle[]
  bands: Band[]
  songs: Song[]
  stylesPaginationData: PaginationData = { pageNo: 0, totalItems: 0, totalPages: 0, pageSize: 10 }
  bandsPaginationData: PaginationData = { pageNo: 0, totalItems: 0, totalPages: 0, pageSize: 10 }
  songsPaginationData: PaginationData = { pageNo: 0, totalItems: 0, totalPages: 0, pageSize: 10 }
  stylesPageEvent: PageEvent
  bandPageEvent: PageEvent
  songsPageEvent: PageEvent
  selectedStyleId = 0
  selectedBandId = 0
  selectedSongId = -1
  selectedFileName = ''
  uploadedFile: File
  uploadResult: string
  listFilter: string
  subscription: Subscription
  displayedColumns: string[] = ['name'];
  stylesDataSource: MatTableDataSource<MusicStyle>
  bandsDataSource: MatTableDataSource<Band>
  songsDataSource: MatTableDataSource<Song>
  @ViewChild('stylesPaginator', { read: MatPaginator, static: true }) stylesPaginator: MatPaginator;
  @ViewChild('bandsPaginator', { read: MatPaginator, static: true }) bandsPaginator: MatPaginator;
  @ViewChild('songsPaginator', { read: MatPaginator, static: true }) songsPaginator: MatPaginator;

  constructor(
    private router: Router,
    private songService: SongsRepositoryService,
    private songsLibraryEventsService: SongsLibraryEventsService,
    private songSearchService: SongSearchService) {
    this.subscription = songSearchService.searchTermAnnounce.subscribe(
      term => {
        this.listFilter = term
      })
  }

  async ngOnInit(): Promise<any> {
    this.songService.getStyles(this.stylesPaginationData).subscribe(data => {
      this.styles = data.result.styles
      this.stylesPaginationData.totalItems = data.result.totalItems
      this.stylesDataSource = new MatTableDataSource<MusicStyle>(this.styles)
      this.stylesDataSource.paginator = this.stylesPaginator;
    })
    this.songService.getBands(this.selectedStyleId, this.bandsPaginationData)
      .subscribe(data => {
        this.bands = data.result.bands
        this.bandsPaginationData.totalItems = data.result.totalItems
        this.bandsDataSource = new MatTableDataSource<Band>(this.bands)
        this.bandsDataSource.paginator = this.bandsPaginator;
        if (this.selectedBandId === 0) {
          this.songService.getSongsForBand(this.selectedBandId, this.songsPaginationData).subscribe(data => {
            this.songs = data.result.songs
            this.songsPaginationData.totalItems = data.result.totalItems
            this.songsDataSource = new MatTableDataSource<Song>(this.songs)
            this.songsDataSource.paginator = this.songsPaginator;
          })
        }
      })
  }

  // applyFilter(filterValue: string) {
  // this.dataSource.filter = filterValue.trim().toLowerCase();
  //}
  async selectStyle(styleId: number) {
    this.selectedStyleId = styleId
    this.selectedBandId = -1
    this.songsPaginationData.pageNo = 0
    this.bandsPaginationData.pageNo = 0
    this.songService.getBands(this.selectedStyleId, this.bandsPaginationData)
      .subscribe(data => {
        this.bands = data.result.bands
        this.bandsPaginationData.totalItems = data.result.totalItems
        this.bandsDataSource = new MatTableDataSource<Band>(this.bands)
        this.bandsDataSource.paginator = this.bandsPaginator;
        if (this.selectedBandId === -1) {
          if (this.bands.length > 0) {
            this.selectedBandId = this.bands[0].id
            this.songService.getSongsForBand(this.selectedBandId, this.songsPaginationData).subscribe(data => {
              this.songs = data.result.songs
              this.songsPaginationData.totalItems = data.result.totalItems
              this.songsDataSource = new MatTableDataSource<Song>(this.songs)
              this.songsDataSource.paginator = this.songsPaginator;
            })
          }
          else {
            this.selectedBandId = -1
          }
        }
      })
  }
  async selectBand(bandId: number) {
    this.selectedBandId = bandId
    this.songsPaginationData.pageNo = 0
    this.songService.getSongsForBand(this.selectedBandId, this.songsPaginationData).subscribe(data => {
      this.songs = data.result.songs
      this.songsPaginationData.totalItems = data.result.totalItems
      this.songsDataSource = new MatTableDataSource<Song>(this.songs)
    })
  }
  async selectSong(songId: number) {
    this.router.navigate(['/song-panel/', songId])
    this.selectedSongId = songId

    this.songService.getSongById(songId).subscribe(
      data => {
        const eventData: any = { id: songId, songName: data.result.name, bandName: data.result.band.name }
        this.songsLibraryEventsService.raiseEvent(SongsLibraryEventTypes.songSelected, eventData)
      }
    )
  }

  public getStylesPage(event?: PageEvent) {
    if (event) {
      this.stylesPaginationData.pageNo = event.pageIndex
      this.songService.getStyles(this.stylesPaginationData).subscribe(
        data => {
          if (data.statusCode != 200) {
            // handle error
          } else {
            this.styles = data.result.styles
            this.stylesDataSource = new MatTableDataSource<MusicStyle>(this.styles)
            this.stylesPaginationData.pageNo = data.result.pageNo
            this.stylesPaginationData.totalItems = data.result.totalItems
          }
        },
        error => {
          // handle error
        }
      )
    }
    return event;
  }
  public getBandsPage(event?: PageEvent) {
    if (event) {
      this.bandsPaginationData.pageNo = event.pageIndex
      this.songService.getBands(this.selectedStyleId, this.bandsPaginationData).subscribe(
        data => {
          if (data.statusCode != 200) {
            // handle error
          } else {
            this.bands = data.result.bands
            this.bandsDataSource = new MatTableDataSource<Band>(this.bands)
            this.bandsPaginationData.pageNo = data.result.pageNo
            this.bandsPaginationData.totalItems = data.result.totalItems
          }
        },
        error => {
          // handle error
        }
      )
    }
    return event;
  }

  public getSongsPage(event?: PageEvent) {
    console.log(event)
    if (event) {
      this.songsPaginationData.pageNo = event.pageIndex
      this.songsPaginationData.pageSize = event.pageSize
      this.songService.getSongsForBand(this.selectedBandId, this.songsPaginationData).subscribe(
        data => {
          if (data.statusCode != 200) {
            // handle error
          } else {
            this.songs = data.result.songs
            this.songsDataSource = new MatTableDataSource<Song>(this.songs)
            this.songsPaginationData.pageNo = data.result.pageNo
            this.songsPaginationData.totalItems = data.result.totalItems
          }
        },
        error => {
          // handle error
        }
      )
    }
    return event;
  }
}

