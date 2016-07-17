import {Component, OnInit, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef,
    OnDestroy, ViewContainerRef, Input, Output, EventEmitter,
    ComponentRef, ElementRef, DynamicComponentLoader, ViewEncapsulation} from '@angular/core';
import {juForm, juSelect} from '../juForm';
import {juPager} from '../juPager';
import {TextFilter} from './TextFilter';
import {NumberFilter} from './NumberFilter';
import {SetFilter} from './SetFilter';
import {Observable} from 'rxjs';

declare var jQuery: any;
@Component({
    selector: '.juGrid, [juGrid]',
    templateUrl: './juGrid.html',
    styleUrls: ['./juGrid.css'],
    directives: [juForm],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})

export class juGrid implements OnInit, OnChanges, OnDestroy {
    @Input() options: any = {};
    private _oldItem: any = null;
    private _updtedItem: any = null;
    private _searchInActive: boolean = false;
    @Input() data = [];
    @Output() onLoad = new EventEmitter();
    private appRef: any
    dynamicComponent: ComponentRef<any>;
    constructor(
        private _elementRef: ElementRef,
        private loader: DynamicComponentLoader,
        //private cd: ChangeDetectorRef,      
        private viewContainerRef: ViewContainerRef
    ) { }
    ngOnChanges(changes) {
        if (this.dynamicComponent) {
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
        //this.cd.markForCheck();
        if (this.dynamicComponent && this.dynamicComponent.instance) {
            this.dynamicComponent.instance.showMessage(message, messageCss);
        }
        async_call(() => {
            this.options.message = '';
            //this.cd.markForCheck();
            if (this.dynamicComponent) {
                this.dynamicComponent.instance.showMessage('', messageCss);
            }
        });
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

        if (!this.options) {
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
        if (!('quickSearch' in this.options)) {
            this.options.quickSearch = true;
        }
        if (!('trClass' in this.options)) {
            this.options.trClass = () => null;
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

        this.loader.loadNextToLocation(getComponent(this.getDynamicConfig()), this.viewContainerRef)
            .then(com => {
                this.dynamicComponent = com;
                com.instance.config = this.options;                
                if (this.options.data || this.data) {
                    this.dynamicComponent.instance.setData(this.data || this.options.data);
                }
                if (!this.options.crud) {
                    async_call(() => { this.onLoad.emit(this); });
                }
                return com;
            });

    }
    ngOnDestroy() {
        if (this.dynamicComponent) {
            this.dynamicComponent.destroy();
        }
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
        tpl.push(`<div class="filter-window">
        <div class="title" (click)="hideFilterWindow()"><span>Title</span><a href="javascript:;" title="Close filter window." ><b class="fa fa-remove"></b></a></div>
        <div class="filter-content"></div>
        </div>`)
        return { tpl: tpl.join('') };
    }
    private renderTable(tpl: any[]) {

        tpl.push(`<table class="${this.options.classNames}">`);
        tpl.push('<thead>');
        tpl.push(this.getHeader(this.options.columnDefs));
        tpl.push('</thead>');
        tpl.push('<tbody>');
        tpl.push('<tr [ngClass]="config.trClass(row, i, f, l)" *ngFor="let row of viewList;let i = index;let f=first;let l = last">');
        this.options.columnDefs.forEach((item, index) => {
            tpl.push('<td ');
            if (item.tdClass) {
                tpl.push(`[ngClass]="config.columnDefs[${index}].tdClass(row, i, f, l)"`);
            }
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
                tpl.push(` [innerHTML]="config.columnDefs[${index}].cellRenderer(row,i,f, l)">`);
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

    //calculate header
    private headerHtml: any[] = [];
    private getHeader(hederDef) {
        var colDef = [], rc = this.row_count(hederDef), i = 0;
        while (i < rc) {
            this.headerHtml[i] = [];
            i++;
        }
        hederDef.forEach(it => {
            this.traverseCell(it, rc, 0, colDef);
        });
        if (rc > 1) {
            this.options.columnDefs = colDef;
        }
        return this.headerHtml.map(_ => `<tr>${_.join('')}</tr>`).reduce((p, c) => p + c, '');
    }
    private _colIndex: number = 0;
    private traverseCell(cell, rs, headerRowFlag, colDef: any[]) {

        if (cell.children) {

            this.headerHtml[headerRowFlag].push('<th');
            if (cell.children.length > 1) {
                this.totalCS = 0;
                this.getColSpan(cell);
                this.headerHtml[headerRowFlag].push(` colspan="${this.totalCS}"`);
            }
            this.headerHtml[headerRowFlag].push(`>${cell.headerName}</th>`);
            headerRowFlag++
            let rc = rs, hf = headerRowFlag;
            for (var i = 0; i < cell.children.length; i++) {
                this.traverseCell(cell.children[i], --rs, headerRowFlag, colDef);
                rs = rc;
            }

        } else {
            colDef.push(cell);
            this.headerHtml[headerRowFlag].push('<th');
            if (rs > 1) {
                this.headerHtml[headerRowFlag].push(` valign="bottom" rowspan="${rs}"`);
            }
            if (cell.width) {
                this.headerHtml[headerRowFlag].push(` style="width:${cell.width}px"`);
            }
            if (cell.sort) {
                this.headerHtml[headerRowFlag].push(` (click)="sort(config.columnDefs[${this._colIndex}])"`);
            }
            if (cell.filter) {
                this.headerHtml[headerRowFlag].push(` (mouseenter)="config.columnDefs[${this._colIndex}].filterCss={'icon-hide':false,'icon-show':true}"`);
                this.headerHtml[headerRowFlag].push(` (mouseleave)="config.columnDefs[${this._colIndex}].filterCss={'icon-hide':!config.columnDefs[${this._colIndex}].isOpened,'icon-show':config.columnDefs[${this._colIndex}].isOpened}"`);
            }
            if (cell.headerName === 'crud' && cell.enable) {
                this.headerHtml[headerRowFlag].push(`><a href="javascript:;" title="New item" (click)="config.newItem()"><b class="fa fa-plus-circle"></b> </a></th>`);
            } else {
                this.headerHtml[headerRowFlag].push(' >');
                if (cell.sort) {
                    this.headerHtml[headerRowFlag].push(`<b [ngClass]="sortIcon(config.columnDefs[${this._colIndex}])" class="fa"></b>`);
                }
                if (cell.filter) {
                    this.headerHtml[headerRowFlag].push(` <b [ngClass]="filterIcon(config.columnDefs[${this._colIndex}])" class="fa fa-filter"></b>`);
                }
                this.headerHtml[headerRowFlag].push(` <span>${cell.headerName}</span>`);
                if (cell.filter) {
                    this.headerHtml[headerRowFlag].push(`<a href="javascript:;" title="Show filter window." [ngClass]="config.columnDefs[${this._colIndex}].filterCss" (click)="showFilter(config.columnDefs[${this._colIndex}], $event)" class="filter-bar icon-hide"><b class="fa fa-filter"></b></a>`);

                }
                this.headerHtml[headerRowFlag].push('</th>');
            }
            this._colIndex++;
        }
    }
    private row_count(hederDef) {
        var max = 0;
        for (var i = 0; i < hederDef.length; i++) {
            max = Math.max(max, this.cal_header_row(hederDef[i], 1));
        }
        return max;
    }
    private cal_header_row(cell, row_count) {
        var max = row_count;
        if (cell.children) {
            row_count++;
            for (var i = 0; i < cell.children.length; i++) {
                max = Math.max(max, this.cal_header_row(cell.children[i], row_count));
            }
        }
        return max;
    }
    private totalCS: number = 0;
    private getColSpan(cell: any) {
        if (cell.children) {
            cell.children.forEach(it => {
                this.totalCS++;
                this.getColSpanHelper(it);
            });
        }
    }
    private getColSpanHelper(cell: any) {
        if (cell.children) {
            this.totalCS--;
            cell.children.forEach(it => {
                this.totalCS++;
                this.getColSpan(it);
            });
        }
    }
    //end of calculte header
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

function getComponent(obj: any) {
    @Component({
        selector: 'div',
        template: obj.tpl,
        directives: [juPager, juForm],
        encapsulation: ViewEncapsulation.None
    })
    class DynamicComponent {
        data: any[] = [];
        config: any = {};
        formObj: juForm;
        viewList: any[] = [];
        _copyOfData: any;
        private pager: juPager;
        constructor(private el: ElementRef) {

        }
        ngOnInit() {

        }
        ngOnDestroy() {
            this.config.columnDefs
                .filter(it => it.filterApi)
                .forEach(it => { it.filterApi.destroy(); });
        }
        pagerInit(pager: juPager) {
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
            this._copyOfData=[...data];
            this.isDataUpdated=true;
        }
        onPageChange(list) {
            async_call(() => { this.viewList = list; });
        }
        addItem(item) {
            this.data.unshift(item);
            this.pager.calculatePagelinkes();
            this.isDataUpdated=true;
            this._copyOfData.unshift(item);
        }
        updateItem(item) {

        }
        removeItem(item) {
            this.data.splice(this.data.indexOf(item), 1);
            this.pager.calculatePagelinkes();
            this.isDataUpdated=true;
            this._copyOfData.splice(this.data.indexOf(item), 1);
        }
        showMessage(message: string, messageCss: string) {
            if (this.formObj) {
                this.formObj.showMessage(message, messageCss);
            }
        }
        sort(colDef: any) {
            colDef.reverse = !(typeof colDef.reverse === 'undefined' ? true : colDef.reverse);
            let reverse = !colDef.reverse ? 1 : -1, sortFn = typeof colDef.comparator === 'function' ?
                (a: any, b: any) => reverse * colDef.comparator(a, b) :
                function (a: any, b: any) { return a = a[colDef.field], b = b[colDef.field], reverse * (<any>(a > b) - <any>(b > a)); };
            this.data = [...this.data.sort(sortFn)];
            this.config.columnDefs.forEach(_ => {
                if (_ !== colDef) {
                    _.reverse = undefined;
                }
            });
        }
        sortIcon(colDef: any) {
            let hidden = typeof colDef.reverse === 'undefined';
            return { 'icon-hide': hidden, 'icon-show': !hidden, 'fa-caret-up': colDef.reverse === false, 'fa-caret-down': colDef.reverse === true };
        }
        filterIcon(colDef: any) {
            return { 'icon-hide': !(colDef.filterApi && colDef.filterApi.isFilterActive()), 'icon-show': colDef.filterApi && colDef.filterApi.isFilterActive() };
        }
        private filterWindow: any;
        private currentFilter: any;
        private isDataUpdated:boolean=false;
        showFilter(colDef: any, event: MouseEvent) { 
            event.preventDefault();
            event.stopPropagation();
            if (colDef === this.currentFilter && colDef.isOpened) {
                return;
            }
            this.hideFilterBar();
            this.currentFilter = colDef;
            colDef.isOpened = true;
            if (!this.filterWindow) {
                this.filterWindow = jQuery(this.el.nativeElement).find('.filter-window');
            }
            let parent = jQuery(event.target), parentOffset = parent.offset();
            this.buildFilter(colDef);
            this.filterWindow.find('.filter-content').html(colDef.filterApi.getGui());
            this.filterWindow.find('.title span').html(colDef.headerName);
            this.filterWindow.css({ top: parentOffset.top + parent.height() + 7, left: parentOffset.left }).show();
        }
        buildFilter(colDef: any) {
            try {
                if (!colDef.filterApi) {
                    switch (colDef.filter) {
                        case 'text':
                            colDef.filterApi = new TextFilter();
                            break;
                        case 'number':
                            colDef.filterApi = new NumberFilter();
                            break;
                        case 'set':
                            colDef.filterApi = new SetFilter();
                            break;
                        default:
                            colDef.filterApi = colDef.filter;
                            break;
                    }
                    colDef.gridApi=this;
                    colDef.params = colDef.params || {};
                    colDef.filterChangedCallback = this.filterChangedCallback.bind(this);
                    colDef.valueGetter = this.valueGetter;                    
                    colDef.filterApi.init(colDef);
                   
                }                
                if (colDef.filter === 'set' && !colDef.params.value &&  this.isDataUpdated) {
                     colDef.filterApi.data= this._copyOfData
                        .map(item => {
                            return colDef.params.valueGetter ? colDef.params.valueGetter(item) : item[colDef.field];
                        }).filter((value: any, index: number, self: any[]) => self.indexOf(value) === index);
                    colDef.filterApi.bindData(colDef.filterApi.data);
                    this.isDataUpdated=false;
                }
            } catch (e) {
                console.error(e.message);
            }

        }
        valueGetter(colDef: any) {
            try {
                if (colDef.params.valueGetter) {
                    return colDef.params.valueGetter(colDef.row);
                }
                return colDef.row[colDef.field];
            } catch (e) {
                console.error(e.message);
            }
        }
        filterChangedCallback() {
            let activeFilters = this.config.columnDefs.filter(it => it.filterApi && it.filterApi.isFilterActive());
            let temp: any[] = [];
            this._copyOfData.forEach(row => {
                let flag: any = true;
                activeFilters.forEach((col: any, index: number) => {
                    col.row = row;
                    flag &= col.filterApi.doesFilterPass(col);
                });
                if (flag) {
                    temp.push(row);
                }
            });
            this.data = temp;
        }
        hideFilterWindow() {
            this.filterWindow.hide();
            this.hideFilterBar();
        }
        hideFilterBar() {
            if (this.currentFilter) {
                this.currentFilter.isOpened = false;
                this.currentFilter.filterCss = { 'icon-hide': true, 'icon-show': false };
            }
        }
    }
    return DynamicComponent;
}
function async_call(fx: Function, time = 0) {
    let tid = setTimeout(() => {
        fx();
        clearTimeout(tid);
    }, time);
}