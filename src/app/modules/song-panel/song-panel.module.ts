import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { RouterModule } from '@angular/router'
import { BrowserModule } from '@angular/platform-browser'
import { MaterialModule } from '../../core/material.module';


import { SongsRepositoryService } from '../../core/services/songs-repository/songs-repository.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SongPanelComponent } from './song-panel.component';

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
      ])
    ],
    providers: [
      SongsRepositoryService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
  })
  export class SongPanelModule { }
  