import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ApiService {
  title = 'Angular 2';  
   get(url){
     return Observable.of(this.scholarList)
   }
   post(url, model){
     return Observable.of(model)
   }
   put(url, model){
     return Observable.of(model)
   }
   delete(url){
     return Observable.of(true);
   }
   scholarList:any[]=[
      {id:1,name:'Abdulla', education:'CSE',address:'Tngail',  description:'Description..'},
      {id:2,name:'Ariful', education:'BBA',address:'Tngail',  description:'Description..'},
      {id:3,name:'Shofiqul', education:'MBA',address:'Tngail',  description:'Description..'},
      {id:4,name:'Siddika', education:'CSE',address:'Tngail',  description:'Description..'}
  ];
}
