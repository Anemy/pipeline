import { MongoClient } from 'mongodb';
import React from 'react';
// import Resizable from 're-resizable';
import { connect } from 'react-redux';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import { AppState } from '../../store/store';
import Loading from '../loading/loading';
import DataSource from '../../models/data-source';
import Stage from '../../models/stage';

import './sample-documents.css';

type StateProps = {
  activeStage: number;
  dataSource: DataSource;
  mongoClient: MongoClient;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class SampleDocuments extends React.Component<StateProps & DispatchProps> {
  state = {
    documents: [],
    errorLoadingDocuments: '',
    isLoading: true
  };

  componentDidMount() {
    this.setState({
      isLoading: false
    });

    this.loadSampleDocuments();

    // var dbo = db.db("mydb");
    // dbo.collection("customers").findOne({}, function(err, result) {
    //   if (err) throw err;
    //   console.log(result.name);
    //   db.close();
    // });
  }

  loadSampleDocuments = async () => {
    const {
      dataSource,
      mongoClient
    } = this.props;

    this.setState({
      errorLoadingDocuments: '',
      isLoading: true
    });

    try {
      const db = mongoClient.db(dataSource.database);

      const documents = await db.collection(dataSource.collection).find().limit(10).toArray();

      this.setState({
        documents
      });
    } catch(err) {
      this.setState({
        errorLoadingDocuments: err.message,
        isLoading: true
      });
    }

    this.setState({
      isLoading: false
    });
  };

  renderSampleDocuments() {
    const {
      documents
    } = this.state;

    return documents.map((document, documentIndex) => (
      <div
        className="sample-documents-document"
        key={`${documentIndex}`}
      >
        <pre>
          {JSON.stringify(document, null, 2)}
        </pre>
      </div>
    ));
  }

  render() {
    const {
      errorLoadingDocuments,
      isLoading
    } = this.state;

    return (
      <div className="sample-documents-container">
        <h4>Sample Documents</h4>
        {isLoading && <Loading />}
        {!isLoading && (
          <React.Fragment>
            {errorLoadingDocuments && <div>
              Error loading sample documents: {errorLoadingDocuments}
            </div>}
            {!errorLoadingDocuments && this.renderSampleDocuments()}
          </React.Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    activeStage: state.activeStage,
    dataSource: state.dataSource,
    mongoClient: state.mongoClient,
    stages: state.stages
  };
};

const mapDispatchToProps: DispatchProps = {
  // Resets URL validation if form was changed.
  updateStore: (update: any): UpdateStoreAction => ({
    type: ActionTypes.UPDATE_STORE,
    update
  })
};

export default connect(mapStateToProps, mapDispatchToProps)(SampleDocuments);
