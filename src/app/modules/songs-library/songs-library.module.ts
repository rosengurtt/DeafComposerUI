import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { ReactiveFormsModule } from '@angular/forms'
import { SongSearchService } from 'src/app/modules/songs-library/services/song-search.service'
import { StoreModule } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects'
import { SongsLibraryShellComponent } from './songs-library-shell.component'
import { SongsLibraryComponent } from './songs-library.component'
import { SongFilterPipe } from './pipes/song-filter.pipe'
import { SortPipe } from '../../core/pipes/sort-by.pipe'
import { TimeSignaturePipe } from '../../core/pipes/time-signature.pipe'
import { TimeDurationPipe } from '../../core/pipes/time-duration.pipe'
import { FileNameToSongNamePipe } from '../../core/pipes/filename2songname.pipe'
import { InstrumentCodeToNamePipe } from '../../core/pipes/instrumentCode2Name'
import { SongsRepositoryService } from '../../core/services/songs-repository/songs-repository.service'
import { songsLibraryFeatureKey } from './state'
import { songsLibraryReducer } from './state/songs-library.reducer'
import { SongsLibraryEffects } from '../songs-library/state/songs-library.effects'
import { MaterialModule } from '../../core/material.module'

@NgModule({
  declarations: [
    SongsLibraryShellComponent,
    SongsLibraryComponent,
    SongFilterPipe,
    SortPipe,
    TimeSignaturePipe,
    TimeDurationPipe,
    FileNameToSongNamePipe,
    InstrumentCodeToNamePipe
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'songs-library', component: SongsLibraryShellComponent },
    ]),
    StoreModule.forFeature(songsLibraryFeatureKey, songsLibraryReducer),
    EffectsModule.forFeature([SongsLibraryEffects])
  ],
  providers: [
    SongsRepositoryService,
    SongSearchService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SongsLibraryModule { }
