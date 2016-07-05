import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
@Injectable()
export class uiService {
    public documentClick: Observable<any>;
    constructor() {
        this.setEventListeners();
     }
    setEventListeners() {
        this.documentClick = Observable.fromEvent(document, 'mousedown').share();
    }
}