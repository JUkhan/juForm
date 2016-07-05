import { enableProdMode } from '@angular/core';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HTTP_PROVIDERS } from '@angular/http';

import { provideRouter } from '@ngrx/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';


// depending on the env mode, enable prod mode or add debugging modules
// if (process.env.ENV === 'build') {
//   enableProdMode();
// }
enableProdMode();
bootstrap(AppComponent, [
    // These are dependencies of our App
    HTTP_PROVIDERS,   
    provideRouter(routes),
    { provide: LocationStrategy, useClass: HashLocationStrategy } // use #/ routes, remove this for HTML5 mode
  ])
  .catch(err => console.error(err));
