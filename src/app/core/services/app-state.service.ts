import { Injectable } from '@angular/core';

import { Song } from '../models/song'

@Injectable({
  providedIn: 'root'
})
export class AppStateServiceService {


  songs: Song[]
  constructor() {
    this.songs = []
  }

  public addSong(song: Song) {
    this.songs.push(song)
  }
  public getSongs(): Song[] {
    return this.songs
  }
  public removeSong(id: number) {
    const indexToRemove = this.songs.findIndex(s => s.id === id)
    if (indexToRemove) this.songs.splice(indexToRemove, 1)
  }
}
