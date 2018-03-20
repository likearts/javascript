import React, { Component } from 'react';
import SwipeBaseInterface from './interface/base';
import Easing from '../easing/easing';

export default class HwSwipeBase extends Component implements SwipeBaseInterface {

    ref = "hwswipecontainer";
    refid = "hwswipecontainerWrap";
    wrap = null;
    pwrap = null;
    items = [];
    cbz = Easing.cubicbezier;
    resizeEvent = false;
    dragevent = false;
    config;

    constructor(props){
        super(props);
        if(!this.props.data) this.props.data = [];
    }
    componentWillMount(){
        this.setState({});
        if(!this.resizeEvent) window.addEventListener( 'resize', this.resizeEventFun );
    }
    Initialize(){
        this.config = {
            touchPos : 0,
            movePos : 0,
            wrap : '',
            view : 1,
            page : 0,
            total : 0,
            containerWidth:0,
            overWidth:0,
            itemWidth:0,
            duration: this.props.duration || 300,
            posx:[],
            swipe:false,
            side:'',
            infinity: this.props.infinity,
            auto: this.props.autoPlay,
            autotimer:0,
            interval: this.props.interval,
            easing: this.props.easing,
            parentWidth:0,
            scrolly:0,
            useScrollPos:'',
        };
        this.setState({
            page:this.config.page,
            total:this.config.total
        });
    }
    componentDidMount(){
        this.Initialize();

        let winWidth = window.innerWidth,
            w900 = this.props.w900,
            w640 = this.props.w640,
            w320 = this.props.w320,
            view = 1;

        if(w900&&winWidth<=900) view = w900;
        if(w640&&winWidth<=640) view = w640;
        if(w320&&winWidth<=320) view = w320;

        this.config.view = view;

        try {
            this.wrap = this.refs[this.ref].refs[this.refid];
            this.config.parentWidth = this.wrap.parentNode.clientWidth;

            if( this.wrap.children.length <= this.config.view ) {
                this.dragevent = false;
                this.config.swipe = false;
                this.config.view = this.props.data.length;
            }
            else this.config.swipe = true;

            if(!this.items.length){
                if(this.wrap) {
                    this.pwrap = this.wrap.parentNode;
                    this.setStyle(this.wrap.parentNode, {
                        '-webkit-user-drag': 'none',
                        'touch-action': 'pan-y',
                        'user-select': 'none',
                        'will-change': 'transform',
                        '-webkit-font-smoothing': 'antialiased',
                        'box-sizing': 'border-box'
                    });
                    this.setStyle(
                        this.wrap, {
                            display: 'block',
                            position: 'relative',
                            '-webkit-box-sizing': 'border-box',
                            '-moz-box-sizing': 'border-box',
                            'box-sizing': 'border-box',
                            'will-change': 'transform',
                            'pointer-events': 'auto',
                        }
                    );
                    for (let i = 0; i < this.wrap.children.length; ++i)
                        this.items.push(this.wrap.children[i].cloneNode(true));
                }
            }
        } catch(e){ return }
    }
    update(){
        let updatePage = this.config.page;
        if( updatePage >= this.config.total ) updatePage = updatePage-1;
        if( updatePage < 0 ) updatePage = 0;
        this.setState({
            page:updatePage,
            total:this.config.total
        });
    }
    getPage(){
        if( this.config.side === 'next' ) {
            if(this.config.page<this.config.total) this.config.page++;
            if(!this.config.infinity&&this.config.page>=this.config.total-1) this.config.page = this.config.total-1;
        } else {
            if(this.config.page>-1) this.config.page--;
            if(!this.config.infinity&&this.config.page<0) this.config.page = 0;
        }
        this.update();
    }
    itemAlign(){
        this.config.total = Math.ceil(this.props.data.length/this.config.view);
        this.config.itemWidth = this.config.parentWidth/this.config.view;
        if(!this.config.swipe||!this.items.length) return;

        for( let i=0;i<this.items.length;++i)
            this.setStyle(this.wrap.children[i], this.applyStyle().style.item );

        for( let i=0; i<this.config.total;++i ){
            let itemgroup = [];
            for( let s=0; s<this.config.view;++s) {
                let cnt =i*this.config.view+s,
                    item = this.items[cnt];
                if(cnt<this.wrap.children.length) {
                    itemgroup.push({left: item.offsetLeft || this.config.itemWidth*cnt , page: i, index: cnt});
                }
            }
            if(itemgroup.length) this.config.posx.push(itemgroup);
        }
        for( let i=0;i<this.config.view;++i) this.copyItems(i,'next');
        for( let i=this.items.length-1;i>(this.items.length-1)-this.config.view;--i) this.copyItems(i,'prev');

        this.update();
        this.moveX(0)
    }
    copyItems( index, side ) {
        if(!this.config.infinity) return;
        let item = this.items[index].cloneNode(true);
        this.setStyle(item,this.applyStyle().style.item);
        if(side==="next") {
            this.wrap.append( item );
        } else {
            this.wrap.insertBefore( item, this.wrap.firstChild );
        }
    }
    setStyle(target,style){
        if(!style || typeof style !== 'object') return;
        for( let i in style ) target['style'][i] = style[i];
    }
    applyStyle(){
        let css = {
            style:{
                container:{
                    //whiteSpace :'normal',
                    //display:'table',
                    width:this.config.itemWidth*this.config.total+'px'
                },
                item:{
                    width:this.config.itemWidth+'px',
                    display:'inline-block',
                    textAlign:'center',
                    'WebkitBoxSizing':'border-box',
                    'MozBoxSizing':'border-box',
                    'boxSizing':'border-box'
                }
            }
        }
        return css;
    }
    getEasing( easing, posx ) {
        return easing ? {
            '-webkit-transition': '-webkit-transform '+this.config.duration+'ms '+this.cbz( this.config.easing ),
            '-moz-transition': '-moz-transform '+this.config.duration+'ms '+this.cbz( this.config.easing ),
            '-o-transition': '-o-transform '+this.config.duration+'ms '+this.cbz( this.config.easing ),
            'transition': 'transform '+this.config.duration+'ms '+this.cbz( this.config.easing ),
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
    setPox(pos){
        this.setStyle( this.wrap, this.getEasing(true,pos) );
        this.config.movePos = pos;
    }
    moveX( index, easing, apply ){
        let posx;
        if( index>-1&&index<this.config.total) {
            posx = -(this.config.parentWidth+this.config.posx[index][0].left);
            if(index===this.config.total-1){
                let basew = this.wrap.children[0].clientWidth;
                posx = -(basew+this.config.posx[index][this.config.posx[index].length-1].left);
            }
        } else {
            if( index === this.config.total ) {
                posx = -(this.wrap.scrollWidth-this.pwrap.clientWidth);
            } else {
                if (index < 0) posx = 0;
                if (index > this.config.total - 1) posx = -(this.wrap.scrollWidth - this.config.parentWidth);
            }
        }

        this.setStyle( this.wrap, this.getEasing(easing,posx) );
        this.config.movePos = posx;
        if(apply) this.config.page = index;
    }
    controlEvt=(type)=>{
        switch(type){
            case "next":
                this.config.side="next";
                this.draging(window.innerWidth/2,true);
                break;
            case "prev":
                this.config.side="prev";
                this.draging(window.innerWidth/2,true);
                break;
            default:
                if(typeof type !== 'number') return;
                this.moveX(type,true,true);
                this.update();
        }
    }
    resizeEventFun=(e)=>{
        console.log(e);
    }
    render(){
        return(
            <this.props.tmpl
                {...this.props}
                ref={this.ref}
                refid={this.refid}
                config={this.state}
                control={this.controlEvt}/>
        )
    }
}