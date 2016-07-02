import {Component, OnInit, Input} from 'angular2/core';

@Component({
    selector: '[menu]',
    template:require('./menu.html'),
    host:{'class':'collapse navbar-collapse'}
})

export class menuComponent implements OnInit {
    
    @Input() menuData:any[];
    constructor() { }

    ngOnInit() {
        
     }
}

