import {Component, OnInit, Input} from '@angular/core';
import { Router, ROUTER_DIRECTIVES } from '@angular/router';
@Component({
    selector: '[juMenu], juMenu',
    template:require('./juMenu.html'),
    host:{'class':'collapse navbar-collapse'},
    styleUrls: ['./juMenu.css'],
    providers:[ROUTER_DIRECTIVES]
})

export class juMenu implements OnInit {
    
    @Input() menuData:any[];
    constructor() { }

    ngOnInit() {
        
     }
}

