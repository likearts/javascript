import {
  ElementRef,
  Renderer,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { HwSwipeBaseInterface } from './base.interface';
import { Easing } from '../ease/easing';

export class HwswipeBase implements HwSwipeBaseInterface {

  public config:object;
  public dragevent:boolean;
  public items:Array<any> = new Array();
  public swipeID:string;

  protected el:any;
  protected cbz:Function = Easing.cubicbezier;

  @Output() hwsiwpeEvent:EventEmitter<any> = new EventEmitter();
  @Output() swipeModelChange = new EventEmitter();

  constructor( protected elementRef:ElementRef, protected renderer:Renderer){
    renderer.setElementClass(elementRef.nativeElement, 'hwswipe_clear', true);
    this.el = elementRef.nativeElement;
    this.swipeID = this.getSwipeID();
  }

  private ngOnInit(){
    console.log("%cHWSWIPE", "background: white; color: #e68a97; font-size: 11px; font-weight: 400");
    console.log('init', this.el.children.length );
  }

  @Input()
  public get swipeModel(){
    return this.config;
  }
  public set swipeModel(v){
    try{
      if(v['total']&&v['page']>-1&&v['page']<=v['total']-1) {
        this.swipeModelChange.emit({
          page:v['page'],
          total:v['total']
        });
      }
    }catch(e){}
  }

  public setStyle( target:any, style:any ):void {
    if(!style || typeof style != 'object') return;
    for( let i in style ) target['style'][i] = style[i];
  }

  public addClass( target:any, name:string ):void {
    if(!target||!name) return;
    if( !target.classList.contains(name) ) target.classList.add( name );
  }

  public getClass( target:any, name:string ):boolean {
    if(!target||!name) return false;
    return target.classList.contains(name);
  }

  public getConfig(name:string, val:string=undefined ):any{
    if(val!=undefined) this.config[name] = val;
    return this.config[name];
  }

  protected update():void{
    if(this.config['total']&&this.config['page']>-1&&this.config['page']<=this.config['total']-1)
      this.swipeModel = this.config;
  }

  protected Initiailize():void{
    if( !this.getClass(this.el, 'hwswipe_clear')) this.addClass(this.el,'hwswipe_clear');
    if( this.swipeID ) this.addClass(this.el,this.swipeID );

    this.setStyle( this.el,{
      display:'block',
      position:'relative',
      '-webkit-box-sizing':'border-box',
      '-moz-box-sizing':'border-box',
      'box-sizing':'border-box',
      'will-change': 'transform',
      'pointer-events': 'auto',
    });

    this.setStyle( this.el.parentElement,{
      '-webkit-user-drag' : 'none',
      'touch-action' : 'pan-y',
      'user-select' : 'none',
      'will-change' : 'transform',
      '-webkit-font-smoothing': 'antialiased',
      'box-sizing': 'border-box'
    });

    this.config = {
      touchPos : 0,
      movePos : 0,
      wrap : this.el.parentElement,
      view : 1,
      page : 0,
      total : 0,
      containerWidth:0,
      overWidth:0,
      itemWidth:0,
      duration: this.el.getAttribute('duration')||300,
      posx:[],
      swipe:false,
      side:'',
      infinity: this.el.getAttribute('infinity')=='true'?true:false,
      auto: this.el.getAttribute('autoPlay')=='true'?true:false,
      autotimer:0,
      interval: this.el.getAttribute('interval')||5000,
      easing: this.el.getAttribute('easing'),
      parentWidth:this.el.parentElement.clientWidth,
      scrolly:0,
      useScrollPos:''
    }
    setTimeout(()=>this.update(),500);
  }

  protected swipe():void{
    let winWidth:number = window.innerWidth;

    if(this.el.getAttribute('w900')&&winWidth<=900) this.config['view'] = this.el.getAttribute('w900');
    if(this.el.getAttribute('w640')&&winWidth<=640) this.config['view'] = this.el.getAttribute('w640');
    if(this.el.getAttribute('w320')&&winWidth<=320) this.config['view']= this.el.getAttribute('w320');

    if( this.el.children.length <= this.config['view'] ) {
      this.config['view'] = this.el.children.length;
      this.config['swipe'] = false;
      this.dragevent = false;
    }
    else this.config['swipe'] = true;
  }

  protected copyItems( index:number, side:String='next' ):void{
    let item:Element = this.items[index].cloneNode(true);
    if(!this.config['infinity']) this.setStyle(item,{opacity:0});

    if(side=="next") {
      this.el.insertBefore( item, this.el.lastChild );
    } else {
      this.el.insertBefore( item, this.el.firstChild );
    }
  }

  protected getSwipeID():string {
    let base:string = "hwswipe_",
      max:any = 99999,
      txt:string = "ABCDEFGHIJKMLNOPQRSTUVWXYZ";

    for(let i=0;i<5;++i) base += txt.charAt( Math.floor(Math.random() * txt.length ) );
    base += String( Math.floor( Math.random() * max ) );

    return base;
  }

  protected getPage():void{
    if( this.config['side'] == 'next' ) {
      if(this.config['page']<this.config['total']) this.config['page']++;
      if(!this.config['infinity']&&this.config['page']>=this.config['total']-1) this.config['page'] = this.config['total']-1;
    } else {
      if(this.config['page']>-1) this.config['page']--;
      if(!this.config['infinity']&&this.config['page']<0) this.config['page'] = 0;
    }
    this.update();
  }

  protected getEasing( easing:boolean=false, posx:number ):object {
    return easing ? {
      '-webkit-transition': '-webkit-transform '+this.config['duration']+'ms '+this.cbz( this.config['easing'] ),
      '-moz-transition': '-moz-transform '+this.config['duration']+'ms '+this.cbz( this.config['easing'] ),
      '-o-transition': '-o-transform '+this.config['duration']+'ms '+this.cbz( this.config['easing'] ),
      'transition': 'transform '+this.config['duration']+'ms '+this.cbz( this.config['easing'] ),
      '-webkit-transform':'translateX('+posx+'px)',
      '-moz-transform':'translateX('+posx+'px)',
      '-o-transform':'translateX('+posx+'px)',
      '-ms-transform':'translateX('+posx+'px)',
      'transform':'translateX('+posx+'px)'
    } : {
      '-webkit-transition': '-webkit-transform 0ms',
      '-moz-transition': '-moz-transform 0ms',
      '-o-transition': '-o-transform 0ms',
      'transition': 'transform 0ms',
      '-webkit-transform':'translateX('+posx+'px)',
      '-moz-transform':'translateX('+posx+'px)',
      '-o-transform':'translateX('+posx+'px)',
      '-ms-transform':'translateX('+posx+'px)',
      'transform':'translateX('+posx+'px)'
    }
  }

  protected setPox(pos:number):void{
    this.setStyle( this.el, this.getEasing(true,pos) );
    this.config['movePos'] = pos;
  }

  protected swipeController(type):void{
    setTimeout(()=>this.update(),1000);
  }

  protected moveX( index:number, easing:boolean=false, apply:boolean=false ):void{
    let posx:number;
    if( index>-1&&index<this.config['total']) {
      posx = -(this.config['parentWidth']+this.config['posx'][index][0].left);
      if(index==this.config['total']-1){
        let basew:number = this.el.children[0].clientWidth;
        posx = -(basew+this.config['posx'][index][this.config['posx'][index].length-1].left);
      }
    } else {
      if( index<0) posx = 0;
      if(index>this.config['total']-1) posx = -(this.el.clientWidth-this.config['parentWidth']);
    }

    this.setStyle( this.el, this.getEasing( easing,posx) );
    this.config['movePos'] = posx;
    if(apply) this.config['page'] = index;
  }

}
