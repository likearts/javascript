import { Component } from '@angular/core';
import {slideInOutAnimation} from "../animations/slideInOutAnimation";

@Component({
  //selector:'page-profile',
  template:`<h3>Profile</h3>`,
  styleUrls: [],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' }
})

export class ProfileComponent {
  constructor(){
    console.log( "ProfileComponent", new Date().getTime());
  }
}
