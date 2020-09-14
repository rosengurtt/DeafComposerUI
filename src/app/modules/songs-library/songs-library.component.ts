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
import { FormControl } from '@angular/forms'
import { AppStateServiceService } from 'src/app/core/services/app-state.service'

@Component({
  selector: 'dc-songs-library',
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
  songsPaginationData: PaginationData = { pageNo: 0, totalItems: 0, totalPages: 0, pageSize: 11 }
  stylesPageEvent: PageEvent
  bandPageEvent: PageEvent
  songsPageEvent: PageEvent
  selectedStyleId = 0
  selectedBandId = 0
  selectedSongId = -1
  selectedFileName = ''
  selectedSong: Song
  uploadedFile: File
  uploadResult: string
  listFilter: string
  subscriptionSearchTerms: Subscription[] = []
  displayedColumns: string[] = ['name'];
  stylesDataSource: MatTableDataSource<MusicStyle>
  bandsDataSource: MatTableDataSource<Band>
  songsDataSource: MatTableDataSource<Song>
  styleTerm = new FormControl()
  bandTerm = new FormControl()
  songTerm = new FormControl()
  @ViewChild('stylesPaginator', { read: MatPaginator, static: true }) stylesPaginator: MatPaginator;
  @ViewChild('bandsPaginator', { read: MatPaginator, static: true }) bandsPaginator: MatPaginator;
  @ViewChild('songsPaginator', { read: MatPaginator, static: true }) songsPaginator: MatPaginator;

  constructor(
    private router: Router,
    private songService: SongsRepositoryService,
    private appStateServiceService: AppStateServiceService) {
  }

  async ngOnInit(): Promise<any> {
    this.subscriptionSearchTerms.push(this.styleTerm.valueChanges.subscribe(value => this.refreshStyles()))
    this.subscriptionSearchTerms.push(this.bandTerm.valueChanges.subscribe(value => this.refreshBands()))
    this.subscriptionSearchTerms.push(this.songTerm.valueChanges.subscribe(value => this.refreshSongs()))
    this.refreshStyles()
  }

  async refreshStyles() {
    this.songService.getStyles(this.stylesPaginationData, this.styleTerm.value).subscribe(data => {
      this.styles = data.result.styles
      this.styles.unshift(new MusicStyle("All", 0))
      this.selectedStyleId = 0
      this.stylesDataSource = new MatTableDataSource<MusicStyle>(this.styles)
      this.stylesPaginationData.totalItems = data.result.totalItems
      this.stylesPaginationData.pageNo = data.result.pageNo
      this.stylesDataSource.paginator = this.stylesPaginator;
      this.refreshBands()
    })
  }
  async refreshBands() {
    this.songService.getBands(this.selectedStyleId, this.bandsPaginationData, this.bandTerm.value)
      .subscribe(data => {
        this.bands = data.result.bands
        this.bands.unshift(new Band("All", 0))
        this.selectedBandId = 0
        this.bandsDataSource = new MatTableDataSource<Band>(this.bands)
        this.bandsPaginationData.pageNo = data.result.pageNo
        this.bandsPaginationData.totalItems = data.result.totalItems
        this.refreshSongs()
      })
  }
  async refreshSongs() {
    this.songService.getSongs(this.selectedStyleId, this.selectedBandId, this.songsPaginationData, this.songTerm.value).subscribe(data => {
      this.songs = data.result.songs
      this.songsDataSource = new MatTableDataSource<Song>(this.songs)
      this.songsPaginationData.pageNo = data.result.pageNo
      this.songsPaginationData.totalItems = data.result.totalItems
    })
  }

  // applyFilter(filterValue: string) {
  // this.dataSource.filter = filterValue.trim().toLowerCase();
  //}
  async selectStyle(styleId: number) {
    this.selectedStyleId = styleId
    this.songsPaginationData.pageNo = 0
    this.bandsPaginationData.pageNo = 0
    this.refreshBands()
  }
  async selectBand(bandId: number) {
    this.selectedBandId = bandId
    this.songsPaginationData.pageNo = 0
    this.refreshSongs()
  }
  async selectSong(songId: number) {
    this.selectedSongId = songId

    this.songService.getSongInfoById(songId).subscribe(
      data => {
        this.selectedSong = data.result
        // const eventData: any = { id: songId, songName: data.result.name, bandName: data.result.band.name }
        // this.songsLibraryEventsService.raiseEvent(SongsLibraryEventTypes.songSelected, eventData)
      }
    )
  }

  public getStylesPage(event?: PageEvent) {
    if (event) {
      this.stylesPaginationData.pageNo = event.pageIndex
      this.refreshStyles()
    }
    return event;
  }
  public getBandsPage(event?: PageEvent) {
    if (event) {
      this.bandsPaginationData.pageNo = event.pageIndex
      this.selectedBandId = 0
      this.refreshBands()
    }
    return event;
  }

  public getSongsPage(event?: PageEvent): PageEvent {
    if (event) {
      this.selectedSongId = -1
      this.songsPaginationData.pageNo = event.pageIndex
      this.refreshSongs()
    }
    return event;
  }

  public analyzeSong(){
    this.appStateServiceService.addSong(this.selectedSong)
    this.router.navigate(["song-panel", this.selectedSongId])
  }

  ngOnDestroy() {
    this.subscriptionSearchTerms.forEach(t => t.unsubscribe())
  }
}

