import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'splitCamelCase' })
export class SplitCamelCasePipe implements PipeTransform {
    transform(textInCamelCase: string): string {      
        return textInCamelCase?.replace(/([a-z](?=[A-Z]))/g, '$1 ')
    }
}