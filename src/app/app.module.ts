import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER  } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppInitService } from './app.init';
import { HeaderComponent } from './core/header/header.component';
import { MaterialModule } from './core/material.module';
import { HomeComponent } from './modules/home/home.component';
import { SongsLibraryModule } from './modules/songs-library/songs-library.module';
import {SongPanelModule} from './modules/song-panel/song-panel.module'
import { HttpClientModule } from '@angular/common/http';
import { SongsRepositoryService } from './core/services/songs-repository/songs-repository.service';
import { SongsLibraryEventsService } from './modules/songs-library/services/songs-library-events.service';
import { SongSearchService } from './modules/songs-library/services/song-search.service';
import {AppStateServiceService} from './core/services/app-state.service'

export function init_app(appLoadService: AppInitService) {
  return () => appLoadService.init();
}


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    SongsLibraryModule,
    SongPanelModule,
    HttpClientModule
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppInitService],
      multi: true
    },
    SongsRepositoryService,
    SongsLibraryEventsService,
    AppStateServiceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
