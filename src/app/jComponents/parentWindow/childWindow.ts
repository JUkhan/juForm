import {Component, Renderer, DynamicComponentLoader, Injector, ApplicationRef, ViewChild, ElementRef, OnInit, OnDestroy, ViewEncapsulation, AfterViewInit } from '@angular/core';
import {WindowService} from './windowService';
import {Observable, Subscription} from 'rxjs';
@Component({
    selector: 'child-window',
    templateUrl: './childWindow.html',
    //inputs: ['title'],
    encapsulation: ViewEncapsulation.None
})

export class ChildWindow implements OnInit, OnDestroy, AfterViewInit {
    title: string = 'title';
    top: number = 200;
    left: number = 300;
    private _width: number;
    private _height: number;
    private compRef: any;
    private isMax: boolean = true;
    private subList:Subscription[]=[];
    windowId: string;
    constructor(private service: WindowService,
        private dcl: DynamicComponentLoader,
        private injector: Injector,
        private appRef: ApplicationRef,
        private renderer: Renderer) { }

    @ViewChild('header') header: ElementRef;
    @ViewChild('window') window: ElementRef;
    @ViewChild('placeholder') placeholder: ElementRef;

    ngOnInit() {

    }
    ngOnDestroy() {
        this.subList.forEach(_=>{
            if(!_.isUnsubscribed){
                _.unsubscribe();
                _.remove(_);
            }
        });
        this.compRef.destroy();
    }
    ngAfterViewInit() {
        this.moveWindow();
        this.addListeners();
        this.service.syncZIndex(this.windowId);
        this.loadComponent();
        this.adjustHeight(this.height);
        this.adjustWidth(this.width);
    }
    private loadComponent() {
        this.dcl.loadAsRoot(this.service.getComponent(this.windowId), this.placeholder.nativeElement, this.injector)
            .then((compRef => {
                this.compRef = compRef;
                (<any>this.appRef)._loadComponent(compRef);
                compRef.onDestroy(() => {
                    (<any>this.appRef)._unloadComponent(compRef);

                })
                return compRef;
            }));
    }
    public set width(val) {
        this._width = val;
        this.adjustWidth(val);
    }
    public set height(val) {
        this._height = val;
        this.adjustHeight(val);
    }
    public get height() { return this._height; }
    public get width() { return this._width; }
    private addListeners() {
        let mousedown$ = Observable.fromEvent(this.header.nativeElement, 'mousedown'),
            mousemove$ = Observable.fromEvent(this.header.nativeElement, 'mousemove'),
            mouseup$ = Observable.fromEvent(this.header.nativeElement, 'mouseup');
       this.subList.push(mousedown$.filter((e:any)=>e.target.className==='header' && this.isMax).flatMap((md: any) => {
            const startX = md.clientX + window.scrollX,
                startY = md.clientY + window.scrollY,
                startLeft = +this.left,
                startTop = +this.top; 
            this.setStyle('z-index', '10');
            this.renderer.setElementStyle(this.header.nativeElement, 'cursor', 'move');
            return mousemove$
                .map((mm: MouseEvent) => {
                    return {
                        left: startLeft + mm.clientX - startX,
                        top: startTop + mm.clientY - startY
                    };
                }).filter(e=>e.top>=0 && e.left>=0)
                .takeUntil(mouseup$)
        }).subscribe((val: any) => {
            this.top = val.top;
            this.left = val.left;
            this.moveWindow();
        }));

       this.subList.push(mouseup$.subscribe(e => {
            this.service.syncZIndex(this.windowId);
            this.renderer.setElementStyle(this.header.nativeElement, 'cursor', 'default');
        }));
    }
    private closeWindow(event) {       
        this.service.closeWindow(this.windowId);
    }
    private minimizeWindow(event) {
       this.setStyle('display', 'none');
       this.service.minWindow(this.windowId);
    }
    private minmaxWindow(event) {        
        this.service.expand(this.windowId, this.isMax);
        this.isMax = !this.isMax;
    }
    private moveWindow() {
        this.renderer.setElementStyle(this.window.nativeElement, 'top', this.top + 'px');
        this.renderer.setElementStyle(this.window.nativeElement, 'left', this.left + 'px');
    }
    private setStyle(styleName: string, styleValue: string) {
        this.renderer.setElementStyle(this.window.nativeElement, styleName, styleValue);
    }
    private onBodyClick() {
        this.service.syncZIndex(this.windowId);
    }
    private adjustWidth(width: number) {
        this.setStyle('width', width + 'px');
        this.renderer.setElementStyle(this.placeholder.nativeElement, 'width', (width-2) + 'px');
    }
    private adjustHeight(height: number) {
        this.setStyle('height', height + 'px');
        this.renderer.setElementStyle(this.placeholder.nativeElement, 'height', (height - 35) + 'px');
    }
}