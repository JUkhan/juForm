import {Component, OnInit, ElementRef, Input,DynamicComponentLoader,
     Output, EventEmitter, OnDestroy, ComponentRef, ViewEncapsulation, Injector} from '@angular/core';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from '@angular/common';
import {juSelect, Datetimepicker} from '../juForm';
import{FilterService} from './filterSvc';
import {AppService} from '../../services/';
import {Subject} from 'rxjs/Subject';
@Component({
    selector:'.filter-mobile, .filter-web',
    directives:[FORM_DIRECTIVES], encapsulation:ViewEncapsulation.None,
    template:'<div><ng-content></ng-content><div id="child" ></div></div>',
    styles:[``]
})
export class FilterComponent implements OnInit, OnDestroy{
    
    @Input('options') options:any={};
    @Output('onLoad') onLoad=new EventEmitter();
    modelChange=new Subject();
    
    dynamicComponent:ComponentRef<any>;
    constructor( private _elementRef:ElementRef,
     private loader:DynamicComponentLoader,
      private filterSvc:FilterService,
       private appService:AppService, private injector:Injector){
       
    }
    ngOnInit(){ 
        if(!this.options.layout){
            this.options.layout=this.appService.mobileCheck()?'stack':'flow';
        }               
        this.options.labelPosition=this.options.labelPosition||'top';
        this.options.labelSize= this.options.labelSize||3;          
        this.filterSvc.filterObj=this;
        this.loadComponent();        
        this.options.api=this;
        this.options.api=this;       
    }
    loadComponent(){             
        this.loader.loadAsRoot( getDynamicComponent(this._get_dynamic_config()), '#child', this.injector)
        .then((com:any)=>{
                this.dynamicComponent=com;
                com.instance.setConfig(this.options);                
              let tid=setTimeout(()=>{
                  this.onLoad.emit(this);
                  this.filterSvc.filterConstructed();
                   clearTimeout(tid);
                 },0);                              
            });
       
    }
   
    render(options:any){        
        this.options=options;
        this.options.api=this;        
       if(this.dynamicComponent){
         this.dynamicComponent.destroy();
         this.dynamicComponent=null;
       }
       this.loadComponent();
       return this;
    }
    _refreshAllSelect(){
         if(this.options.inputs){            
            for(var prop in this.options.inputs){
                if(this.options.inputs[prop].type==='juSelect'){
                    if(this.options.inputs[prop].api)
                        this.options.inputs[prop].api.checkAll(false);;
                }
            }
         }
         else if(this.options.tabs){ 
            for(var tab_prop in this.options.tabs)            
            for(var prop in this.options.tabs[tab_prop]){
                if(this.options.tabs[tab_prop][prop].type==='juSelect'){
                    if(this.options.tabs[tab_prop][prop].api)
                        this.options.tabs[tab_prop][prop].api.checkAll(false);
                }
            }
         }
    }
    ngOnDestroy(){        
        
    }
   
    setModel(model:any){        
       this.dynamicComponent.instance.setModel(model);       
    }
    getModel(){        
      return this.dynamicComponent.instance.getModel();        
    }
    
    setData(key:string, data:any[]){        
        
        for (var index = 0; index < this.options.rows.length; index++) {
            var element = this.options.rows[index];                      
            for(var prop in element){
                if(element[prop].type==='juSelect' && prop===key){
                    if(element[prop].api){
                        element[prop].api.dataSrc=data;
                        return this;
                    }
                }
                else if(element[prop].type==='juSelect' && prop===key){
                        element[prop].data=data;
                        return this;
                }
            }
        }
         
         return this;
    }
    getSelectInstance(key:string){          
        for (var index = 0; index < this.options.rows.length; index++) {
            var element = this.options.rows[index];                      
            for(var prop in element){
                if(prop===key){
                    return element[prop].api;
                }
            }
         }
         
    }
   
    private isVertical:boolean=false;
   
