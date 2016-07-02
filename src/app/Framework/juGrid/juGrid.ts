import {Component, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef,Injector,
    Input, Output, EventEmitter, ComponentRef, ElementRef, DynamicComponentLoader, ViewEncapsulation} from '@angular/core';
import {juForm, juSelect} from '../juForm';
import {juPagerComponent} from '../juPager';

@Component({
    selector: '.juGrid, [juGrid]', encapsulation: ViewEncapsulation.None,
    template: `<div *ngIf="options.message" [class]="options.messageCss">{{options.message}}</div>
    <div *ngIf="options.search" class="row">
        <div class="col-md-3 pull-right">             
                <div class="input-group stylish-input-group">
                    <input type="text" class="form-control" (keyup)="search($event.target.value)" placeholder="Search" >
                    <span class="input-group-addon">                        
                            <span class="fa fa-search"></span>                         
                    </span>
                </div>            
        </div>
	</div>
    <div id="juGridChild" ></div>
    <juForm *ngIf="options.crud" viewMode="popup" title="Sample Form" (onLoad)="onFormLoad($event)" [options]="options.formDefs">
             
    </juForm>
    `,
    directives: [juForm],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class juGrid implements OnInit, OnChanges {
    @Input() options: any = {};
    private _oldItem: any = null;
    private _updtedItem: any = null;
    private _searchInActive: boolean = false;
    @Input() data;
    @Output() onLoad = new EventEmitter();

    dynamicComponent: ComponentRef<any>;
    constructor(
        private _elementRef: ElementRef,
        private loader: DynamicComponentLoader,
        private cd: ChangeDetectorRef,
        private injector:Injector
    ) { }
    ngOnChanges(changes) {   
             
        if (changes.data && this.dynamicComponent) {
            this.dynamicComponent.instance.setData(this.data);
        }
    }
    addItem(item: any) {       
        if (this.dynamicComponent) {
            if (this._searchInActive) {
                this.data.unshift(item);
            }
            this.dynamicComponent.instance.addItem(item);
        }
    }
    showMessage(message: string, messageCss: string = 'alert alert-info') {
        this._updateRecord();
        this.options.message = message;
        this.options.messageCss = messageCss;
        this.cd.markForCheck();
        if (this.dynamicComponent && this.dynamicComponent.instance) {
            this.dynamicComponent.instance.showMessage(message, messageCss);
        }
        let tid = setTimeout(() => {
            this.options.message = '';
            this.cd.markForCheck();
            if (this.dynamicComponent) {
                this.dynamicComponent.instance.showMessage('', messageCss);
            }
            clearTimeout(tid);
        }, 3000);
    }
    _updateRecord() {
        if (this._oldItem && this._updtedItem) {
            for (let prop in this._updtedItem) {
                this._oldItem[prop] = this._updtedItem[prop];
            }
        }
    }
    removeItem(item: any) {
        if (this.dynamicComponent) {
            if (this._searchInActive) {
                this.data.splice(this.data.indexOf(item), 1);
            }
            this.dynamicComponent.instance.removeItem(item);
        }
    }
    ngOnInit() {
        
       if(!this.options){
          return;
       }
        if (!('linkPages' in this.options)) {
            this.options.linkPages = 10;
        }
        if (!('pageSize' in this.options)) {
            this.options.pageSize = 10;
        }
        if (!('confirmMessage' in this.options)) {
            this.options.confirmMessage = 'Are you sure to remove this item?';
        }
        if (!('crud' in this.options)) {
            this.options.crud = true;
        }
        if (!('create' in this.options)) {
            this.options.create = true;
        }
        if (!('update' in this.options)) {
            this.options.update = true;
        }
        if (!('remove' in this.options)) {
            this.options.remove = true;
        }
        if (!('search' in this.options)) {
            this.options.search = true;
        }

        if (this.options.crud) {
            this.options.newItem = () => {
                this._oldItem = null;
                this._updtedItem = null;
                this.options.message = '';
                this.dynamicComponent.instance.formObj.isUpdate = false;
                this.dynamicComponent.instance.formObj.refresh();
                this.dynamicComponent.instance.formObj.showModal();
                if (this.options.insert_CB) {
                    this.options.insert_CB(this.dynamicComponent.instance.formObj);
                }
            };
            this.options.columnDefs.unshift({
                headerName: 'crud', width: 50, enable: this.options.create,
                action: [{
                    enable: this.options.update, title: 'Edit', icon: 'fa fa-pencil', click: (data) => {
                        this._oldItem = data;
                        this._updtedItem = Object.assign({}, data);
                        this.options.message = '';
                        this.dynamicComponent.instance.formObj.isUpdate = true;
                        this.dynamicComponent.instance.formObj.setModel(this._updtedItem);
                        this.dynamicComponent.instance.formObj.showModal();
                        if (this.options.update_CB) {
                            this.options.update_CB(this.dynamicComponent.instance.formObj, this._updtedItem);
                        }
                    }
                }, {
                        enable: this.options.remove, title: 'Remove', icon: 'fa fa-remove', click: (data) => {
                            if (confirm(this.options.confirmMessage)) {
                                this._oldItem = null;
                                this._updtedItem = null;
                                if (this.options.removeItem) {
                                    this.options.removeItem(data);
                                }
                            }
                        }
                    }]
            });
        }
        this.loadComponent();
        this.options.api = { grid: this, form: null };
    }
    private loadComponent() {

        this.loader.loadAsRoot(getDynamicComponent(this.getDynamicConfig()), '#juGridChild', this.injector)
            .then(com => {
                this.dynamicComponent = com;
                com.instance.config = this.options;
                if (this.options.data || this.data) {
                    this.dynamicComponent.instance.setData(this.data || this.options.data);
                }

            });

    }
    private getDynamicConfig() {
        var tpl: any[] = [];
        if (!this.options.classNames) {
            this.options.classNames = "table table-bordered table-striped";
        }
        if (this.options.columnDefs) {
            this.renderTable(tpl);
        } else {
            tpl.push('<div class="alert alert-info">There is no column defination</div>')
        }
        if (this.options.crud) {
            //this.renderForm(tpl);
        }
        return { tpl: tpl.join('') };
    }
    private renderTable(tpl: any[]) {

        tpl.push(`<table class="${this.options.classNames}">`);
        tpl.push('<thead>');
        tpl.push('<tr>');
        this.options.columnDefs.forEach((item, index) => {
            if (item.headerName === 'crud' && item.enable) {
                tpl.push(`<th style="width:${item.width}px"><a href="javascript:;" title="New item" (click)="config.newItem()"><b class="fa fa-plus-circle"></b> </a></th>`);
            } else {
                if (item.width) {
                    tpl.push(`<th style="width:${item.width}px">${item.headerName}</th>`);
                } else {
                    tpl.push(`<th>${item.headerName}</th>`);
                }
            }
        });
        tpl.push('</tr>');
        tpl.push('</thead>');
        tpl.push('<tbody>');
        tpl.push('<tr *ngFor="#row of viewList;#i = index; #last = last">');
        this.options.columnDefs.forEach((item, index) => {
            tpl.push('<td');
            if (item.action) {
                tpl.push('>');
                item.action.forEach((ac, aci) => {
                    if (item.headerName === 'crud') {
                        if (ac.enable == true) {
                            tpl.push(`<a href="javascript:;" title="${ac.title}" (click)="config.columnDefs[${index}].action[${aci}].click(row)"><b class="${ac.icon}"></b></a> `);
                        }
                    }
                    else {
                        tpl.push(`<a href="javascript:;" title="${ac.title}" (click)="config.columnDefs[${index}].action[${aci}].click(row)"><b class="${ac.icon}"></b></a> `);
                    }

                });

            }
            else if (item.cellRenderer) {
                tpl.push(` [innerHTML]="config.columnDefs[${index}].cellRenderer(row,i,last)">`);
            }
            else if (item.field) {
                tpl.push(`>{{row.${item.field}}}`);
            } else {
                tpl.push(`>`);
            }
            tpl.push('</td>');
        });
        tpl.push('</tr>');
        tpl.push('</tbody>');

        tpl.push('</table>');
        tpl.push(`<div class="juPager" [linkPages]="config.linkPages" [pageSize]="config.pageSize" [data]="data" (onInit)="pagerInit($event)" (pageChange)="onPageChange($event)"></div>`);
    }
    private renderForm(tpl: any[]) {
        tpl.push(`<juForm viewMode="popup" title="Sample Form" (onLoad)="onFormLoad($event)" [options]="config.formDefs"></juForm>`);
    }
    search(val: any) {
        if (this.options.sspFn) {
            this.options.api.pager.search(val);
            return;
        }
        if (!val) {
            this._searchInActive = false;
            this.dynamicComponent.instance.data = this.data;
            return;
        }
        this._searchInActive = true;
        val = val.toLowerCase();
        let res: any[] = [];
        let len = this.options.columnDefs.length;
        this.data.forEach((item) => {
            for (var index = 0; index < len; index++) {
                let item2 = this.options.columnDefs[index];
                if (item2.field && item[item2.field] && item[item2.field].toString().toLowerCase().indexOf(val) != -1) {
                    res.push(item); break;
                }
            }
        });
        this.dynamicComponent.instance.data = res;
    }
    onFormLoad(form: juForm) {
        this.dynamicComponent.instance.formObj = form;
        this.options.api.form = form;
        if (this.options.onFormLoad) {
            this.options.onFormLoad(form);
        }
        this.onLoad.emit(this);
    }
}

function getDynamicComponent(obj: any) {
    @Component({
        selector: 'dynamic-grid-component',
        template: obj.tpl,
        directives: [juPagerComponent, juForm]
    })
    class DynamicComponent {
        data: any = [];
        config: any = {};
        formObj: juForm;
        viewList: any[] = [];
        private pager: juPagerComponent;
        constructor(private el: ElementRef) {

        }
        ngOnInit() {

        }
        pagerInit(pager: juPagerComponent) {
            this.pager = pager;
            this.config.api.pager = pager;
            this.pager.sspFn = this.config.sspFn;
            if (this.pager.sspFn) {
                this.pager.firePageChange();
            }
        }

        onFormLoad(form: juForm) {

            this.formObj = form;
            if (this.config.onFormLoad) {
                this.config.onFormLoad(form);
            }
        }
        setData(data) {

            this.data = data;
        }
        onPageChange(list) {
            this.viewList = list;
        }
        addItem(item) {
            this.data.unshift(item);
            this.pager.calculatePagelinkes();
        }
        updateItem(item) {

        }
        removeItem(item) {
            this.data.splice(this.data.indexOf(item), 1);
            this.pager.calculatePagelinkes();
        }
        showMessage(message: string, messageCss: string) {
            if (this.formObj) {
                this.formObj.showMessage(message, messageCss);
            }
        }
        
    }
    return DynamicComponent;
}