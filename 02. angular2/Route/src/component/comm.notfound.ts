import { Component } from '@angular/core';
import {slideInOutAnimation} from "../animations/slideInOutAnimation";

@Component({
  //selector:'not-found',
  template:`<h3>Not Found</h3>`,
  styleUrls: [],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' }
})

export class PageNotFoundComponent {
  constructor(){
    console.log( "PageNotFoundComponent", new Date().getTime());
  }
}