    private _get_dynamic_config(){
        var template:any[]=[], obj:any={};        
        template.push('<form class="form-horizontal" [ngFormModel]="form" #f="ngForm" >');
        if(this.options.layout){
            this.isVertical=this.options.layout==='stack'
        }
        if(this.options.rows){
            this._setInputs(obj, template,this.options.rows);
        } 
        if(this.options.buttons){       
            this._setButtons(obj, template);
        }
        template.push('</form>');
        
        return {tpl:template.join(''), groupConfig:obj};
    }
   
    private _setInputs(obj:any, template:any[], rows:any[]){
         //template.push(`<div class="tab-content ${this.tabName.replace(/\s+/g,'')}" >`);
        for (var index = 0; index < rows.length; index++) {
            var config = rows[index];
            if(!this.isVertical) {
                template.push('<div  class="form-group" > ');
            }       
            for(let prop in config){                            
                obj[prop]=this._getGroupConfig(config[prop]);
                config[prop].hideMsg=true;                               
                
                 config[prop].change= (val:any)=> {
                        this.filterSvc.notify(prop, val);
                        this.modelChange.next(Object.assign({}, val,{key:prop}));
                 };
                
                switch(config[prop].type){
                    //case 'select':                        
                        //template.push(this._getSelectTemplate(index,prop, config[prop]));
                    //break;
                    case 'juSelect':                      
                        config[prop].isFilter=('autoSelect' in this.options)?this.options.autoSelect:true;                                              
                        template.push(this._getjuSelectTemplate(index, prop, config[prop]));
                    break;
                    case 'datepicker':
                        config[prop].config=config[prop].config||{}                    
                        template.push(this._getDateTemplate(index, prop, config[prop]))
                    break;
                    case 'timepicker':
                        config[prop].config=config[prop].config||{}                    
                        template.push(this._getTimeTemplate(index,prop, config[prop]))
                    break;
                    case 'colorpicker':
                        config[prop].config=config[prop].config||{}                    
                        template.push(this._getColorTemplate(index,prop, config[prop]))
                    break;
                    default:
                        template.push(this._getInputTemplate(index,prop, config[prop]));
                    break;
                }
                this.filterSvc.create(prop);
            }
            if(!this.isVertical) {
                template.push('</div>');
            }  
        }
        
    }
    
