import { Directive,ElementRef, Renderer } from '@angular/core';
import { SliderInterface } from './interface.slier';
import { BaseSlider } from './view.slider';

@Directive({
  selector: '[hw-slider]',
 	host: {
      //'[style.background-color]': '"transparent"'
    }
})

export class HwsliderDirective extends BaseSlider implements SliderInterface {

  constructor(elementRef: ElementRef, renderer: Renderer ) {
  	super(elementRef,renderer);
  	//this.el['style'].color='white';

  	window.addEventListener( 'resize', (e)=>this.resizeEvent(e) );
  }

  public ngAfterViewInit():void{
  	this.config = {
			x : 0,
			y : 0,
			move:'',
			hold:0,
			transition:false,
			dragX:0,
			duration: 400,//attrs.duration || 400,
			upDuration : 0,
			easing : "",//attrs.easing,
			touchtime : 0,
			autoCenter : true,//attrs.autoCenter == 'true' ? true : false,
			marginRight: 0,//attrs.marginRight || 0,
			bounce : false,//attrs.bounce == 'true' ? true : false,
			transX : 0,
			applyInterval : 0
  	}

  	this.itemsWidth = this.getListWidth();
    if( this.itemsWidth <= this.el['offsetWidth'] ) return;

   	this.setStyle( this.el.children[0], {
   		'-moz-box-sizing':'border-box',
      'box-sizing':'border-box',
      'will-change': 'transform',
      'pointer-events': 'auto',
      '-webkit-user-drag' : 'none',
      'touch-action' : 'pan-y',
      'user-select' : 'none',
      '-webkit-font-smoothing': 'antialiased'
   	});

   	this.drag = true;
		if(!this.dragEventListener) this.bindEvent(true);
  }

  public setPox( x:Number ):void{
		clearInterval( this.getConfig('applyInterval') );
    this.getConfig('speed',0);
    this.setStyle( this.el.children[0], this.getEasing(true, x) );
    this.getConfig('hold', x);
  }

	private bindEvent(bind){
		if(!bind){
      this.dragEventListener = false;
			this.el.removeEventListener( 'touchstart', (e)=>this.dragEvent(e) );
			this.el.removeEventListener( 'touchmove', (e)=>this.dragEvent(e) );
			this.el.removeEventListener( 'touchend',(e)=>this.dragEvent(e) );
			let len = this.el.children[0].children.length;
			for( let i=0; i<len;++i) this.el.children[0].children[i].removeEventListener( 'click', (e)=>this.clickEvent(e) );
		} else {
      this.dragEventListener = true;
			this.el.addEventListener( 'touchstart', (e)=>this.dragEvent(e) );
			this.el.addEventListener( 'touchmove',(e)=>this.dragEvent(e) );
			this.el.addEventListener( 'touchend', (e)=>this.dragEvent(e) );
			let len = this.el.children[0].children.length;
			for( let i=0; i<len;++i) this.el.children[0].children[i].addEventListener( 'click', (e)=>this.clickEvent(e) );
		}
	}

	private clickEvent(e):void{
		if( e.type != 'click' || !this.getConfig('autoCenter') ) return;

    let children = this.el.children[0].children.length;
    for( let i=0; i<children;++i) {
      this.el.children[0].children[i].classList.remove('active');
    }

		let w:any = this.getContainerWidth(),
		t:any = e.currentTarget,
		x:any = t.offsetLeft,
		itemW:any = t.clientWidth,
		newX:any = -x+w/2-itemW/2,
		ew:any = this.itemsWidth;

		if( ew < w ) return;
		if( newX > 0 ) newX = 0;
		if( newX < -(ew-w) ) newX = -(ew-w);
		t.classList.add('active');
		this.setPox( newX );
	}

	private dragEvent(e):void{
		let touchProps:any = e.changedTouches[0],
 		touchX:any = touchProps.clientX,
 		dy:any = touchProps.clientY;

		if(!this.drag) return;

		switch(e.type){
			case "touchstart":
				e.stopPropagation();
				this.getConfig('x', touchX );
				this.getConfig('y',dy);
				this.getConfig('touchtime',new Date().getTime());
				break;
			case "touchmove":
				let cpos:any = this.getConfig('x')-touchX, cy:any = this.getConfig('y')-dy;
				if( Math.abs(cy) > 10 && this.getConfig('move') != 'X' ) this.getConfig('move','Y'); //위,아래 이동
				if( Math.abs(cpos) > 20 && this.getConfig('move') != 'Y' ) this.getConfig('move','X');  //좌,우 이동
				if( this.getConfig('move') != 'Y' ) {
					e.preventDefault();
					this.draging( cpos );
				}
				break;
			case "touchend":
				let maxtime:any = 500,
				endtime:any = Math.abs(new Date().getTime()-this.getConfig('touchtime')),
				uptime:any = endtime-maxtime,
				uppos:any = 0,
				acpos:any = 0;

				this.getConfig('speed', 1500 - endtime );

				if( uptime > 0 ) uptime = 0;
				uppos = ( Math.abs(uptime)/maxtime*5);

				if(this.getConfig('speed')<this.getConfig('duration')) this.getConfig('speed',this.getConfig('duration'));
				if(Math.floor(uppos)>0) acpos = uppos * (this.getConfig('x')-touchX);
				else acpos = (this.getConfig('x')-touchX);

				if(this.getConfig('move')!='Y') this.draging( acpos, true );
				else this.setPox( this.getConfig('hold') );

				this.config['x'] = this.config['y'] = 0;
				this.config['move'] = '';

				break;
		}
	}

