import { Routes } from '@ngrx/router';

import { HomeComponent } from './home';
import { AboutComponent } from './about';
import {gridExample} from './settings';
import {ParentWindow} from './jComponents';
export const routes: Routes = [
  {
    path: '/',
    component: HomeComponent
  },
  {
    path: '/grid',
    component:gridExample
  },
  {
    path: '/about',
    component:AboutComponent
  }
  ,
  {
    path: '/window',
    component:ParentWindow
  }
];