    private _setButtons(obj:any, template:any[]){
        if(this.options.buttons){    
            template.push('<div class="modal-footer">');        
            for(var prop in this.options.buttons){ 
                 template.push(`<button type="button" class="${this.options.buttons[prop]||'btn btn-default'}" (click)="config.buttons['${prop}'].click($event)" >${prop}</button>`);
            }
            template.push('</div>');
        }
    }
    private _getGroupConfig(input:any){          
        var group:any[]=[''];
        if(input.validators && input.validators.length>=1){
            group.push(Validators.compose(input.validators));
        }
       
        return group;
    }
    private _getDateTemplate(rowIndex:number,fieldName:string, input:any){ 
         var config:string=`config.rows['${rowIndex}']['${fieldName}']`;
            
        if(this.isVertical){
            return `
            <div  class="form-group" style="padding:0 20px">
                    <label>${input.label||fieldName}</label>
                    <div class="input-group date" [pickers]="${config}.config" picker-name="${input.type}">
                        <input type="text" (click)="fieldClick('${fieldName}')" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" placeholder="Enter ${input.label||fieldName}">
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-calendar"></span>
                        </span>
                    </div>                    
                    <div *ngIf="f.form.controls.${fieldName}.touched && !f.form.controls.${fieldName}.valid && !${config}.hideMsg" class="alert alert-danger">
                            ${input.message||(input.label||fieldName)+' is required'}
                    </div>
                   
           </div>`;
        }
        return `
            <div class="form-group">
                    <label class="col-sm-3 control-label">${input.label||fieldName}</label>
                    <div class="col-sm-9">
                        <div class="input-group datetimepicker">
                        <input [pickers]="${config}.config" picker-name="${input.type}" type="text" (click)="fieldClick('${fieldName}')" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" placeholder="Enter ${input.label||fieldName}">
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-calendar"></span>
                        </span>
                    </div>                        
                        <div *ngIf="f.form.controls.${fieldName}.touched && !f.form.controls.${fieldName}.valid && !${config}.hideMsg" class="alert alert-danger">
                            ${input.message||(input.label||fieldName)+' is required'}
                        </div>
                    </div>
           </div>`;
    }
    private _getTimeTemplate(rowIndex:number,fieldName:string, input:any){ 
        var config:string=`config.rows['${rowIndex}']['${fieldName}']`;
            
        if(this.isVertical){
            return `
            <div  class="form-group" style="padding:0 20px">
                    <label>${input.label||fieldName}</label>
                    <div class="input-group bootstrap-timepicker timepicker">
                        <input [pickers]="${config}.config" picker-name="${input.type}" type="text" (click)="fieldClick('${fieldName}')" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control input-small" placeholder="Enter ${input.label||fieldName}">
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-time"></span>
                        </span>
                    </div>                    
                    <div *ngIf="f.form.controls.${fieldName}.touched && !f.form.controls.${fieldName}.valid && !${config}.hideMsg" class="alert alert-danger">
                            ${input.message||(input.label||fieldName)+' is required'}
                    </div>
                   
           </div>`;
        }
        return `
            <div class="form-group">
                    <label class="col-sm-3 control-label">${input.label||fieldName}</label>
                    <div class="col-sm-9">
                        <div class="input-group bootstrap-timepicker timepicker">
                        <input [pickers]="${config}.config" picker-name="${input.type}" type="text" (click)="fieldClick('${fieldName}')" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control input-small" placeholder="Enter ${input.label||fieldName}">
                        <span class="input-group-addon">
                            <span class="glyphicon glyphicon-time"></span>
                        </span>
                    </div>                        
                        <div *ngIf="f.form.controls.${fieldName}.touched && !f.form.controls.${fieldName}.valid && !${config}.hideMsg" class="alert alert-danger">
                            ${input.message||(input.label||fieldName)+' is required'}
                        </div>
                    </div>
           </div>`;
    }
    private _getColorTemplate(rowIndex:number,fieldName:string, input:any){ 
        var config:string=`config.rows['${rowIndex}']['${fieldName}']`;
            
        if(this.isVertical){
            return `
            <div  class="form-group" style="padding:0 20px">
                    <label>${input.label||fieldName}</label>
                    <div class="input-group colorpicker-component" [pickers]="${config}.config" picker-name="${input.type}">
                        <input type="text" (click)="fieldClick('${fieldName}')" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" placeholder="Enter ${input.label||fieldName}">
                        <span class="input-group-addon">
                            <span style="display:inline-block;width:14px">&nbsp;</span>
                        </span>
                    </div>                    
                    <div *ngIf="f.form.controls.${fieldName}.touched && !f.form.controls.${fieldName}.valid && !${config}.hideMsg" class="alert alert-danger">
                            ${input.message||(input.label||fieldName)+' is required'}
                    </div>
                   
           </div>`;
        }
        return `
            <div class="form-group">
                    <label class="col-sm-3 control-label">${input.label||fieldName}</label>
                    <div class="col-sm-9">
                        <div class="input-group colorpicker-component" [pickers]="${config}.config" picker-name="${input.type}">
                        <input type="text" (click)="fieldClick('${fieldName}')" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" placeholder="Enter ${input.label||fieldName}">
                        <span class="input-group-addon">
                            <span style="display:inline-block;width:14px">&nbsp;</span>
                        </span>
                    </div>                        
                        <div *ngIf="f.form.controls.${fieldName}.touched && !f.form.controls.${fieldName}.valid && !${config}.hideMsg" class="alert alert-danger">
                            ${input.message||(input.label||fieldName)+' is required'}
                        </div>
                    </div>
           </div>`;
    }
    private _getInputTemplate(rowIndex:number,fieldName:string, input:any){ 
        var config:string=`config.rows['${rowIndex}']['${fieldName}']`;
            
        if(this.isVertical){
            return `
            <div  class="form-group" >            
                    <label>${input.label||fieldName}</label>                    
                    <input (keyup)="${config}.change(model.${fieldName})" type="${input.type}" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" placeholder="Enter ${input.label||fieldName}">                    
           </div>`;
        }
        return `
            <div class="col-md-${input.size}">
                    <label class="control-label">${input.label||fieldName}</label>                    
                    <input (keyup)="${config}.change(model.${fieldName})" type="${input.type}" [disabled]="${config}.disabled" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" placeholder="Enter ${input.label||fieldName}">                    
           </div>`;
    }
    private _getSelectTemplate(rowIndex:number,fieldName:string, input:any){
        var config:string=`config.rows['${rowIndex}']['${fieldName}']`;
        if(this.isVertical){
            return `
                <div class="form-group">
                        <label>${input.label||fieldName}</label>                        
                        <select (change)="${config}.change(model)" ngControl="${fieldName}" [disabled]="${config}.disabled" [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" >
                            <option value="">{{${config}.emptyOptionText||'Select option'}}</option>
                            <option *ngFor="#v of ${config}.data" [value]="v.value">{{v.name}}</option>
                        </select>
                    </div>
        `;
        }
        return `
                <div class="col-md-${input.size}">
                    <label class="control-label">${input.label||fieldName}</label> 
                    <select (change)="${config}.change(model)" ngControl="${fieldName}" [disabled]="${config}.disabled" [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm" class="form-control" >
                        <option value="">{{${config}.emptyOptionText||'Select option'}}</option>
                        <option *ngFor="#v of ${config}.data" [value]="v.value">{{v.name}}</option>
                    </select>
               </div>
        `;
    }
    private _getjuSelectTemplate(rowIndex:number,fieldName:string, input:any){
         var config:string=`config.rows['${rowIndex}']['${fieldName}']`;
         var element=` <juSelect                                 
                            [config]="${config}"
                            #${fieldName}select 
                            (option-change)="${config}.change($event)"                            
                            [disabled]="${config}.disabled"
                            [hide-search]="${input.search?'false':'true'}"
                            method="${input.method||'getValues'}"
                            [model]="model" 
                            property-name="${fieldName}" 
                            view-mode="${input.viewMode||'select'}"
                            [data-src]="${config}.data">
                        </juSelect>
                        <input type="hidden" ngControl="${fieldName}"  [(ngModel)]="model.${fieldName}" #${fieldName}="ngForm">
                        `;
        var labelSize=input.labelSize||this.options.labelSize||3;                
        if(this.isVertical){
             return this.options.labelPosition==='top'? `
                <div class="form-group">
                        <label>${input.label||fieldName}</label>                        
                        ${element}                        
                    </div>
        `:`
            <div class="form-group">
                        <label class="col-md-${labelSize} control-label">${input.label||fieldName}</label>                        
                        <div class="col-md-${12-labelSize}"> ${element}  </div>                      
           </div>
        `;
        }
        return this.options.labelPosition==='top'?`
                <div class="col-md-${input.size}">
                        <label class="control-label">${input.label||fieldName}</label>                                               
                        ${element}
              </div>
        `:`
            <div class="col-md-${input.size}">
                <div class="form-group">
                        <label class="col-md-${labelSize} control-label">${input.label||fieldName}</label>                                               
                        <div class="col-md-${12-labelSize}"> ${element}  </div>
                 </div>       
              </div>
        `;
    }
    
    
}
function getDynamicComponent(obj:any){ 
    @Component({
        selector:'dynamicFilterComponent', template:obj.tpl, directives:[FORM_DIRECTIVES, juSelect, Datetimepicker]
    })
    class DynamicComponent{
        form:ControlGroup; model:any={};config:any={}; 
        constructor(fb:FormBuilder, private imsForm:FilterComponent, private el:ElementRef){            
            this.form=fb.group(obj.groupConfig);
        }
        ngOnInit(){           
          
        }
        setModel(model:any){
            this.model=model;
        }
        getModel(){
            return this.model;
        }
        setConfig(data:any){                          
            this.config=data;            
            if(data.model){
                this.model=data.model;
            }
        } 
    }
    return DynamicComponent;
}