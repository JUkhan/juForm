import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home';
import {UploadComponent} from './settings'
import {AboutComponent} from './about'
export const routes: Routes = [
  { path: '', redirectTo: 'about', pathMatch: 'full'},
  { path: 'home', component: HomeComponent},
  { path: 'about', component: AboutComponent },
  //{ path: 'window', component: require('./window').WindowComponent},
  //{ path: 'grid', component: require('./settings').gridExample},
  { path: 'upload', component: UploadComponent}
];

export const routing = RouterModule.forRoot(routes);