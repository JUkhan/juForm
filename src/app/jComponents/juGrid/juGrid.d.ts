import {juGrid} from './juGrid';
import {juForm, FormOptions} from '../juForm';
import {Observable} from 'rxjs/Observable';
export interface ColumnDefs{
    headerName?:string;
    field:string;
    tdClass?:(row:any, index:number, isFirst:boolean, isLast:boolean)=>{};
    cellRenderer?:(row:any, index:number, isFirst:boolean, isLast:boolean)=>string;
}
export interface GridOptions{
    linkPages?:number;
    pageSize?:number;
    confirmMessage?:number;
    crud?:boolean;
    create?:boolean;
    update?:boolean;
    remove?:boolean;
    search?:[string];
    trClass?:(row:any, index:number, isFirst:boolean, isLast:boolean)=>{};
    formDefs?:FormOptions;
    columnDefs?:[ColumnDefs];
    removeItem?: (data:any) =>void;
    api?:{form:juForm, grid:juGrid};
    sspFn?:(params:{pageSize:number,pageNo:number})=>Observable<{totalPage:number, data:any[]}>;
    onFormLoad?: (form: juForm) =>void;
}

 