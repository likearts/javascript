import { Input } from "@angular/core";

export class HwswipeView {
  @Input('swipeItems') swipeItemsList:object;
  public swipeInfo:object = {page:0,total:0};

  //@HostListener('swipeModelChangeFunc',['$event'])
  public swipeModelChangeFunc(type):void{
    if( type['page']<0||!type['total']||type['page']>type['total']-1) return;
  }
}
