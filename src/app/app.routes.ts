import { Routes } from '@ngrx/router';

import { HomeComponent } from './home';
import { AboutComponent } from './about';
export const routes: Routes = [
  {
    path: '/',
    component: HomeComponent
  },
  {
    path: '/about',
    component:AboutComponent
  }
  
];