import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { MaterialModule } from '../../core/material.module'


import { SongsRepositoryService } from '../../core/services/songs-repository/songs-repository.service'
import { ReactiveFormsModule } from '@angular/forms'
import { SongPanelComponent } from './song-panel.component'
import { StoreModule } from '@ngrx/store'
import { songsPanelFeatureKey } from './state'
import { songPanelReducer } from './state/song-panel.reducer'

@NgModule({
    declarations: [
      SongPanelComponent
    ],
    imports: [
      BrowserModule,
      MaterialModule,
      ReactiveFormsModule,
      RouterModule.forChild([
        { path: 'song-panel/:songId', component: SongPanelComponent },
      ]),
      StoreModule.forFeature(songsPanelFeatureKey, songPanelReducer)
      
    ],
    providers: [
      SongsRepositoryService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class SongPanelModule { }
  