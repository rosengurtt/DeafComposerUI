import { SongPanelState } from '../../modules/song-panel/state';


// Representation of the entire app state
// Extended by lazy loaded modules
export interface State {
  songPanel: SongPanelState;
}
