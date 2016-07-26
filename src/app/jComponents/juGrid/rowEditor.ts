import {Directive, OnInit, ContentChildren, QueryList, ElementRef, OnDestroy} from '@angular/core';
import {juSelect} from '../juForm';
import {Observable, Subscription} from 'rxjs';
@Directive({
    selector: '.row-editor',
    inputs: ['model'],
    outputs:['rowUpdate']
})
export class rowEditor implements OnInit {  
    model: any;
    isUpdated: boolean = false;    
    private subsList: Subscription[] = [];
    constructor(private el: ElementRef) {

    }
    @ContentChildren(juSelect) juSelectList: QueryList<juSelect>;

    ngAfterContentInit() {
        this.eventBinding(this.el.nativeElement.querySelectorAll('.select'), 'change');
        this.eventBinding(this.el.nativeElement.querySelectorAll('.text'), 'change');
        this.juSelectList.toArray().forEach(_=>{
           this.subsList.push(_.notifyRowEditor.subscribe(()=>{this.isUpdated=true}));
        })
    }

    ngOnInit() {

    }
    ngOnDestroy() {
        console.log('destroy...');
        this.subsList.forEach(_ => {
            if (!_.isUnsubscribed) {
                _.unsubscribe();
                _.remove(_);
            }
        })
    }    
    private eventBinding(list: any[], eventName: string) {
        for (var i = 0; i < list.length; i++) {
            this.subsList.push(Observable.fromEvent(list[i], eventName).subscribe(e => {
                this.isUpdated = true;
            }));
        }
    }
}