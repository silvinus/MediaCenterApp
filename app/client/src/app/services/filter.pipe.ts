import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, property: string): any[] {
    if (!items) { return []; }
    if (!searchText) { return items; }
searchText = searchText.toLowerCase();
return items.filter( it => {
      if (property !== '') {
        return it[property].toLowerCase().includes(searchText);
      }
      return it.toLowerCase().includes(searchText);
    });
   }
}
