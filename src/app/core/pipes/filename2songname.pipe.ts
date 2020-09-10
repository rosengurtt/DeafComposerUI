import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'fileNameToSongName' })
export class FileNameToSongNamePipe implements PipeTransform {
    transform(value: string): string {
        if (value.toLowerCase().endsWith('.mid'))
            value = value.substring(0, value.length - 4)
        value = value.replace(/_/g, ' ')
        value = value.replace(/-/g, ' ')
        return value
    }
}