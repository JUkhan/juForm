import { Component, OnInit } from '@angular/core';
//import {juPanel, juPanelContent} from '../juComponents';
@Component({
  selector: 'my-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor() {
    // Do stuff
  }
  data:any[];
  ngOnInit() {
    this.data=[
      {name:'Arif', hasChild:true, items:[
        {name:'Belal'}
      ]},
      {name:'Shofi'}
    ];
  }
  header:string='';
  show() {
    var headerDef = [
      { headerName: '#' },
      {
        headerName: 'Full Name', children: [
          {
            headerName: 'First Name', field: "fname", children: [
              { headerName: 'ByMother', field: 'bm' },
              { headerName: 'ByFather', field: 'bf' }
            ]
          },
          { headerName: 'Last Name', field: "lname" }
        ]
      },
      {
        headerName: 'Total Cost', children: [
          {
            headerName: 'Indoor', field: "fname", children: [
              { headerName: 'Indoor-1', field: 'bm' },
              { headerName: 'Indoor-2', field: 'bf' }
            ]
          },
          { headerName: 'Outdoor', field: "lname" }
        ]
      },
      { headerName: 'Address', field: 'address' }
    ];
   this.header=this.calculateHeader(headerDef);
  }
  //headerRowFlag=0;
  headerHtml:any[] = [];
  calculateHeader(hederDef) {
    var colDef = [], rc = this.row_count(hederDef), i = 0;
    
    while (i < rc) {
      this.headerHtml[i] = [];
      i++;
    }
    hederDef.forEach(it => {
      this.traverseCell(it, rc, 0, colDef);
    });
    return this.headerHtml.map(_=>`<tr>${_.join('')}</tr>`).reduce((p, c)=>p+c,'');
  }
  traverseCell(cell, rs, headerRowFlag, colDef:any[]) {

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
      this.headerHtml[headerRowFlag].push(`>${cell.headerName}</th>`);

    }
  }
  row_count(hederDef) {
    var max = 0;
    for (var i = 0; i < hederDef.length; i++) {
      max = Math.max(max, this.cal_header(hederDef[i], 1));
    }
    return max;
  }
  cal_header(cell, row_count) {
    var max = row_count;
    if (cell.children) {
      row_count++;
      for (var i = 0; i < cell.children.length; i++) {
        max = Math.max(max, this.cal_header(cell.children[i], row_count));
      }
    }
    return max;
  }
  totalCS: number = 0;
  getColSpan(cell: any) {
    if (cell.children) {
      cell.children.forEach(it => {
        this.totalCS++;
        this.getColSpanHelper(it);
      });
    }
  }
  getColSpanHelper(cell: any) {
    if (cell.children) {
      this.totalCS--;
      cell.children.forEach(it => {
        this.totalCS++;
        this.getColSpan(it);
      });
    }
  }
}
