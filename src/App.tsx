import { MongoClient } from 'mongodb';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { getInitialState, rootReducer } from './store/store';
import Pipeline from './components/pipeline/pipeline';

class App extends React.Component {
  state = {
    connectingToDataService: true,
    errorConnectingToDataService: ''
  };

  store: any;

  componentDidMount() {
    this.connectToMongodb();
  }

  connectToMongodb = async () => {
    this.setState({
      connectingToDataService: true,
      errorConnectingToDataService: ''
    });

    const connectionUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const client = new MongoClient(connectionUri, {
      useUnifiedTopology: true
    });
    
    try {
      await client.connect();

      const initialState = getInitialState(client);
      this.store = createStore(rootReducer, initialState);
    } catch (err) {
      console.log('unable to connect to mdb:', err);
      this.setState({
        errorConnectingToDataService: err.message
      });
    }
    this.setState({
      connectingToDataService: false
    });
  }

  render() {
    const {
      connectingToDataService,
      errorConnectingToDataService
    } = this.state;

    return (
      <React.Fragment>
        {connectingToDataService && <div className="app-connecting">
          Connecting to database...
        </div>}
        {errorConnectingToDataService && <div className="app-connecting">
          <div>
            Unable to connect to database: {errorConnectingToDataService}
          </div>
          <button onClick={this.connectToMongodb}>
            retry
          </button>
        </div>}
        {/* <Resizable>
          <Graph />
        </Resizable> */}
        {!connectingToDataService && !errorConnectingToDataService && (
          <Provider store={this.store}>
            <Pipeline />
          </Provider>
        )}
      </React.Fragment>
    );
  }
}

export default App;
