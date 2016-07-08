import {juGrid} from './juGrid';
import {juForm, FormOptions} from '../juForm';
import {Observable} from 'rxjs/Observable';
export interface ColumnDefs{
    width?:number;
    headerName?:string;
    field?:string;
    tdClass?:(row:any, index:number, isFirst:boolean, isLast:boolean)=>{};
    cellRenderer?:(row:any, index:number, isFirst:boolean, isLast:boolean)=>string;
    action?:[{title:string, icon:string, click:(row:any)=>void}];
    children?:ColumnDefs[];
}
export interface GridOptions{
    classNames?:string;
    linkPages?:number;
    pageSize?:number;
    confirmMessage?:number;
    crud?:boolean;
    create?:boolean;
    update?:boolean;
    remove?:boolean;
    search?:boolean;
    update_CB?:(form:juForm, model:any)=>void;
    insert_CB?:(form:juForm)=>void;
    trClass?:(row:any, index:number, isFirst:boolean, isLast:boolean)=>{};
    formDefs?:FormOptions;
    columnDefs?:ColumnDefs[];
    removeItem?: (data:any) =>void;
    api?:{form:juForm, grid:juGrid};
    sspFn?:(params:{pageSize:number,pageNo:number, searchText:string})=>Observable<{totalPage:number, data:any[]}>;
    onFormLoad?: (form: juForm) =>void;
   
}

 