/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
export interface SwipeVieWInterface {
    itemAlign() : void;
    dragInit() : void;
    dragEvent(e) : void;
    draging(posx,end) : void;
    reset() : void;
}