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

    constructor(data: any) {
        this.id = data.id
        this.songId = data.songId
        this.durationInSeconds = data.durationInSeconds
        this.hasMoreThanOneInstrumentPerTrack = data.hasMoreThanOneInstrumentPerTrack
        this.hasMoreThanOneChannelPerTrack = data.hasMoreThanOneChannelPerTrack
        this.highestPitch = data.highestPitch
        this.lowestPitch = data.lowestPitch
        this.numberBars = data.numberBars
        this.numberOfTicks = data.numberOfTicks
        this.tempoInMicrosecondsPerBeat = data.tempoInMicrosecondsPerBeat
        this.tempoInBeatsPerMinute = data.tempoInBeatsPerMinute
        this.timeSignature = data.timeSignature
        this.totalDifferentPitches = data.totalDifferentPitches
        this.totalUniquePitches = data.totalUniquePitches
        this.totalTracks = data.totalTracks
        this.totalTracksWithoutNotes = data.totalTracksWithoutNotes
        this.totalBassTracks = data.totalBassTracks
        this.totalChordTracks = data.totalChordTracks
        this.totalMelodicTracks = data.totalMelodicTracks
        this.totalPercussionTracks = data.totalPercussionTracks
        this.totalInstruments = data.totalInstruments
        this.instrumentsAsString = data.instrumentsAsString
        this.instruments = data.instruments
        this.totalPercussionInstruments = data.totalPercussionInstruments
        this.totalChannels = data.totalChannels
        this.totalTempoChanges = data.totalTempoChanges
        this.totalEvents = data.totalEvents
        this.totalPitchBendEvents = data.totalPitchBendEvents
        this.totalProgramChangeEvents = data.totalProgramChangeEvents
        this.totalControlChangeEvents = data.totalControlChangeEvents
        this.totalSustainPedalEvents = data.totalSustainPedalEvents
        this.totalChannelIndependentEvents = data.totalChannelIndependentEvents
    }

}