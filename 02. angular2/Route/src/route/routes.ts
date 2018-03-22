import {RouterModule, Routes} from '@angular/router';
import {
  Home,
  Profile,
  Works,
  Contact,
  NotFound
} from '../component/index';

export const rotues: Routes = [
  {
    path : '',
    component : Home
  },
  {
    path : 'profile',
    component : Profile
  },
  {
    path : 'works',
    component : Works
  },
  {
    path : 'contact',
    component : Contact
  },
  { path: '**', component: NotFound }
]

export const appRoutingProviders: any[] = [ ];
export const routing = RouterModule.forRoot(rotues);
