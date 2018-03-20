/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
import React, { Component } from 'react';
import './slidertmpl.css';
import storeTypes from '../../lib/store/storetypes';

export default class SliderTempl extends Component {
    currentItem=()=>{
        this.props.store.dispatch({type:storeTypes.TOUCH_COUNT, addBy:this.props.cat})
    }
    render(){
        return (
            <div className="item" onClick={this.currentItem}>[{this.props.cat}] {this.props.title}</div>
        )
    }
}