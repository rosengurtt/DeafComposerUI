import { AfterViewInit, Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { Store } from '@ngrx/store';
import { Song } from '../../core/models/song'
import { State } from '../../core/state/app.state'
import { getSongsUnderAnalysis } from '../../modules/song-panel/state'
import {map} from 'rxjs/operators'

@Component({
    selector: 'dc-header-shell',
    templateUrl: './header-shell.component.html'
})
export class HeaderShellComponent implements OnInit {

    songsUnderAnalysis$: Observable<Song[]>


    constructor(private mainStore: Store<State>) { }

    ngOnInit(): void {
        this.songsUnderAnalysis$ = this.mainStore.select(getSongsUnderAnalysis)
            .pipe(map(s=> Array.from(s.values())))
    }



}