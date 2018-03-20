export interface SwipeVieWInterface {
    itemAlign() : void;
    dragInit() : void;
    dragEvent(e) : void;
    draging(posx,end) : void;
    reset() : void;
}