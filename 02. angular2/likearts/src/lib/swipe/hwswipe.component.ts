import {
  Component,
} from '@angular/core';
import { HwswipeView } from "./hwswipe.view";

@Component({
  selector:'[hw-swipe-container]',
  template:` 
      <div class="swipe_wrap">
        <ul hw-swipe
            infinity="true" 
            w320="2" 
            w640="3" 
            w900="4"
            [(swipeModel)]="swipeInfo"
            (swipeModelChange)="swipeModelChangeFunc($event)">
            <li *ngFor=" let item of swipeItemsList">{{item}}{{name}} {{swipeModel}}</li>
        </ul>
        <div class="clear swipecontainer">
            <a class="swc_prev">이전</a>
            <a class="swc_next">다음</a>
            <span *ngIf="swipeInfo.total" class="swc_page">{{swipeInfo['page']+1}}/{{swipeInfo['total']}}</span>
        </div>
      </div>`,
  styleUrls: ['./hwswipe.css']
})
export class HwswipeComponent extends HwswipeView { }
