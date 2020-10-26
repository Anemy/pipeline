import React from 'react';
// import Resizable from 're-resizable';
import { connect } from 'react-redux';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import { AppState } from '../../store/store';
import Loading from '../loading/loading';
import Stage from '../../models/stage';

import './sample-documents.css';

type StateProps = {
  activeStage: number;
  errorLoadingSampleDocuments: string;
  documents: any[];
  hasLoadedSampleDocuments: boolean;
  isLoadingSampleDocuments: boolean;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class SampleDocuments extends React.Component<StateProps & DispatchProps> {
  renderSampleDocuments() {
    const {
      documents
    } = this.props;

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
      errorLoadingSampleDocuments,
      isLoadingSampleDocuments,
      hasLoadedSampleDocuments
    } = this.props;

    if (isLoadingSampleDocuments || !hasLoadedSampleDocuments) {
      return <Loading />;
    }

    return (
      <div className="sample-documents-container">
        <h4>Sample Documents</h4>
        {errorLoadingSampleDocuments && <div>
          Error loading sample documents: {errorLoadingSampleDocuments}
        </div>}
        {!errorLoadingSampleDocuments && this.renderSampleDocuments()}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const currentStage = state.stages[state.activeStage];
  
  return {
    activeStage: state.activeStage,
    documents: currentStage.sampleDocuments,
    errorLoadingSampleDocuments: currentStage.errorLoadingSampleDocuments,
    hasLoadedSampleDocuments: currentStage.hasLoadedSampleDocuments,
    isLoadingSampleDocuments: currentStage.isLoadingSampleDocuments,
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
