import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Song } from '../models/song';
import { AppStateServiceService } from '../services/app-state.service';

@Component({
  selector: 'dc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() songs: Song[];

  constructor(
    private router: Router,
    private appStateService: AppStateServiceService) { }

 
  selectSong(event) {
    if (event) {
      console.log(event)
      this.router.navigate(["song-panel", "1"])
    }
  }


}
