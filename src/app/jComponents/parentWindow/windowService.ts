import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {WindowConfig} from './windowConfig';
@Injectable()
export class WindowService {
    private childList: any = {};
    pWin: HTMLElement;
    $minWin=new Subject();
    constructor() { }
    closeWindow(windowId) {
        if (this.childList[windowId] && this.childList[windowId].child) {
            this.childList[windowId].child.destroy();
            this.childList[windowId] = undefined;            
        }
    }
    getChildList() {
        return this.childList;
    }
    minWindow(windowId){
        this.$minWin.next({id:windowId, title:WindowConfig.LIST[windowId].title});
    }
    syncZIndex(windowId: string) {
        for (let win in this.childList) {
            if (typeof this.childList[win] !== 'undefined') {
                if (windowId === win) {
                    this.childList[win].child.instance.setStyle('z-index', '9');
                } else {
                    this.childList[win].child.instance.setStyle('z-index', '8');
                }
            }
        }
    }
    getComponent(windowId: string) {
        return WindowConfig.LIST[windowId].loader();
    }
    setProperty(windowId: string) {
        let wConfig = WindowConfig.LIST[windowId], window = this.childList[windowId].child.instance;
        window.top = Math.floor((this.pWin.offsetHeight - wConfig.height) / 2);
        window.left = Math.floor((this.pWin.offsetWidth - wConfig.width) / 2);
        window.width = wConfig.width;
        window.height = wConfig.height;
        window.title = wConfig.title;

    }
    expand(windowId, isExpand: boolean = true) {
        let window = this.childList[windowId].child.instance;
        if (isExpand) {
            window.adjustWidth(this.pWin.offsetWidth );
            window.adjustHeight(this.pWin.offsetHeight );
            window.setStyle('top', '0px');
            window.setStyle('left', '0px');
        } else {
            window.adjustWidth(window.width);
            window.adjustHeight(window.height);
            window.setStyle('top', window.top+'px');
            window.setStyle('left', window.left+'px');  
            window.setStyle('display', 'block');          
        }
    }
    destroyAll() {
        for (let win in this.childList) {
            if (typeof this.childList[win] !== 'undefined') {
                if (this.childList[win].child) {
                    this.childList[win].child.destroy();
                }
            }
        }
    }
}
