import {Component, OnInit, Input} from '@angular/core';

@Component({
    selector: '[juMenu], juMenu',
    template:require('./juMenu.html'),
    host:{'class':'collapse navbar-collapse'},
    styleUrls: ['./juMenu.css']
})

export class juMenu implements OnInit {
    
    @Input() menuData:any[];
    constructor() { }

    ngOnInit() {
        
     }
}

