import {Component, OnInit} from '@angular/core';
import {juGrid, juForm, FV, GridOptions, FormOptions, FormElement} from '../../jComponents';
import {ApiService} from '../../shared';
@Component({
    templateUrl: './upload.html',
    styleUrls: ['./upload.css'],
    directives: [juGrid, juForm],
    providers: [ApiService]
})

export class UploadComponent implements OnInit {
    private list: any[] = [];
    private formOptions: FormOptions;
    private gridOptions: GridOptions;

    constructor(private service: ApiService) { }

    ngOnInit() {
        this.initForm();
        this.initGrid();
    }
    private loadData(params: any) {
        console.log(params);
        return this.service.getUploadData('scolar');
    }
    private initForm() {
        this.formOptions = {
            labelPos: 'left',
            inputs: [
                [<FormElement>{ field: 'file1', type: 'file', size: 4, label: 'Test File', validators:FV.required },
                    <FormElement>{ type: 'html', content: `<button class="btn btn-success" [disabled]="!config.api.valid" (click)="config.upload()">Import</button>` }
                ]
            ],
            upload: () => {                
                this.gridOptions.api.pager.firePageChange();
                console.log(this.gridOptions.api.grid.getUpdatedRecords());
            }
        }
    }

    private initGrid() {
        this.gridOptions = {
            pageSize: 3, crud: false, quickSearch: false, enableCellEditing:true,
            sspFn: this.loadData.bind(this),
            columnDefs: [               
                { headerName: 'Name', field: 'name' },
                { headerName: 'Education', field: 'education',type:'juSelect', dataSrc:this.service.getEducations2() },
                { headerName: 'Age', field: 'age', type:'number', width:70},
                { headerName: 'Address', field: 'address' },
                { headerName: 'Description', field: 'description' }
            ]
        }
    }
}