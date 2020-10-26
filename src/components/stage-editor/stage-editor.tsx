import React from 'react';
import { connect } from 'react-redux';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState
} from '../../store/store';
import Stage from '../../models/stage';

import './stage-editor.css';

type StateProps = {
  activeStage: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};


class StageEditor extends React.Component<StateProps & DispatchProps> {  
  render() {
    const { activeStage, stages } = this.props;

    return (
      <div className="stage-editor-container">
        <div>
          Stage Editor
        </div>
        <div>
          Stage: {stages[activeStage].type}
        </div>
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
