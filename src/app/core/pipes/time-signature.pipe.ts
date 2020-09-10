import { Pipe, PipeTransform } from "@angular/core";
import { TimeSignature } from "../models/time-signature";

@Pipe({ name: 'timeSignature' })
export class TimeSignaturePipe implements PipeTransform {
    transform(value: TimeSignature): string {
        return `${value.numerator}/${value.denominator}`
    }
}