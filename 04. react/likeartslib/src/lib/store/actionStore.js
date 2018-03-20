import { createStore } from 'redux';
import storeTypes from './storetypes';

const storeObserverData = {
    [storeTypes.INCREMENT]:{value:0},
    [storeTypes.TOUCH_COUNT]:{value:'abc'},
}

const counterReducer = ( state = {}, action) => {
    state = storeObserverData[action.type] || { value:null };
    switch (action.type){
        case storeTypes.INCREMENT:
            state.value = state.value + action.addBy;
            return Object.assign({}, state, {value:state.value})
        default:
            return action.addBy ? Object.assign({}, state, {value:action.addBy}) : state;
    }
}

const store = createStore( counterReducer );
export default store;