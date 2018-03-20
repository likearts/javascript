/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
export interface SliderInterface {
    draging(x,e) : void;
    clickEvent(e) : void;
    resizeEvent() : void;
    dragEventHandler() : void;
}