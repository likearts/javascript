/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
import BaseSlider from './baseslider';
import SliderInterface from './interface.slider';

export default class Hwslider extends BaseSlider implements SliderInterface {
    dragEventHandler(e){
        let touchProps = e.changedTouches[0],
            touchX = touchProps.clientX,
            dy = touchProps.clientY;

        if(!this.state.drag) return;
        switch(e.type) {
            case "touchstart":
                e.stopPropagation();
                this.setState({x:touchX,y:dy, touchtime:new Date().getTime()});
                break;
            case "touchmove":
                let cpos = this.state.x -touchX,
                    cy = this.state.y -dy;
                if( Math.abs(cy) > 10 && this.state.move !== 'X' ) this.state.move='Y'; //위,아래 이동
                if( Math.abs(cpos) > 20 && this.state.move !== 'Y' ) this.state.move='X';  //좌,우 이동

                if( this.state.move !== 'Y' ) {
                    e.preventDefault();
                    this.draging( cpos );
                }
                break;
            case "touchend":
                let maxtime = 500,
                    endtime = Math.abs(new Date().getTime()-this.state.touchtime),
                    uptime = endtime-maxtime,
                    uppos = 0,
                    acpos = 0;

                this.state.speed=1500-endtime;

                if( uptime > 0 ) uptime = 0;
                uppos = ( Math.abs(uptime)/maxtime*5);

                if(this.state.speed<this.state.duration) this.state.speed=this.state.duration;
                if(Math.floor(uppos)>0) acpos = uppos * (this.state.x-touchX);
                else acpos = (this.state.x-touchX);

                if(this.state.move!=='Y') this.draging( acpos, true );
                else this.setPox( this.state.hold );

                this.setState({x:0,y:0,move:''});
                break;
            default:;
        }
    }

    draging(x, e){
        if( !Math.abs(x) || this.state.transition ) return;
        let cposx = this.state.hold-x,
            limit = this.getContainerWidth(),
            contWidth = this.getListWidth();
        clearInterval(this.state.applyInterval);

        if(!e) {
            let overX = 0;
            if( cposx > 0 ) {
                overX = Math.abs(cposx)/(limit)*(limit-50);
                cposx = cposx-overX;
            }
            if( cposx < -(contWidth-limit) ) {
                overX = Math.abs(cposx+(contWidth-limit))/(limit)*(limit-50);
                cposx = cposx+overX;
            }
            this.setStyle(this.state.target,this.getEasing(e,cposx));
            this.setState({dragX:cposx});
        }
        else {

            let ease = "easeOutBack",
                endEasing = this.state.easing,
                afterX;

            if( cposx > 0 ) {
                cposx = 0;
                this.setState({easing:ease,speed:400,dragX:cposx});
            }
            if( cposx < -(contWidth-limit) ) {
                afterX = cposx + (contWidth-limit);
                cposx = -(contWidth-limit);
                this.setState({easing:ease,speed:400,dragX:cposx});
            }

            if((this.state.hold>=0&&cposx>=0)||(this.state.hold)<=-(contWidth-limit)&&cposx<=-(contWidth-limit)) this.state.speed=300;
            this.setStyle( this.state.target, this.getEasing(e,cposx) );
            this.setState({hold:cposx,easing:endEasing,speed:this.state.duration});
        }
    }

    clickEvent(e){
        if( e.type !== 'click' || !this.state.autoCenter ) return;

        let children = this.refs[this.state.ref].children.length;
        for( let i=0; i<children;++i) {
            this.refs[this.state.ref].children[i].classList.remove('active');
        }

        let w = this.getContainerWidth(),
            t = e.currentTarget,
            x = t.offsetLeft,
            itemW = t.clientWidth,
            newX = -x+w/2-itemW/2,
            ew = this.getListWidth();

        if( ew < w ) return;
        if( newX > 0 ) newX = 0;
        if( newX < -(ew-w) ) newX = -(ew-w);
        t.classList.add('active');
        this.setPox( newX );
    }

    resizeEvent(){
        let child = this.refs[this.state.ref].children, find = false;

        if(!child.length || Number(this.windowInitW) === Number(window.innerWidth) ) return;
        this.windowInitW = window.innerWidth;
        this.state.drag = false;

        if( this.getListWidth() <= this.getContainerWidth() ) {
            this.setPox(0);
            return;
        } else {
            this.componentWillMount();
            this.setState({drag:true});
        }

        for( let i=0;i<child.length;++i) {
            if(!find && child[i].classList.contains("active")){
                this.clickEvent({
                    type : 'click',
                    currentTarget:child[i]
                });
                find = true;
            }
        }
        if(!find||!this.state.autoCenter) {
            this.setState({transition:false});
            this.draging(-10);
        }
    }
}