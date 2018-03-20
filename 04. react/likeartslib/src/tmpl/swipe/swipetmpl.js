/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
import React, { Component } from 'react';
import './swipetmpl.css';

export default class HwSwipeTmpl extends Component {
    componentDidMount(){}
    itemTmpl(item,index){
        return(
            <div
                key={index}
                className="swipeItem">
                <p>{index}</p>
            </div>
        )
    }
    indicator(item,index){
        return(
            <span
                onClick={()=>this.props.control(index)}
                className={this.props.config.page==index?"indicator_button active":"indicator_button"}
                key={index}>{index}</span>
        )
    }
    render(){
        return (
            <div>
                <div ref={this.props.refid}
                     className={this.props.className}>
                    {this.props.data.map((item,index)=>this.itemTmpl(item,index))}
                </div>
                <div>
                    <button onClick={()=>this.props.control('prev')}>이전</button>
                    <button onClick={()=>this.props.control('next')}>다음</button>
                </div>
                <div>
                    {this.props.data.map((item,index)=>this.indicator(item,index))}
                </div>
                <div>
                    {this.props.config.page+1}/{this.props.config.total}
                </div>
            </div>
        )
    }
}