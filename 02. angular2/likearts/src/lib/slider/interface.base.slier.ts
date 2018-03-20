import { Injectable } from '@angular/core';

Injectable()
export interface BaseSliderInterface {
		config? :Object;
		drag? :Boolean;
		dragEventListener? :Boolean;
		itemsWidth? :Number;
		windowInitW:Number;
		setStyle(target:Element, style:Object): void;
		getConfig(name, val:any):any;
		getListWidth():Number;
		getContainerWidth():Number;
}