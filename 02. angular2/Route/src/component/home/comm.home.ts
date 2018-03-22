import { Component,  } from '@angular/core';
import { HttpClient  } from '@angular/common/http';
import { slideInOutAnimation } from "../../animations/slideInOutAnimation";

@Component({
  selector:'page-home',
  templateUrl:'./home.html',
  styleUrls: ['./home.css'],
  animations: [slideInOutAnimation],
  host: { '[@slideInOutAnimation]': '' }
})

export class HomeComponent {
  constructor(private http: HttpClient  ){
    console.log( "HomeComponent", new Date().getTime());
    console.log('01');
    console.log('res', this.loader().then(res => console.log('res->res',res)) );
    console.log('--end');

    var cdata = this.loader2();
    console.log('cdata', cdata );
  }

  async loader(): Promise<any> {
    let data = await(await (fetch('./assets/getKshopMainJson.json')
      .then(res => {
        return res.json();
      })
      .catch(err => {
        console.log('Error: ', err)
      })
    ))
    console.log('loader', data);

    return data;
  }

  async loader2(): Promise<any> {
    const data = await fetch('./assets/getKshopMainJson.json')
    console.log('loader2', data);
    return await data.json();
  }
}
