import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { MaterialModule } from '../../core/material.module'

import { SongsRepositoryService } from '../../core/services/songs-repository/songs-repository.service'
import { ReactiveFormsModule } from '@angular/forms'
import { SongPanelShellComponent } from './song-panel-shell.component'
import { SongPanelComponent } from './song-panel.component'
import { StoreModule } from '@ngrx/store'
import { songsPanelFeatureKey } from './state'
import { songPanelReducer } from './state/song-panel.reducer';
import { TrackComponent } from './track/track.component'
import { SplitCamelCasePipe } from 'src/app/core/pipes/split-camel-case.pipe'
import { DrawingMusicalNotationGlobalService } from './services/drawing-musical-notation-global.service'

@NgModule({
    declarations: [
      SongPanelComponent,
      SongPanelShellComponent,
      TrackComponent,
      SplitCamelCasePipe
    ],
    imports: [
      BrowserModule,
      MaterialModule,
      ReactiveFormsModule,
      RouterModule.forChild([
        { path: 'song-panel/:songId', component: SongPanelShellComponent },
      ]),
      StoreModule.forFeature(songsPanelFeatureKey, songPanelReducer)
      
    ],
    providers: [
      SongsRepositoryService,
      DrawingMusicalNotationGlobalService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class SongPanelModule { }
  