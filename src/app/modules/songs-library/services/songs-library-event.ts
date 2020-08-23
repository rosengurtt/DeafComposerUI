import { SongsLibraryEventTypes } from './songs-library-event-types.enum';

export class SongsLibraryEvent {
    constructor(public type: SongsLibraryEventTypes, public data: any) {
    }
}