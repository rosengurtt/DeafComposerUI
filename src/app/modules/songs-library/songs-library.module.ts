import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { MaterialModule } from '../../core/material.module';

import { SongsLibraryComponent } from './songs-library.component'
import { SongFilterPipe } from './pipes/song-filter.pipe'
import { SortPipe } from '../../core/pipes/sort-by.pipe'
import { TimeSignaturePipe } from '../../core/pipes/time-signature.pipe'
import { TimeDurationPipe } from '../../core/pipes/time-duration.pipe'
import { FileNameToSongNamePipe } from '../../core/pipes/filename2songname.pipe'
import { InstrumentCodeToNamePipe } from '../../core/pipes/instrumentCode2Name'

import { SongsRepositoryService } from '../../core/services/songs-repository/songs-repository.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SongSearchService } from 'src/app/modules/songs-library/services/song-search.service';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {songsLibraryFeatureKey} from './state'
import {songsLibraryReducer} from './state/songs-library.reducer'

@NgModule({
    declarations: [
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
        { path: 'songs-library', component: SongsLibraryComponent },
      ]),
      StoreModule.forFeature(songsLibraryFeatureKey, songsLibraryReducer),
      EffectsModule.forFeature([ProductEffects])
    ],
    providers: [
      SongsRepositoryService,
      SongSearchService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class SongsLibraryModule { }
  