import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {juGrid, FV} from '../../jComponents';
import {Observable} from 'rxjs';
import {ApiService} from '../../shared';
@Component({
    selector: 'selector',
    providers:[ApiService],
    directives: [juGrid],
    template: `<div class="container">
                    <div class="juGrid" (onLoad)="onLoad($event)" [data]="scholarList" [options]="scholarGridOptions"></div>
                </div>`,
    styleUrls:['./grid.css'],
    encapsulation:ViewEncapsulation.None
})

export class gridExample implements OnInit {
    scholarGridOptions:any;
    scholarList: any[];
    constructor(private service:ApiService) { }

    ngOnInit() {
        this.initScholar();
               
     }
     private onLoad(){        
        this.service.get('scholar').subscribe(list=>{this.scholarList=list;});
     }
    private initScholar() {
        this.scholarGridOptions = {
            pageSize:3,crud:true,
            trClass:(row,index, isFirst, isLast)=>({gray:isLast}),
            columnDefs: [
                { headerName: 'Name', field: 'name' },
                { headerName: 'Education', field: 'education' },
                { headerName: 'Address', field: 'address', tdClass:_=>({green:true}), cellRenderer:_=>`<b class="red">${_.address}</b>`},
                { headerName: 'Description', field: 'description' }
            ],
            formDefs: {
                title: 'Scholar',
                labelPos: 'left',
                labelSize: 3,                
                inputs: [                    
                    { field: 'name', label: 'Name', type: 'text', validators: [FV.required, FV.minLength(5)] },
                    { field: 'education', label: 'Education', type: 'text' },
                    { field: 'address', label: 'Address', type: 'text', validators:FV.required },
                    { field: 'description', label: 'Description', type: 'textarea' }
                ],
                buttons: {
                    'Save Change': { type: 'submit', cssClass: 'btn btn-success', click: this.submitScholar.bind(this) },
                    'Close': { type: 'close', cssClass: 'btn btn-default' }
                }
            },
            removeItem: (data) => {
                this.service.delete('scholar/' + data.id).subscribe(res => {
                    this.scholarGridOptions.api.grid.showMessage('Data removed successfully');
                    this.scholarGridOptions.api.grid.removeItem(data);                  
                });
            }
        };
    }
    private submitScholar() {
        if (this.scholarGridOptions.api.form.isUpdate) {
            this.service.put('scholar', this.scholarGridOptions.api.form.getModel())
                .subscribe(res => {
                    this.scholarGridOptions.api.grid.showMessage('Data updated successfully');
                    this.scholarGridOptions.api.form.showModal(false);
                });
        } else {
             this.service.post('scholar', this.scholarGridOptions.api.form.getModel())
                .subscribe(res => {
                    this.scholarGridOptions.api.grid.showMessage('Data inserted successfully');                   
                    this.scholarGridOptions.api.grid.addItem(res);
                    this.scholarGridOptions.api.form.showModal(false);                  
                });
        }

    }    
}