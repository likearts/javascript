import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import store from './lib/store/actionStore';

import registerServiceWorker from './registerServiceWorker';

const render= () => { ReactDOM.render(<App store={store} />, document.getElementById('root')); }
store.subscribe(render);
render();
registerServiceWorker();
