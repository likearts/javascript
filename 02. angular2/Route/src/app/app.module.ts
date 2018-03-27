import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { routing, appRoutingProviders } from '../route/routes';
import {
  Home,
  Profile,
  Works,
  Contact,
  NotFound
} from '../component';

@NgModule({
  declarations: [
    AppComponent,
    Home,
    Profile,
    Works,
    Contact,
    NotFound
  ],
  imports: [
    BrowserModule,
    routing,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [appRoutingProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
