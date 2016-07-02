import {Inject, forwardRef, Component, OnInit, OnDestroy, Directive, Input, Output, ElementRef, EventEmitter, ViewEncapsulation} from '@angular/core';
import {AppService} from '../../services';
import {find} from 'lodash';


declare var jQuery: any;
declare var Hammer: any;
declare var TweenLite: any;
declare var Expo: any;
@Component({
    selector: '[data-panel]', encapsulation: ViewEncapsulation.None,
    template: `    
      <ul class="nav nav-tabs" *ngIf="viewMode==='mobile'">
      <li *ngFor="let pane of panes"
          (click)="select(pane)"
          role="presentation" [class.active]="pane.active">
        <a>{{pane.title}}</a>
      </li>
    </ul>    
    <div [class.mobile-content]="viewMode==='mobile'"><ng-content></ng-content></div>
    `,
    styles: [`a { cursor: pointer; cursor: hand; }
    .mobile-content{position: relative;width:100%}
    `]
})

export class DataPanel implements OnInit, OnDestroy {
    viewMode: string = 'mobile';
    @Output() onActive = new EventEmitter();
    activePane: UiPane = null;
    width: number;
    panes: UiPane[] = []
    constructor(appService: AppService, private el: ElementRef) {
        this.viewMode = appService.mobileCheck() ? 'mobile' : 'web';
    }

    ngOnInit() {

        if (this.viewMode == 'web') {
            this.panes.forEach((p: UiPane) => {

            });
        }
        else {
            let tid =setTimeout(() => {

                TweenLite.set(jQuery(this.el.nativeElement).find('.slide-content').filter(":gt(0)"), { autoAlpha: 0 });
                this.activePane = find(this.panes, (p: UiPane) => p.active == true);
                /*let index=0;
                 this.width= jQuery(this.el.nativeElement).find('.mobile-content').width();  
                this.panes.forEach((p: UiPane) =>{
                     p.index=index;
                    if(p.active){
                        this.activePane=p;
                    }
                    TweenLite.set( jQuery(p.elementRef.nativeElement).find('.slide-content'), {left:this.width*index});
                    index++;
                });*/

                clearTimeout(tid);
            }, 0);

        }
    }

    ngOnDestroy() { }
    addPane(pane: UiPane) {
        if (this.viewMode !== 'mobile') {
            //pane.active=true; 
        }
        this.panes.push(pane);
    }
    removePane(pane: UiPane) {
        this.panes.splice(this.panes.indexOf(pane), 1);
    }
    select(pane: UiPane) {
        this.panes.forEach((p: UiPane) => p.active = p == pane);
        this.animate(pane);
        this._addSwipeEvent(find(this.panes, (p: UiPane) => p.active));
        this.onActive.next(pane);
        this.activePane = pane;

    }
    animate(paneGoingToActive: UiPane) {
        //TweenLite.to(jQuery(this.activePane.elementRef.nativeElement).find('.slide-content'), 1, {css:{'left':  -((this.activePane.index+1)* this.width) +'px'}, ease:Expo.easeOut});
        //TweenLite.to(jQuery(paneGoingToActive.elementRef.nativeElement).find('.slide-content'), 1, {css:{'left':  (0) +'px'}, ease:Expo.easeOut});
        TweenLite.to(jQuery(this.activePane.elementRef.nativeElement).find('.slide-content'), 1.3, { autoAlpha: 0 });		//fade out the old slide
        //currentSlide = ++currentSlide % $slides.length;	//find out which is the next slide		

        TweenLite.to(jQuery(paneGoingToActive.elementRef.nativeElement).find('.slide-content'), 1.3, { autoAlpha: 1 });		//fade in the next slide
        //TweenLite.delayedCall(stayTime, nextSlide);
    }
    nextPane(pane: UiPane, swipe: String) {
        var index = this.panes.indexOf(pane), len = this.panes.length;
        swipe === 'swipeleft' ? index++ : index--;
        if (index >= 0 && index < len) {
            this.select(this.panes[index]);
        }
    }
    _addSwipeEvent(pane: UiPane) {
        if (pane && this.viewMode === 'mobile') {
            let tid = setTimeout(() => { pane.addSwipeEvent(); clearTimeout(tid); }, 0);
        }
    }
}

@Component({
    selector: 'ui-pane', encapsulation: ViewEncapsulation.None,
    template: `<div [ngClass]="{'panel panel-default':panel.viewMode==='web', 'slide-content':panel.viewMode==='mobile'}" >
    <div (click)="slideToggle()" *ngIf="panel.viewMode==='web'" class="panel-heading cursor">
         <h3 class="panel-title">{{title}} <b class="pull-right fa fa-{{active?'minus':'plus'}}-circle"></b></h3>
    </div>
    <div [class.panel-body]="panel.viewMode==='web'"><ng-content></ng-content></div>
  </div>
  `,
    styles: [`
  .cursor{cursor:pointer;}
  .slide-content{position: absolute;top:0px;left:0px;width:100%;overflow: hidden;}
  `]
})
export class UiPane implements OnDestroy, OnInit {
    @Input() title: string;
    _active: boolean;
    _clickOnToggle: boolean = false;
    @Input() set active(val) {
        this._active = val;
        if (!this._clickOnToggle) {
            this._active ?
                jQuery(this.elementRef.nativeElement).find('.panel-body').slideDown()
                :
                jQuery(this.elementRef.nativeElement).find('.panel-body').slideUp()
        }else{
            this._clickOnToggle=false;
        }
    }
    get active() {
        return this._active;
    }
    index: number;
    private _hammer: any = null;
    //[style.visibility]="active?'visible':'hidden'"
    constructor(private panel: DataPanel, public elementRef: ElementRef) {
        panel.addPane(this);
    }
    slideToggle() {
        this._clickOnToggle=true;
        this.active = !this.active;
        jQuery(this.elementRef.nativeElement).find('.panel-body').slideToggle();
    }
    addSwipeEvent() {
        if (this.active && this._hammer == null) {
            var el = this.elementRef.nativeElement.querySelector('div');
            if (el) {
                this._hammer = new Hammer(el);
                this._hammer.on('swipeleft swiperight', (e: any) => {
                    this.panel.nextPane(this, e.type);
                });
            }
        }
    }
    ngAfterViewInit() {
        if (this.active && this.panel.viewMode === 'mobile') {
            this.addSwipeEvent();
            this.panel.onActive.next(this);
        }
    }
    ngOnInit() {
        let tid = setTimeout(() => {
            if ((typeof this.active === 'undefined') || this.active == false) {
                this.active = false;
                jQuery(this.elementRef.nativeElement).find('.panel-body').slideUp();
            }
        }, 0);

    }
    ngOnDestroy() {
        this.panel.removePane(this);
        if (this._hammer) {
            this._hammer.destroy();
        }
    }

}



