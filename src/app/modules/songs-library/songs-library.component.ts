import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { Band } from "../../core/models/band";
import { MusicStyle } from "../../core/models/music-style";
import { Song } from "../../core/models/song";
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'dc-songs-library',
    templateUrl: './songs-library.compnonent.html',
    styleUrls: ['./songs-library.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SongsLibraryComponent {
    @Input() stylesDataSource: MatTableDataSource<MusicStyle>
    @Input() bandsDataSource: MatTableDataSource<Band>
    @Input() songsDataSource: MatTableDataSource<Song>
    @Input() styleSelected: MusicStyle
    @Input() bandSelected: Band
    @Input() songSelected: Song
    @Input() stylesPageNo: number
    @Input() bandsPageNo: number
    @Input() songsPageNo: number
    @Input() stylesPageSize: number
    @Input() bandsPageSize: number
    @Input() songsPageSize: number
    @Input() totalStyles: number | null
    @Input() totalBands: number | null
    @Input() totalSongs: number | null
    @Output() stylesPageChanged = new EventEmitter<number>()
    @Output() bandsPageChanged = new EventEmitter<number>()
    @Output() songsPageChanged = new EventEmitter<number>()
    @Output() stylesTermChanged = new EventEmitter<string>()
    @Output() bandsTermChanged = new EventEmitter<string>()
    @Output() songsTermChanged = new EventEmitter<string>()
    @Output() styleSelectedChanged = new EventEmitter<MusicStyle>()
    @Output() bandSelectedChanged = new EventEmitter<Band>()
    @Output() songSelectedChanged = new EventEmitter<Song>()
    displayedColumns: string[] = ['name'];
    subscriptionSearchTerms: Subscription[] = []
    styleTerm = new FormControl()
    bandTerm = new FormControl()
    songTerm = new FormControl()

    async ngOnInit(): Promise<any> {
        this.subscriptionSearchTerms.push(this.styleTerm.valueChanges.subscribe(value => this.stylesTermChanged.emit(value)))
        this.subscriptionSearchTerms.push(this.bandTerm.valueChanges.subscribe(value => this.bandsTermChanged.emit(value)))
        this.subscriptionSearchTerms.push(this.songTerm.valueChanges.subscribe(value => this.songsTermChanged.emit(value)))

      }

    public getStylesPage(event?: PageEvent) {
        if (event) this.stylesPageChanged.emit(event.pageIndex)
        return event;
    }

    public getBandsPage(event?: PageEvent) {
        if (event) this.bandsPageChanged.emit(event.pageIndex)
        return event;
    }

    public getSongsPage(event?: PageEvent) {
        if (event) this.songsPageChanged.emit(event.pageIndex)
        return event;
    }

    selectStyle(style: MusicStyle) {
        this.styleSelectedChanged.emit(style)
    }
    selectBand(band: Band) {
        this.bandSelectedChanged.emit(band)
    }
    selectSong(song: Song) {
        this.songSelectedChanged.emit(song)
    }

    newStyleTerm(newTerm: string) {
        this.stylesTermChanged.emit(newTerm)
    }
    newBandTerm(newTerm: string) {
        this.bandsTermChanged.emit(newTerm)
    }
    newSongTerm(newTerm: string) {
        this.songsTermChanged.emit(newTerm)
    }
}