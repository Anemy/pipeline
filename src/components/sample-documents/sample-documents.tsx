import React from 'react';
// import Resizable from 're-resizable';
import { connect } from 'react-redux';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import { AppState } from '../../store/store';
import Stage from '../models/stage';

import './sample-documents.css';

type StateProps = {
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class SampleDocuments extends React.Component<StateProps & DispatchProps> {
  render() {
    return (
      <div className="stages-bar-container">
        Sample Documents
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
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
