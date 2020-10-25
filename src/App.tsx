import React from 'react';
import Pipeline from './components/pipeline/pipeline';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { initialState, rootReducer } from './store/store';

const store = createStore(rootReducer, initialState);

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Pipeline />
      </Provider>
    );
  }
}

export default App;
