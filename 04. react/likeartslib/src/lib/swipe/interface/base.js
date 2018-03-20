export interface SwipeBaseInterface {
    ref : string;
    refid : string;
    items : array;
    cbz : Function;
    resizeEvent : boolean;
    dragevent : boolean;
    wrap : element;
    pwrap : element;
    config : object;

    update() : void;
    getPage() : void;
    itemAlign() : void;
    copyItems(index,side) : void;
    setStyle(target,style) : void;
    applyStyle(apply) : object;
    getEasing(easing,posx) : object;
    moveX(pos) : void;
    controlEvt(type) : void;
}