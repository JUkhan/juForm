
import {Component, OnChanges, ElementRef, forwardRef, OnInit, Inject, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectionStrategy} from "@angular/core";
import {Control, ControlGroup, FormBuilder, FORM_DIRECTIVES} from "@angular/common";

//import {AnimationBuilder, CssAnimationBuilder} from 'angular2/animate';
import {AppService} from '../../services';
declare var jQuery: any;

@Component({
    selector: '[juOption]', directives: [FORM_DIRECTIVES],
    template: `
    <div class="ju-option" [class.selected]="isSelected">
        <div class="header" *ngIf="(parent.viewMode==='select')"><span class="title" [innerHtml]="data.name"></span><span class="sub-title" *ngIf="data.subtitle" [innerHtml]="data.subtitle"></span></div>
        <div class="header" *ngIf="(parent.viewMode==='radio')"><input type="radio" name="xp0000" [checked]="isSelected"><span class="title" style="padding-left:5px" [innerHtml]="data.name"></span><span class="sub-title" *ngIf="data.subtitle" [innerHtml]="data.subtitle"></span></div>
        <div class="header" *ngIf="(parent.viewMode==='checkbox')"><input type="checkbox" [checked]="isSelected"><span class="title" style="padding-left:5px" [innerHtml]="data.name"></span><span class="sub-title" *ngIf="data.subtitle" [innerHtml]="data.subtitle"></span></div>
        <div *ngIf="data.description" class="description" [innerHtml]="data.description"></div>
    </div>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
class juOption {
    @Input() data: any;

    private _isSelected: boolean = false;
    parent: juSelect;
    constructor( @Inject(forwardRef(() => juSelect)) parent: juSelect) {
        parent.addOption(this);
        this.parent = parent;
    }
    ngOnDestroy() {
        this.parent.removeOption(this);
    }

    set isSelected(value) {
        this._isSelected = value;
        this.data.selected = value;
    }
    get isSelected() {
        return (this.data && this.data.selected) || this._isSelected;
    }

}

@Component({
    selector: 'juSelect', directives: [juOption],
    template: `
        <div style="position:relative">
            <div class="ju-select form-control" (click)="toggleOPtions($event)"><span style="display:block;position:relative;top:3px">{{selectedText}}</span><b style="right:5px;position:absolute;top:10px;color:#555;font-size:9px">&#9660;</b></div>
            <div class="options" [class.empty-options]="!searchData || searchData.length==0" >
                <div class="action" *ngIf="!checkCssClass()">
                    <form >
                       <label [hidden]="!(viewMode==='checkbox')"> <input #chk [checked]="isAllSelected" (click)="checkAll(chk.checked)" type="checkbox"  title="check all"> Select All</label>
                        <input *ngIf="!hideSearch"  type="text" [ngFormControl]="searchControl" placeholder="search item">
                        <span *ngIf="viewMode==='select'" (click)="checkAll(false)" title="Unselect the item" class="unselect">&#10006;</span>
                    </form>
                </div>
                <div class="items">
                    <div class="option-host" (click)="selectOption(option)" #option juOption *ngFor="let item of searchData" [data]="item">
                    </div>
                </div>
            </div>
        </div>   
             `,
    styles: [`
            .option-host{border-bottom:1px solid #e5e5e5;}
            .option-host:last-child{border-bottom:0px solid transparent;}
            .ju-option{padding:.4em;cursor:pointer;color: #555; transition: 0.5s; }            
            .ju-option:hover,ju-option:focus{color: #fff;text-decoration: none;background-color: #387ef5;}  
            .ju-option .header{position:relative;}
            .ju-option .title{font-weight:normal;}
            .ju-option .sub-title{position:absolute; right:3px;}  
            .ju-option .description{font-size:11px;}         
            .selected, .selected:hover{background-color:#23527c;color: #fff; }           
            .options{z-index:999;background-color:#fff;border:solid 1px #23527c;width:100%;position:absolute;margin-top:1px;}
            .options .items{max-height:250px;overflow-y:auto;}
            .options .action{padding:.4em;border-bottom:solid 1px #e3e3e3;}
            .options .search-hide{padding:0;border-bottom:solid 1px transparent;}
            .options .action input[type="text"]{border:solid 1px #e3e3e3;padding-left:3px;width:70%;}
            .options .action label{margin-right:3px;cursor:pointer;}
            .ju-select{cursor:pointer;background-color:#fff;border:solid 1px #ddd; padding:2px 5px;height:34px;position:relative}
            .ju-select b{position:absolute;right:2px;top:5px}
            .show{display:block;}
            .hide{display:none;}
            .empty-options{min-height:120px; border-bottom:solid 1px #555;}
            .unselect{right:5px;position:absolute;top:6px;cursor:pointer;color:black;}
            .unselect:hover{color:red;}
        `],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class juSelect implements OnInit, OnChanges {
    @Input('view-mode') viewMode: string = 'select';
    @Input() api: any = {};
    @Input() method: any;
    @Input() model: any;
    @Input('property-name') propertyName: any;
    @Input('hide-search') hideSearch: boolean = false;
    @Input() disabled: boolean = false;
    @Input() config: any = {};
    @Input('myForm') myForm: any;


    @Output('option-change') onChange = new EventEmitter();
    options: juOption[] = [];
    searchForm: any;
    searchControl = new Control('');
    searchData: any;
    visible: boolean = false;
    selectedText: string;
    isAllSelected: boolean = false;
    _dataSrc: any;
    optionsDom: any;
    domClickSubscription: any;
    //[style.display]="visible?'block':'none'" [hidden]="!visible"   
    constructor(fb: FormBuilder, private el: ElementRef, private appService: AppService) {
        this.searchControl.valueChanges.subscribe(this.search.bind(this));
    }
    ngOnChanges(changes) {

    }
    _value: any;
    @Input()
    set value(val: any) {
        this._value = val;

        if (val) {
            if (Array.isArray(val)) {
                this.selectItems(val.join('#$#'));
            } else {
                this.viewMode === 'checkbox' ? this.selectItems(val) : this.selectItem(val);
            }
        }
    }
    get value() {
        return this._value;
    }
    @Input('data-src')
    set dataSrc(val: Array<any>) {
        if (!val) { return; }
        let temp = val.map(item => Object.assign({}, item));
        this.searchData = temp;
        this._dataSrc = temp;

        let _val = this._getValueByPropertyName();
        if (this.config.isFilter) {
            if (_val) {
                let tid = setTimeout(() => { this.value = _val; clearTimeout(tid); }, 0);
            } else if (val && val.length > 0) {
                this._setValueByPropertyName(val[0].value);
                let tid = setTimeout(() => { this.value = _val; clearTimeout(tid); }, 0);
            }
        } else {
            if (_val) {
                let tid = setTimeout(() => { this.value = _val; clearTimeout(tid); }, 0);
            }
        }
    }
    get dataSrc() {
        return this._dataSrc;
    }
    _getValueByPropertyName() {
        let props: Array<string> = this.propertyName.split('.');
        if (props.length > 1) {
            let obj = this.model;
            props.forEach(prop => obj = obj[prop]);
            return obj;
        }

        return this.model[this.propertyName];
    }
    _setValueByPropertyName(val: any) {
        let props: Array<string> = this.propertyName.split('.');
        if (props.length > 1) {
            let obj = this.model;
            let len = props.length - 1;
            for (var index = 0; index < len; index++) {
                obj = obj[props[index]];
            }
            obj[props[index]] = val;
        }
        else { this.model[this.propertyName] = val; }
    }
    checkCssClass() {
        return this.viewMode === 'checkbox' ? false : this.hideSearch;
    }
    ngOnInit() {
        //this.animateOptions(true);        
        this.config.api = this;
        this.viewMode = this.viewMode.toLocaleLowerCase();
        if (this.viewMode === 'select' || this.viewMode === 'radio') {
            this.selectedText = 'Select option';
        }
        else {
            this.selectedText = 'Select options';
        }
        this.api.api = this;
        this.domClickSubscription = this.appService.documentClick.subscribe((event: any) => {
            var target = event.target;
            if (jQuery(target).parents('.ju-select').length) {
                this.eventState.visible = this.visible;
                this.eventState.isHeader = true;
            } else { this.eventState.isHeader = false; }
            if (this.visible && !(jQuery(target).parents('.options').length)) {
                this.visible = false; this.focusToValidate = true;
            }
            this.animate();
        });

        this.optionsDom = jQuery(this.el.nativeElement).find('.options');
        this.optionsDom.hide();
    }
    eventState: any = { visible: false, isHeader: false };
    focusToValidate: boolean = false;
    toggleOPtions(event: any) {
        event.preventDefault();
        if (this.eventState.isHeader) {
            this.visible = this.eventState.visible;
        }
        if (this.disabled) {
            this.visible = false;
        } else {
            this.visible = !this.visible;
        }
        if (this.config)
            this.config.hideMsg = false;
        this.animate();
    }
    animate() {
        this.visible ? this.optionsDom.slideDown() : this.optionsDom.slideUp();
    }
    ngOnDestroy() {
        if (!this.config.isFilter) {
            this.domClickSubscription.unsubscribe();
        }
    }
    addOption(option: juOption) {
        this.options.push(option);
    }
    removeOption(option: juOption) {
        this.options.splice(this.options.indexOf(option), 1);
    }
    selectOption(option: juOption) {
        if (this.viewMode === 'select' || this.viewMode === 'radio') {
            this.options.forEach(op => op.isSelected = (op === option));
            let tid = setTimeout(() => { this.visible = !this.visible; this.animate(); clearTimeout(tid); }, 100);
            this.selectedText = option.data.name;
        }
        else if (this.viewMode === 'checkbox') {
            option.isSelected = !option.isSelected;
            var selectedOptions = this.options.filter(v => v.isSelected === true);
            if (selectedOptions) {
                this.isAllSelected = selectedOptions.length === this.dataSrc.length;
                if (this.isAllSelected) {
                    this.selectedText = 'All items selected(' + this.dataSrc.length + ')';
                }
                else {
                    if (selectedOptions.length == 0) this.selectedText = 'Select options';
                    else this.selectedText = selectedOptions.length + (selectedOptions.length > 1 ? ' items' : ' item') + ' selected';
                }
            }
        }
        this._setModelValue();

    }
    search(val: string) {
        if (val) { val = val.toLowerCase(); }
        var temp: any[] = [];
        this.dataSrc.forEach((item: any) => {
            if ((item.name && item.name.toLowerCase().indexOf(val) >= 0) || (item.description && item.description.toLowerCase().indexOf(val) >= 0)) {
                temp.push(item);
            }
        });
        this.searchData = temp;
    }
    selectItem(value_or_name: any) {
        if (!value_or_name) return;
        this.checkAll(false, false);
        let valueSelected = false;
        if (this.searchData) {
            this.searchData.forEach((v: any) => {
                if (v.value.toString() === value_or_name.toString() || v.name === value_or_name) {
                    this.selectedText = v.name;
                    let option = this.options.find((x: any) => x.data.value.toString() === v.value.toString());
                    if (option) {
                        option.isSelected = true;
                        valueSelected = true;
                    }
                }
            });
        }
        if (valueSelected) {
            this._setValueByPropertyName(this.value);
            this.onChange.next({ value: this.value, sender: this, form: this.myForm });
        }
    }
    selectItems(values_or_names: any) {
        if (!values_or_names) return;
        this.checkAll(false, false);
        var spliter = '#$#', len = 0;
        if (Array.isArray(values_or_names)) {
            len = values_or_names.length;
            values_or_names = values_or_names.join(spliter);
        } else {
            len = values_or_names.toString().split(spliter).length;
        }
        this.selectedText = len + (len > 1 ? ' items' : ' item') + ' selected';
        if (len <= 0) return;
        values_or_names = spliter + values_or_names + spliter;
        let valueSelected = false;
        if (this.searchData) {
            this.searchData.forEach((v: any) => {
                if (values_or_names.indexOf(spliter + v.value + spliter) >= 0 || values_or_names.indexOf(spliter + v.name + spliter) >= 0) {
                    let option = this.options.find(x => x.data.value === v.value);
                    if (option) {
                        option.isSelected = true;
                        valueSelected = true;
                    }
                }
            });
        }
        if (valueSelected) {
            this._setValueByPropertyName(this.value);
            this.onChange.next({ value: this.value, sender: this, form: this.myForm });
        }
    }
    getNames(): any {
        var res: any[] = [];
        if (!this.dataSrc) return '';
        if (this.dataSrc)
            this.dataSrc.forEach((v: any) => {
                if (v.selected) {
                    res.push(v.name);
                }
            });
        if (Array.isArray(this._getValueByPropertyName()))
            return res;
        return res.join('#$#');
    }
    getValues(): any {
        var res: any[] = [];
        if (!this.dataSrc) return '';
        if (this.dataSrc)
            this.dataSrc.forEach((v: any) => {
                if (v.selected) {
                    res.push(v.value);
                }
            });
        if (Array.isArray(this._getValueByPropertyName()))
            return res;
        return res.join('#$#');
    }
    getSelectedItems() {
        var res: any[] = [];
        if (!this.dataSrc) return res;
        if (this.dataSrc)
            this.dataSrc.forEach((v: any) => {
                if (v.selected) {
                    res.push(v);
                }
            });
        return res;
    }
    checkAll(isChecked: boolean, isModelUpdate: boolean = true) {
        this.options.forEach(v => v.isSelected = isChecked);
        if (isChecked) {
            if (this.dataSrc.length === this.options.length) {
                this.selectedText = 'All items selected(' + this.dataSrc.length + ')';
            }
            else {
                this.selectedText = this.options.length + (this.options.length > 1 ? ' items' : ' item') + ' selected';
            }
        } else {
            this.selectedText = this.viewMode === 'checkbox' ? 'Select options' : 'Select option';
        }
        if (isModelUpdate) {
            this._setModelValue();
        }

    }
    setDtaSrc(data: any[]) {
        this.dataSrc = data;
        this.searchData = data;
    }
    _setModelValue() {
        if (this.model && this.propertyName && this.method) {
            this._setValueByPropertyName(this.method === 'getValues' ? this.getValues() : this.getNames());
            this.onChange.next({ value: this._getValueByPropertyName(), sender: this, form: this.myForm });

        }
    }
    hasError() {      
        let vals = this.getValues(), res;
        if (Array.isArray(vals)) {
            vals = vals.join('#$#');
        }
        /*if (flag) {
            res = vals ? true : false;
        } else {
            res = (this.focusToValidate ? !vals : false);
        }
        this.myForm.options._events[this.config.field].hideMsg=!res;
        
        return res;*/
         //vlidate_input(val: any, field: any, internal = false)
        this.myForm.dynamicComponent.instance
        .vlidate_input(vals, this.config,!this.focusToValidate);
        //console.log(this.config.hideMsg);
        return !this.config.hideMsg;
    }

}


