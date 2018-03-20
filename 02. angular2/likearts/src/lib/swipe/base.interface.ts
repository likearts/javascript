export interface HwSwipeBaseInterface {
  config? :object;
  dragevent? :boolean
  items? :Array<any>;
  swipeID? :string;
  setStyle( target:any, style:any ):void;
  addClass( target:any, name:string ):void;
  getClass( target:any, name:string ):boolean;
  getConfig(name:string, val:string ):any;
}
