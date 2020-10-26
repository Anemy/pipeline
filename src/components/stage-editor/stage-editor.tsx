import React from 'react';
import { connect } from 'react-redux';
// import { Resizable } from 're-resizable';

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

// const resizeableDirections = {
//   top: false,
//   right: true,
//   bottom: false,
//   left: false,
//   topRight: false,
//   bottomRight: false,
//   bottomLeft: false,
//   topLeft: false
// };

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
        {!hasValidStageSelected && this.renderNoActiveStage()}
        {hasValidStageSelected && <div
          className="stage-editor-workspace"
        >
          <SampleDocuments />
          <StageControls />
        </div>}
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
