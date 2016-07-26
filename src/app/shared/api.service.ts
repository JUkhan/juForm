import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ApiService {
  title = 'Angular 2';
  get(url) {
    return Observable.of(this.scholarList)
  }
  post(url, model) {
    return Observable.of(model)
  }
  put(url, model) {
    return Observable.of(model)
  }
  delete(url) {
    return Observable.of(true);
  }
  scholarList: any[] = [
    { id: 1, name: 'Abdulla', hasChild: true, education: 'CSE', address: 'Tngail', age: 23, description: 'Description..' },
    { id: 2, name: 'Ariful', hasChild: true, education: 'BBA', address: 'Tngail', age: 27, description: 'Description..' },
    { id: 3, name: 'Shofiqul', education: 'MBA', address: 'Tngail', age: 33, description: 'Description..' },
    { id: 4, name: 'Siddika', education: 'CSE', address: 'Tngail', age: 35, description: 'Description..' }
  ];
  getChildData(row: any) {
    return Observable.of([
      { id: 3, name: 'child1', hasChild: true, education: 'MBA', address: 'Tngail', age: 33, description: 'Description..' },
      { id: 4, name: 'child2', hasChild: true, education: 'CSE', address: 'Tngail', age: 35, description: 'Description..' }
    ])
  }

  getUploadData(url: string) {
    return Observable.of({
      totalPage: 15, data: [...this.scholarList]
    });
  }
  getEducations() {
    return Observable.of([{ name: 'CSE', value: 'CSE' }, { name: 'BBA', value: 'BBA' }, { name: 'MBA', value: 'MBA' }]);
  }
   getEducations2() {
    return [{ name: 'CSE', value: 'CSE' }, { name: 'BBA', value: 'BBA' }, { name: 'MBA', value: 'MBA' }];
  }
}
