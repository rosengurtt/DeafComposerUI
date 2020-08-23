import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { MaterialModule } from '../../core/material.module';

import { SongsLibraryComponent } from './songs-library.component'
import { SongFilterPipe } from './pipes/song-filter.pipe'
import { SortPipe } from '../../core/pipes/sort-by.pipe'

import { SongsRepositoryService } from '../../core/services/songs-repository/songs-repository.service';

@NgModule({
    declarations: [
      SongsLibraryComponent,
      SongFilterPipe,
      SortPipe
    ],
    imports: [
      BrowserModule,
      MaterialModule,
      RouterModule.forChild([
        { path: 'songs-library', component: SongsLibraryComponent },
      ])
    ],
    providers: [
      SongsRepositoryService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class SongsLibraryModule { }
  