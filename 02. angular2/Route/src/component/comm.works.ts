import { Component } from '@angular/core';
import {slideInOutAnimation} from "../animations/slideInOutAnimation";

@Component({
  //selector:'page-works',
  template:`<h3>works</h3>`,
  styleUrls: [],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' }
})

export class WorksComponent {
  constructor(){
    console.log( "WorksComponent", new Date().getTime());
  }
}
