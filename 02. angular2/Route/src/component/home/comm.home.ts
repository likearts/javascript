import { Component } from '@angular/core';
import { slideInOutAnimation } from "../../animations/slideInOutAnimation";

@Component({
  selector:'page-home',
  templateUrl:'./home.html',
  styleUrls: ['./home.css'],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' }
})

export class HomeComponent {
  constructor(){
    console.log( "HomeComponent", new Date().getTime());
  }
}
