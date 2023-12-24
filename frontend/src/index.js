import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router/index';


import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './redux/reducer/globalReducer'

const store = createStore(rootReducer)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={ store }>
      <Router />
    </Provider>
  </React.StrictMode>
);

