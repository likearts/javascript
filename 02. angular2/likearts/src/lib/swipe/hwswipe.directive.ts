import {
  Directive,
  ElementRef,
  Renderer
} from '@angular/core';
import { HwswipeBase } from './hwswipe.base';
import { HwSwipeInterface } from "./hwswipe.interface";

@Directive({selector : '[hw-swipe]' })
export class HwSwipeDirective extends HwswipeBase implements HwSwipeInterface {

  protected swctrl:ElementRef;
  private resizeEvent:boolean = false;

  constructor( elementRef:ElementRef, renderer:Renderer ) {
    super( elementRef, renderer );
    this.setStyle(this.el,{display:'none'});
  }

  protected ngAfterViewInit():void{
    super.Initiailize();
    this.swipe();
    this.itemAlign();
    if(this.config['swipe']&&!this.dragevent) this.dragInit();
    if( !this.swctrl ) this.controlEvt();
  }

  protected swipe():void{
    super.swipe();
    if( this.el.children.length <= this.config['view'] ) {
      this.config['wrap'].removeEventlistener(
        'touchstart', (e)=>this.dragEvent(e)
      );
      this.config['wrap'].removeEventlistener(
        'touchmove', (e)=>this.dragEvent(e)
      );
      this.config['wrap'].removeEventlistener(
        'touchend', (e)=>this.dragEvent(e)
      );
    }
  }

  private controlEvt():void{
    this.swctrl = this.el.parentNode.querySelector(".swipecontainer");
    let prev:Element = this.el.parentNode.querySelector(".swipecontainer .swc_prev"),
        next:Element = this.el.parentNode.querySelector(".swipecontainer .swc_next");

    if( prev && next ) {
      prev.addEventListener( 'click', ()=>{
        this.swipeController('prev');
      });
      next.addEventListener('click', ()=>{
        this.swipeController('next');
      })
    }
  }

  private itemAlign():void{
    let len:number = this.el.children.length,
        itemWidth:number = this.el.parentElement.clientWidth/this.config['view'],
        containerWidth:number = (itemWidth*len)+(itemWidth*this.config['view'])*2;

    this.config['containerWidth'] = itemWidth*len;
    this.config['overWidth'] = itemWidth*this.config['view'];
    this.config['total'] = Math.ceil(len/this.config['view']);
    this.config['itemWidth'] = itemWidth;

    this.setStyle( this.el,{ width:containerWidth+'px'});
    for( let i=0; i<len;++i ) {
      this.setStyle( this.el.children[i],{
        width:itemWidth+'px',
        display:'block',
        float:'left',
        '-webkit-box-sizing':'border-box'
      });
      this.items.push( this.el.children[i].cloneNode(true) );
    }

    if(!this.config['swipe']) return;

    for( let i=0; i<this.config['total'];++i ){
      let itemgroup = [];
      for( let s=0; s<this.config['view'];++s) {
        let cnt:number =i*this.config['view']+s,
            item:any = this.items[cnt];
        if(cnt<this.el.children.length) {
          itemgroup.push({left: item.offsetLeft || itemWidth*cnt , page: i, index: cnt});
        }
      }
      if(itemgroup.length) this.config['posx'].push(itemgroup);
    }

    for( let i=0;i<this.config['view'];++i) this.copyItems(i,'next');
    for( let i=this.items.length-1;i>(this.items.length-1)-this.config['view'];--i) this.copyItems(i,'prev');

    this.moveX(0);
  }

  private dragInit():void{
    // 드래그 이벤트 활성화
    if(this.dragevent) return;
    this.dragevent = true;
    this.config['wrap'].addEventListener('touchstart', (e)=>this.dragEvent(e) );
    this.config['wrap'].addEventListener('touchmove', (e)=>this.dragEvent(e) );
    this.config['wrap'].addEventListener('touchend', (e)=>this.dragEvent(e) );

    if(!this.resizeEvent) {
      this.resizeEvent = true;
      window.addEventListener('resize',(e)=>{
        //let len = this.el.children.length;
        //this.moveX(0);
        //this.ngAfterViewInit();
      })
    }
  }

  private dragEvent(e):void{
    let touchProps:any = e.changedTouches[0],
        touchX:number = touchProps.clientX,
        dy:number = touchProps.clientY;

    switch( e.type ){
      case "touchstart":
        e.stopPropagation();
        this.config['touchPos'] = touchX;
        this.config['scrolly'] = dy;
        break;
      case "touchmove":
        let cpos = this.config['touchPos']-touchX,
            cy = this.config['scrolly']-dy;

        if( Math.abs(cy) > 10 && this.config['useScrollPos'] != 'X' )
          this.config['useScrollPos'] = 'Y'; //위,아래 이동
        if( Math.abs(cpos) > 20 && this.config['useScrollPos'] != 'Y' )
          this.config['useScrollPos'] = 'X'; //좌,우 이동

        this.config['side'] = this.config['touchPos'] < touchX ? 'prev' : 'next';
        if( this.config['useScrollPos'] != 'Y' ) {
          e.preventDefault();
          this.draging( cpos );
        }
        break;
      case "touchend":
        if(this.config['useScrollPos']!='Y') this.draging( this.config['touchPos']-touchX, true );
        else this.setPox( this.config['movePos'] );
        this.config['touchPos'] = this.config['scrolly'] = 0;
        this.config['useScrollPos'] = '';
        break;
    }
  }

  protected draging(posx:number,end:boolean=false):void{
    if( !Math.abs(posx) || this.config['transition'] ) return;
    let cposx:number = this.config['movePos']-posx;
    if(end){
      if(Math.abs(posx)<Math.floor(this.config['itemWidth'] /3)) {
        this.setPox(this.config['movePos']);
        return;
      }
      this.config['transition'] = true;
      this.getPage();
      this.moveX(this.config['page'],true);

      setTimeout(()=>{
        // 처음 일경우
        if( this.config['page'] < 0 ) {
          this.moveX( this.config['total']-1, false );
          this.config['page'] = this.config['total']-1;
        }
        // 끝일경우
        if( this.config['page'] > this.config['total']-1 ) {
          this.moveX( 0, false );
          this.config['page'] = 0;
        }
        this.config['transition'] = false;
        super.update();
      }, this.config['duration'] );
    } else this.setStyle( this.el,this.getEasing(end,cposx) );
  }

  protected reset():void{
    if(!this.items.length) return;
    this.el.innerHTML= "";
    for( let i=0; i<this.items.length;++i) this.el.appendChild( this.items[i] );
    this.Initiailize();
  }

  public swipeController(type):void{
    if(!type) return;
    switch(type){
      case "next":
        this.config['side']="next";
        this.draging(window.innerWidth/2,true);
        break;
      case "prev":
        this.config['side']="prev";
        this.draging(window.innerWidth/2,true);
        break;
      default:
        if(typeof type != 'number') return;
        this.moveX(type,true,true);
    }
  }

}
