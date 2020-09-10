import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'timeDuration' })
export class TimeDurationPipe implements PipeTransform {
    transform(timeInSeconds: number): string {
        const hours = Math.floor(timeInSeconds / 3600)
        const minutes = Math.floor((timeInSeconds - hours * 3600) / 60)
        const seconds = timeInSeconds - hours * 3600 - minutes * 60
        const hoursPart = hours > 0 ? `${hours}h` : ''
        const minutesPart = (hours > 0 || minutes > 0) ? `${minutes}m` : ''
        const secondsPart = `${seconds}s`
        return `${hoursPart} ${minutesPart} ${secondsPart}`
    }
}