import {Component, ViewChild, Renderer, ViewEncapsulation, ApplicationRef, ComponentRef, ElementRef, OnInit, OnDestroy, AfterViewInit, DynamicComponentLoader, Injector} from '@angular/core';
import {ChildWindow} from './childWindow';
import {WindowService} from './windowService';
import {Subscription} from 'rxjs';
@Component({
    selector: 'pw',
    templateUrl: './parentWindow.html',
    styleUrls: ['./parentWindow.css'],
    providers: [WindowService],
    encapsulation: ViewEncapsulation.None
})

export class ParentWindow implements OnInit, OnDestroy {
    private childList: any;
    private placeHolder: any;
    private minList:any[]=[];
    private subsList:Subscription[]=[];
    constructor(private renderer: Renderer,
        private dcl: DynamicComponentLoader,
        private injector: Injector,
        private appRef: ApplicationRef,
        private service: WindowService) { }

    @ViewChild('container') container: ElementRef;
    @ViewChild('footer') footer: ElementRef;
    ngOnInit() {        
        this.childList = this.service.getChildList();
       this.subsList.push(this.service.$minWin.subscribe(next=>{
            this.minList.push(next);
        }));
        
    }

    ngOnDestroy() {
        this.service.destroyAll();
        this.subsList.forEach(_=>{
            if(!_.unsubscribe){
                _.unsubscribe();
            }
        });
    }
    ngAfterViewInit() {
        this.service.pWin=this.container.nativeElement;
        //console.log('window height:',window.innerHeight);
    }
    private expandWindow(item){
        this.minList.splice(this.minList.indexOf(item), 1);
        this.service.expandWindow(item.id, false);
    }
    private closeWindow(item){
        this.minList.splice(this.minList.indexOf(item), 1);
        this.service.closeWindow(item.id);
    }
    private showChild(id: string) {
        this.createPlaceHolder(id);
        this.loadComponent(id);
    }
    private createPlaceHolder(id: string) {
        if (typeof this.childList[id] === 'undefined') {
            this.placeHolder = this.renderer.createElement(this.container.nativeElement, 'div');           
            this.childList[id] = {};
        }
    }
    private loadComponent(id: string) {
        let comOptions = this.childList[id];
        if (typeof comOptions.child === 'undefined') {
            this.dcl.loadAsRoot(ChildWindow, this.placeHolder, this.injector)
                .then((compRef: ComponentRef<ChildWindow>) => {
                    comOptions.child = compRef;
                    compRef.instance.windowId = id;
                    this.service.setProperty(id);
                    (<any>this.appRef)._loadComponent(compRef);
                    compRef.onDestroy(() => {
                        (<any>this.appRef)._unloadComponent(compRef);
                    });
                    return compRef;
                })
        }
    }


}