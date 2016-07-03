import {Component, OnInit, Input} from '@angular/core';

@Component({
    selector: '[menu], menu',
    template:require('./menu.html'),
    host:{'class':'collapse navbar-collapse'},
    styleUrls: ['./menu.css']
})

export class menuComponent implements OnInit {
    
    @Input() menuData:any[];
    constructor() { }

    ngOnInit() {
        
     }
}

