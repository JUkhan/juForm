import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { CommonModule }        from '@angular/common';
import { HttpModule, JsonpModule } from '@angular/http';
import { ROUTER_DIRECTIVES, RouterModule } from '@angular/router';
import { provideRouter, RouterConfig } from '@angular/router';

import { AppComponent }   from './app.component';
import { routing } from './app.routes';
import {AppService} from './shared';


import { HomeComponent } from './home';
import { AboutComponent } from './about';
//import { WindowComponent } from './window';
//import { UploadComponent, gridExample } from './settings';
import {juComponents} from './juComponents';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
         HttpModule,
         JsonpModule,         
         RouterModule,       
        routing,
        juComponents.forRoot()

    ],
    declarations: [        
        AppComponent,
        AboutComponent,
        HomeComponent,             
        //WindowComponent,
        //UploadComponent,
        //gridExample
    ],
    providers: [
      AppService
    ],
    bootstrap:    [AppComponent],
})

export class AppModule {}