import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import {isEqual, clone} from 'lodash';
@Injectable()
export class FilterService {
    private _observableMap=new Map<any, any>(); 
    filterObj:any=null;
    Oldmodel:any={};
    constructor() { 
        this.create('FILTER_MODEL');
        this.create('FILTER_INIT');       
    }
    filterConstructed(){
        var name='FILTER_INIT';
        if(this._observableMap.has(name)){
            if(this._observableMap.get(name).observer){
                this._observableMap.get(name).observer.next(this.filterObj.getModel());
            }
        }
    }
    notify(name:string, value:any){
        window.sessionStorage.setItem("jwtFilter", JSON.stringify(this.filterObj.getModel()));
        if(this._observableMap.has(name)){
            if(this._observableMap.get(name).observer){
                this._observableMap.get(name).observer.next(value);
            }
        }
        name='FILTER_MODEL';
        if(this._observableMap.has(name)){
            if(this._observableMap.get(name).observer){
                let newModel=this.filterObj.getModel();               
                if(!isEqual(this.Oldmodel, newModel)){
                    this._observableMap.get(name).observer.next(newModel);
                    this.Oldmodel=clone(newModel);
                }
                
            }
        }
        
    } 
    create(name:string){
        if(this._observableMap.has(name)){
            return;
        }
        let obj:any={observable:null, observer:null};
        obj.observable=Observable.create(observer=>{
           obj.observer=observer; 
        }).share();  
        this._observableMap.set(name, obj);
    }
    get(name:string){        
        return this._observableMap.has(name)?this._observableMap.get(name):null;
    }
    subscribe(name:string, callback:any){ 
             if(!this._observableMap.has(name)){
                 this.create(name);
             }       
           return this._observableMap.has(name) ? this._observableMap.get(name).observable.subscribe(callback):null;      
    } 
    initFilter() {        
        if (window.sessionStorage["jwtFilter"]) {
            var ob = JSON.parse(window.sessionStorage.getItem("jwtFilter"))||{};
            this.filterObj.setModel(ob);
        }
       
    }
    getModel(){return this.filterObj.getModel();}
    setModel(model:any){return this.filterObj.setModel(model);}
    getOptions(){return this.filterObj.options;}
    render(options:any){
        this.filterObj.render(options);        
    }
     setData(key:string, data:any[]){         
          this.filterObj.setData(key, data);  
     }
}
