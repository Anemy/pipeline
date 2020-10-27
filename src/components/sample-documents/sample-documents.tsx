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
  sampledCount: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

const MAX_DOCS_CAN_SHOW = 10;

class SampleDocuments extends React.Component<StateProps & DispatchProps> {
  renderSampleDocuments() {
    const {
      documents
    } = this.props;

    return documents.map((document, documentIndex) => documentIndex < MAX_DOCS_CAN_SHOW && (
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
      hasLoadedSampleDocuments,
      sampledCount
    } = this.props;

    if (isLoadingSampleDocuments || !hasLoadedSampleDocuments) {
      return <div className="sample-documents-container">
        <Loading />
      </div>;
    }

    return (
      <div className="sample-documents-container">
        <div>Showing {sampledCount > MAX_DOCS_CAN_SHOW ? `first ${MAX_DOCS_CAN_SHOW} of ${sampledCount}` : sampledCount} sample documents</div>
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
    sampledCount: currentStage.sampleDocumentsSchema.count,
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
