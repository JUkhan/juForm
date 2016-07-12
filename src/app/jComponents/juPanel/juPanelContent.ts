import {Component, OnInit, OnDestroy, ElementRef, ViewEncapsulation} from '@angular/core';
import {juPanel} from './juPanel';
declare var jQuery: any;

@Component({
    selector: 'content, [content]',
    templateUrl: './juPanelContent.html',
    inputs: ['title', 'active'],
    encapsulation: ViewEncapsulation.None
})

export class juPanelContent implements OnInit, OnDestroy {
    title: string;
    private _active: boolean = false;
    private _clickOnToggle: boolean = false;
    constructor(private panel: juPanel, public elementRef: ElementRef) {
        panel.insertContent(this);
    }
    ngOnInit() {
        let tid = setTimeout(() => {
            if (this.active == false && this.panel.viewMode==='accordion') {                              
                jQuery(this.elementRef.nativeElement).find('.panel-body').slideUp();
            }else if(this.active == false && this.panel.viewMode==='tab'){
                jQuery(this.elementRef.nativeElement).find('.tab').slideUp();
            }
            clearTimeout(tid);
        }, 0);
    }
    ngOnDestroy() {
        this.panel.removeContent(this);
    }
    set active(val) {
        this._active = val;
        if (!this._clickOnToggle) {
            this._active ?
                jQuery(this.elementRef.nativeElement).find(this.panel.viewMode==='tab'?'.tab':'.panel-body').slideDown()
                :
                jQuery(this.elementRef.nativeElement).find(this.panel.viewMode==='tab'?'.tab':'.panel-body').slideUp()
        } else {
            this._clickOnToggle = false;
        }
    }
    get active() {
        return this._active;
    }
    slideToggle() {
        this._clickOnToggle = true;
        this.active = !this.active;
        jQuery(this.elementRef.nativeElement).find('.panel-body').slideToggle();
    }
}