	private resizeEvent(e){
		let child = this.el.children[0].children, find:Boolean = false;

		if(!child.length || Number(this.windowInitW) == Number(window.innerWidth) ) return;
		this.windowInitW = window.innerWidth;
    this.drag = false;

		if( this.getListWidth() <= this.getContainerWidth() ) {
			this.setPox(0);
			return;
    } else this.ngAfterViewInit();

		for( let i=0;i<child.length;++i) {
			if(!find && child[i].classList.contains("active")){
				this.clickEvent({
					type : 'click',
					currentTarget:child[i]
				});
				find = true;
			}
		}
		if(!find||!this.config['autoCenter']) {
      this.config['transition'] = false;
			this.draging(-10);
    }
	}

	protected draging( x:any, e:Boolean=false ) {
		if( !Math.abs(x) || this.config['transition'] ) return;
		let cposx:any = this.config['hold']-x,
		limit:any = this.getContainerWidth();
		clearInterval(this.getConfig('applyInterval'));

		if(!e) {
			let overX = 0;
			if( cposx > 0 ) {
				overX = Math.abs(cposx)/(limit)*(limit-50);
				cposx = cposx-overX;
			}
			if( cposx < -(this.itemsWidth-limit) ) {
				overX = Math.abs(cposx+(this.itemsWidth-limit))/(limit)*(limit-50);
				cposx = cposx+overX;
			}
			this.setStyle( this.el.children[0], this.getEasing(e,cposx) );
			this.getConfig('dragX',cposx);
		}
		else {

			// #bounce
			if(this.getConfig('bounce')){
				let ease:String = "easeOutBack",
				endEasing:String = this.getConfig('easing'),
				afterX:any = 0,
				xx:any = cposx,
				over:String = "",
	      contWidth:any = this.getListWidth(),
				maxinum:any = contWidth-limit;

	      this.getConfig('speed',90);
	      this.getConfig('applyInterval',
	      	setInterval(()=>{
		       	this.getConfig('hold',Math.round (this.getTranslateX() ) )
		        this.config['hold'] -= ( this.getConfig('hold')-cposx )/12;
		          if( Math.round(this.config['hold']) > 0 && over!= "right" ) {
		              cposx = -Math.round(cposx);
		              over = "right";
		          }
		          if( Math.round(this.config['hold']) < -maxinum && over != "left" ) {
		              cposx = -( maxinum - (Math.abs(cposx)-Math.abs(maxinum)));
		              if( cposx < -maxinum ) cposx = Math.abs(cposx+maxinum);
		              xx = cposx;
		              over = "left";
		          }
		          if( Math.round(this.getConfig('hold')) == Math.round(cposx) )  {
		              clearInterval(this.getConfig('applyInterval'));
		              over = "";
		              this.getConfig('speed',0);
		          }
		          this.setStyle(
		            this.el.children[0],
                this.getEasing(false, Math.round(this.getConfig('hold')))
              )
					},10)
				)//applyInterval
			}
			// #normal
			else {
				let ease:String = "easeOutBack",
				endEasing:String = this.getConfig('easing'),
				afterX:any = 0,
				origin0X:any = cposx;

				if( cposx > 0 ) {
					cposx = this.config['dragX'] = 0;
					this.getConfig('easing',ease);
					this.getConfig('speed',400);
				}
				if( cposx < -(this.itemsWidth-limit) ) {
					afterX = cposx + (this.itemsWidth-limit);
					cposx = this.config['dragX'] = -(this.itemsWidth-limit);
					this.getConfig('easing',ease);
					this.getConfig('speed',400);
				}

				if((this.getConfig('hold')>=0&&cposx>=0)||(this.getConfig('hold')<=-(this.itemsWidth-limit)&&cposx<=-(this.itemsWidth-limit))) this.getConfig('speed',300);
				this.setStyle( this.el.children[0], this.getEasing(e,cposx) );
	      this.getConfig('hold', cposx);
				this.getConfig('easing',endEasing);
				this.getConfig('speed',this.getConfig('duration'));
			}

		}//if

	}


}
