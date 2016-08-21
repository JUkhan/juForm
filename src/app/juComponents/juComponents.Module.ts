import { NgModule , ModuleWithProviders}      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }    from '@angular/forms';

import { juForm, juSelect, Datetimepicker, CkEditor, FileSelect  }    from './juForm';
import { juGrid, rowEditor }  from './juGrid';
import { juPanel, juPanelContent } from './juPanel';
import { juPager }  from './juPager';
//import { juMenu }  from './juMenu';
import { juWindowService, juParentWindow, juChildWindow, }  from './juWindow';
import {uiService} from './uiService';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [    
    juForm,
    juSelect,
    Datetimepicker,
    CkEditor,
    FileSelect,
    juGrid,
    rowEditor,
    juPanel, 
    juPanelContent,
    juPager,
    //juMenu,
    juParentWindow
   
  ],
  exports:[
    juForm,
    juSelect,
    juGrid,
    juPanel, 
    juPanelContent,
    juPager,
    //juMenu,
    juParentWindow
  ]
})
export class juComponentsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: juComponentsModule,
      providers: [ uiService ]
    };
  }
}