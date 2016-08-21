import { Component } from '@angular/core';
import '../style/app.scss';
/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'my-app', 
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
         {name:'Upload', link:'/upload', icon: 'fa fa-home'},
         {name:'Grid', link:'/grid', icon: 'fa fa-home'},
      ]},
      {name:'About', link:'/about', icon: 'fa fa-male'},
      {name:'Window', link:'/window', icon: 'fa fa-gear'}
    ];
  }
}
