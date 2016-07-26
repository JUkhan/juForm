import { Routes } from '@ngrx/router';
import { HomeComponent } from './home';

export const routes: Routes = [
  {
    path: '/',
    component: HomeComponent
  },
  {
    path: '/grid',
    loadComponent:()=>require('./settings').gridExample,
  },
  {
    path: '/upload',
    loadComponent:()=>require('./settings').UploadComponent,
  },
  {
    path: '/about',
    loadComponent:()=>require('./about').AboutComponent
  }
  ,
  {
    path: '/window',    
    loadComponent:()=>require('./jComponents').ParentWindow
  }
];