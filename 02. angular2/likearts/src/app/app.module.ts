import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HwsliderDirective } from '../lib/slider/hwslider.directive';
import { HwSwipeDirective } from '../lib/swipe/hwswipe.directive';
import { HwswipeComponent} from "../lib/swipe/hwswipe.component";

@NgModule({
  declarations: [
    AppComponent,
    HwsliderDirective,
    HwSwipeDirective,
    HwswipeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
