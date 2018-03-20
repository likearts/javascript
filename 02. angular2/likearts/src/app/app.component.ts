import {ElementRef, Component, Renderer, HostListener, Output, EventEmitter, ViewChild} from '@angular/core';
import { NgForm } from "@angular/forms";
import { HwswipeComponent } from "../lib/swipe/hwswipe.component";
import {Observable} from "rxjs/Rx";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  @Output('appclick') appclick:EventEmitter<any> = new EventEmitter();

  title = 'ngForm Test';
  user = {
    username:'likearts',
    email:'hwpark@example.com',
    password:'123456'
  }
  genders = [
  	'male',
  	'famale'
  ]

  sliderItems = [
  	1,2,3,4,5,6,7,8,9
  ]

  constructor(){
    console.log("!!", new Date().getTime());
  }

  ngAfterViewInit(){
    console.log('afterView');
  }

  onSubmit(form:NgForm){
  	console.log(form);
  	console.log(form.form.value);
  }

}
