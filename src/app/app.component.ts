import { Component } from '@angular/core';
//import { ROUTER_DIRECTIVES } from '@angular/router';

import { AppService } from './shared';
import {juMenu, uiService} from '../app/jComponents';
import '../style/app.scss';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'my-app', // <my-app></my-app>
  providers: [uiService, AppService],
  directives: [juMenu],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  menuData:any[];
  url:string="abc"
  constructor() {
  }
  ngOnInit(){
    this.menuData=[
      {name:'Home', link:'/', icon: 'fa fa-home'},
      {name:'Settings', icon: 'fa fa-gear',items:[
         {name:'Setting1', link:'/set1', icon: 'fa fa-home'},
         {name:'Grid', link:'/grid', icon: 'fa fa-home'},
      ]},
      {name:'About', link:'/about', icon: 'fa fa-male'},
      {name:'Window', link:'/window', icon: 'fa fa-gear'}
    ];
  }
}
