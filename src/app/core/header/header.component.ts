import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Song } from '../models/song';

@Component({
  selector: 'dc-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() songsUnderAnalysis: Song[]

  constructor(private router: Router) { }



}
