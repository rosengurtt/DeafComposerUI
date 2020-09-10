import { Pipe, PipeTransform } from "@angular/core";
import { Instrument } from '../models/midi/midi-codes/instrument.enum'
import { stringify } from "querystring";

@Pipe({ name: 'instrumentCodeToName' })
export class InstrumentCodeToNamePipe implements PipeTransform {
    transform(value: string): string {
        let retVal = value.split(',')
        return retVal.map(v => Instrument[+v]).join(', ')
    }
}