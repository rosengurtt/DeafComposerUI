import { TimeSignature } from './time-signature'


export class SongStats {
    id: number
    songId: number
    durationInSeconds: number
    hasMoreThanOneInstrumentPerTrack: boolean
    hasMoreThanOneChannelPerTrack: boolean
    highestPitch: number
    lowestPitch: number
    numberBars: number
    numberOfTicks: number
    tempoInMicrosecondsPerBeat: number
    tempoInBeatsPerMinute: number
    timeSignature: TimeSignature
    totalDifferentPitches: number
    totalUniquePitches: number
    totalTracks: number
    totalTracksWithoutNotes: number
    totalBassTracks: number
    totalChordTracks: number
    totalMelodicTracks: number
    totalPercussionTracks: number
    totalInstruments: number
    instrumentsAsString: number
    instruments: number[]
    totalPercussionInstruments: number
    totalChannels: number
    totalTempoChanges: number
    totalEvents: number
    totalNoteEvents: number
    totalPitchBendEvents: number
    totalProgramChangeEvents: number
    totalControlChangeEvents: number
    totalSustainPedalEvents: number
    totalChannelIndependentEvents: number
}