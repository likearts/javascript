import HwSwipeBase from './hwswipebase';
import SwipeVieWInterface from './interface/base';

export default class HwSwipe extends HwSwipeBase implements SwipeVieWInterface {
    componentWillMount(){
        super.componentWillMount();
    }
    componentDidMount(){
        super.componentDidMount();
        this.itemAlign();
        if(this.config.swipe&&!this.dragevent) this.dragInit();
    }
    itemAlign(){
        super.itemAlign();
        if( this.wrap.children.length <= this.config.view ) {
            this.pwrap.removeEventlistener(
                'touchstart', (e)=>this.dragEvent(e)
            );
            this.pwrap.removeEventlistener(
                'touchmove', (e)=>this.dragEvent(e)
            );
            this.pwrap.removeEventlistener(
                'touchend', (e)=>this.dragEvent(e)
            );
            this.dragevent = false;
        }
    }
    dragInit(){
        // 드래그 이벤트 활성화
        this.dragevent = true;
        this.pwrap.addEventListener('touchstart', (e)=>this.dragEvent(e) );
        this.pwrap.addEventListener('touchmove', (e)=>this.dragEvent(e) );
        this.pwrap.addEventListener('touchend', (e)=>this.dragEvent(e) );
    }
    dragEvent(e){
        let touchProps = e.changedTouches[0],
            touchX = touchProps.clientX,
            dy = touchProps.clientY;

        switch( e.type ){
            case "touchstart":
                e.stopPropagation();
                this.config.touchPos = touchX;
                this.config.scrolly = dy;
                break;
            case "touchmove":
                let cpos = this.config.touchPos-touchX,
                    cy = this.config.scrolly-dy;

                if( Math.abs(cy) > 10 && this.config.useScrollPos !== 'X' )
                    this.config.useScrollPos = 'Y'; //위,아래 이동
                if( Math.abs(cpos) > 20 && this.config.useScrollPos !== 'Y' )
                    this.config.useScrollPos = 'X'; //좌,우 이동

                this.config.side = this.config.touchPos < touchX ? 'prev' : 'next';
                if( this.config.useScrollPos !== 'Y' ) {
                    e.preventDefault();
                    this.draging( cpos );
                }
                break;
            case "touchend":
                if(this.config.useScrollPos!=='Y') this.draging( this.config.touchPos-touchX, true );
                else this.setPox( this.config.movePos );
                this.config.touchPos = this.config.scrolly = 0;
                this.config.useScrollPos = '';
                break;
        }
    }
    draging(posx,end){
        if( !Math.abs(posx) || this.config.transition ) return;
        let cposx = this.config.movePos-posx;
        if(end){
            if(Math.abs(posx)<Math.floor(this.config.itemWidth/3)) {
                this.setPox(this.config.movePos);
                return;
            }
            this.config.transition = true;
            this.getPage();
            this.moveX(this.config.page,true);

            setTimeout(()=>{
                // 처음 일경우
                if( this.config.page < 0 ) {
                    this.moveX( this.config.total-1, false );
                    this.config.page = this.config.total-1;
                }
                // 끝일경우
                if( this.config.page > this.config.total-1 ) {
                    this.moveX( 0, false );
                    this.config.page = 0;
                }
                this.config.transition = false;
                super.update();
            }, this.config.duration );
        } else this.setStyle( this.wrap,this.getEasing(end,cposx) );
    }
    reset(){
        if(!this.items.length) return;
        this.wrap.innerHTML= "";
        for( let i=0; i<this.items.length;++i) this.wrap.appendChild( this.items[i] );
        this.componentDidMount();
    }
    resizeEventFun=(e)=>{
        console.log('resize')
        this.reset();
    }
}