import { Component } from '@angular/core';
import {slideInOutAnimation} from "../animations/slideInOutAnimation";

@Component({
  //selector:'page-contact',
  template:`<h3>Contact</h3>`,
  styleUrls: [],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' }
})

export class ContactComponent {
  constructor(){
    console.log( "ContactComponent", new Date().getTime());
  }
}
