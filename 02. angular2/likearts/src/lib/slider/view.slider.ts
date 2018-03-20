/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
import { ElementRef, Component, Renderer, OnInit } from '@angular/core'
import { BaseSliderInterface } from './interface.base.slier';
import { Easing } from '../ease/easing';

export class BaseSlider implements BaseSliderInterface {

	public config:Object;
	public drag:Boolean;
	public dragEventListener:Boolean;
	public itemsWidth:any;
	public windowInitW:Number;

	protected el:Element;
	protected cbz:Function = Easing.cubicbezier;

	constructor(protected elementRef: ElementRef, protected renderer: Renderer){
		this.el = this.elementRef.nativeElement;
	}

	private ngOnInit(){
    console.log("%cHWSLIDER", "background: white; color: #e68a97; font-size: 11px; font-weight: 400");
  }

  public setStyle( target:Element, style:Object ):void {
  	if(!style || typeof style != 'object') return;
  	for( let i in style ) target['style'][i] = style[i];
  }

	public getConfig(name, val:any=undefined ):any{
		if(val!=undefined) this.config[name] = val;
		return this.config[name];
	}

	public getListWidth():Number {
  	let scrollWidth = this.el.children[0].scrollWidth;
		if( scrollWidth > this.getContainerWidth() ) scrollWidth += Number( this.getConfig('marginRight') );
		return scrollWidth;
  }

  public getContainerWidth():Number {
		let limit = window.innerWidth;
		try { limit = this.el['offsetWidth'] } catch(e){}
		return limit;
	}

	protected getEasing( easing:Boolean, posx:Number ) {
		return easing ? {
			'-webkit-transition': '-webkit-transform '+(this.getConfig('speed')||this.getConfig('duration'))+'ms '+this.cbz(this.getConfig('easing')),
			'-moz-transition': '-moz-transform '+(this.getConfig('speed')||this.getConfig('duration'))+'ms '+this.cbz(this.getConfig('easing')),
			'transition': 'transform '+(this.getConfig('speed')||this.getConfig('duration'))+'ms '+this.cbz(this.getConfig('easing')),
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

	protected getTranslateX():any{
    let style = window.getComputedStyle( this.el.children[0] ),
    matrix = new WebKitCSSMatrix(style.webkitTransform);
    return matrix.m41;
	}

}
