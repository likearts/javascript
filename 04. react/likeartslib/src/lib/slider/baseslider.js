import React, { Component } from 'react';
import BaseInterface from './interface.base';
import Easing from '../easing/easing';

export default class BaseSlider extends Component implements BaseInterface {
    cbz = Easing.cubicbezier;
    windowInitW=0;

    constructor(props){
        super(props);
        this.state={
            data:this.props.data || [],
            tmpl:this.props.tmpl || null
        }
        this.windowInitW = window.innerWidth;
        window.addEventListener( 'resize', (e)=>this.resizeEvent() )
    }
    componentWillMount(){
        this.setState({
            darag:false,
            x:0,
            y:0,
            move:'',
            hold:0,
            transition:false,
            dragX:0,
            duration:this.props.duration || 400,
            upDuration:0,
            easing:this.props.easing,
            touchtime:0,
            autoCenter:this.props.autoCenter,
            transX:0,
            speed:0,
            applyInterval:0,
            ref:'sliderArea'
        });
    }
    componentDidMount(){
        let dragEventList = [ 'touchstart', 'touchmove', 'touchend' ],
            dragTarget = this.refs[this.state.ref];

        this.setStyle( dragTarget, {
            '-moz-box-sizing':'border-box',
            'box-sizing':'border-box',
            'will-change': 'transform',
            'pointer-events': 'auto',
            '-webkit-user-drag' : 'none',
            'touch-action' : 'pan-y',
            'user-select' : 'none',
            '-webkit-font-smoothing': 'antialiased'
        });

        if( this.getListWidth()<=this.refs[this.state.ref].offsetWidth ) return;
        for( let i=0;i<dragEventList.length;++i )
            this.refs[this.state.ref].addEventListener( dragEventList[i], (e)=>this.dragEventHandler(e) );

        if( this.state.autoCenter ) {
            let children = this.refs[this.state.ref].children.length;
            for( let i=0; i<children;++i )
                this.refs[this.state.ref].children[i].addEventListener( 'click', (e)=>this.clickEvent(e) )
        }
        this.setState({drag:true,target:dragTarget});
    }

    setStyle(target,style){
        if(!target||!style) return;
        if(!style || typeof style !== 'object') return;
        for( let i in style ) target['style'][i] = style[i];
    }
    getEasing(easing,posx){
        return easing ? {
            '-webkit-transition': '-webkit-transform '+(this.state.speed||this.state.duration)+'ms '+this.cbz(this.state.easing),
            '-moz-transition': '-moz-transform '+(this.state.speed||this.state.duration)+'ms '+this.cbz(this.state.easing),
            'transition': 'transform '+(this.state.speed||this.state.duration)+'ms '+this.cbz(this.state.easing),
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
    getListWidth(){
        let scrollWidth = this.refs[this.state.ref].scrollWidth;
        if( scrollWidth > this.getContainerWidth() ) scrollWidth += Number( this.state.marginRight || 0 );
        return scrollWidth;
    }
    getContainerWidth() {
        let limit = window.innerWidth;
        try { limit = this.refs[this.state.ref].offsetWidth } catch(e){}
        return limit;
    }
    setPox(pox){
        clearInterval( this.state.applyInterval );
        this.setState({speed:0,hold:pox});
        this.setStyle(this.state.target,this.getEasing(true,pox) )
    }
    render(){
        return (
            <div className={this.state.ref} ref={this.state.ref}>
                {(this.state.tmpl&&this.state.data.length)?
                    this.state.data.map(item=>(<this.props.tmpl {...this.props} key={item.cat} {...item} />)):""}
            </div>
        )
    }
}