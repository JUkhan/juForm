import {Directive, OnInit, ContentChildren, QueryList, ElementRef} from '@angular/core';
import {juSelect} from '../juForm';
@Directive({
    selector: '.row-editor'
})
export class rowEditor implements OnInit {

    constructor() { }
    @ContentChildren(juSelect) items: QueryList<juSelect>;

    ngAfterContentInit() {
        // do something with list items
        console.log(this.items);
    }

    ngOnInit() { }
}