import React from 'react';
import { connect } from 'react-redux';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState,
  NO_ACTIVE_STAGE
} from '../../store/store';
import Stage from '../models/stage';

import './stage-editor.css';

import SampleDocuments from '../sample-documents/sample-documents';
import StageControls from '../stage-controls/stage-controls';

type StateProps = {
  activeStage: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};


class StageEditor extends React.Component<StateProps & DispatchProps> {
  renderNoActiveStage() {
    return (
      <div className="stage-editor-empty-state">
        No active stage, please choose one from above
      </div>
    );
  }
  
  render() {
    const { activeStage, stages } = this.props;

    const hasValidStageSelected = activeStage !== NO_ACTIVE_STAGE && !!stages[activeStage];

    return (
      <div className="stage-editor-container">
        Stage Editor
        {!hasValidStageSelected && this.renderNoActiveStage()}
        {hasValidStageSelected && <SampleDocuments />}
        {hasValidStageSelected && <StageControls />}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    activeStage: state.activeStage,
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

export default connect(mapStateToProps, mapDispatchToProps)(StageEditor);
