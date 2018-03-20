/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
import React, { Component } from 'react';
import './App.css';
import HwSwipe from './lib/swipe/hwswipe';
import storeTypes from './lib/store/storetypes';
import Hwslider from './lib/slider/hwslider';
import SliderTempl from './tmpl/slider/slidertmpl';
import HwSwipeTmpl from './tmpl/swipe/swipetmpl';

Array.prototype.randomValue = function(){
    return this[Math.floor(Math.random() * this.length)]
}

class App extends Component {
    swipeData = [
          { cat:'react',title:'hwsiwpe - react' },
          { cat:'angular',title:'hwsiwpe - angular' },
          { cat:'ionic',title:'hwsiwpe - ionic' },
          { cat:'typescript',title:'hwsiwpe - typescript' },
          { cat:'native',title:'hwsiwpe - native' },
          { cat:'jquery',title:'hwsiwpe - jquery' },
          { cat:'vue',title:'hwsiwpe - vue' }
    ];
    constructor(props){
        super(props);
        this.state={cnt:0}
    }
    componentDidMount(){
        this.props.store.subscribe(()=>this.updateRender())
    }
    updateRender(){
        // index.js 에서 store.subscribe 미사용시
        //this.setState({cnt:this.props.store.getState().value});
    }
    addCount=()=>this.props.store.dispatch({type:storeTypes.INCREMENT,addBy: 1});
    updateStr=()=>this.props.store.dispatch({type:storeTypes.TOUCH_COUNT,addBy: ['redux','react','angular','vue','native','typescript'].randomValue() });

    render() {
        return (
          <div>
              <h3>{this.state.cnt || this.props.store.getState().value}</h3>
              <div>
                  <button onClick={this.addCount}>add count</button>
                  <button onClick={this.updateStr}>string</button>
              </div>
              <div className="swipecontainer">
                <Hwslider
                    data={this.swipeData}
                    autoCenter={true}
                    store={this.props.store}
                    duration={500}
                    infinity={true}
                    tmpl={SliderTempl}/>
                </div>
              <div>
                  <HwSwipe
                      store={this.props.store}
                      data={this.swipeData}
                      tmpl={HwSwipeTmpl}
                      duration={500}
                      w320={1}
                      w640={2}
                      w900={3}
                      infinity={true}
                      className="swipecontainer"/>
              </div>
          </div>
        );
    }
}

export default App;
