import React from 'react';
// import Resizable from 're-resizable';
import { connect } from 'react-redux';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import { AppState } from '../../store/store';
import Stage, { STAGES } from '../models/stage';

import './stage-bar.css';

type StateProps = {
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class StagesBar extends React.Component<StateProps & DispatchProps> {
  addNewStage = (): void => {
    alert('new stage');
    this.props.updateStore({
      stages: [
        ...this.props.stages,
        new Stage(STAGES.FILTER)
      ]
    })
  }

  onStageClicked = (): void => {
    alert('stage clicked');
  }

  renderStages = (): React.ReactNode => {
    const { stages } = this.props;

    return (
      <React.Fragment>
        {stages.map(stage => (
          <div
            className="stages-bar-stage"
            onClick={this.onStageClicked}
          >
            Stage: {stage.type}
          </div>
        ))}
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="stages-bar-container">
        Stages Bar
        <div>
          {this.renderStages()}
          <button
            onClick={this.addNewStage}
          >
            +
          </button>
          <button
            onClick={this.addNewStage}
          >
            Expand
          </button>
        </div>
        <button
          onClick={this.addNewStage}
        >
          Run
        </button>
        <button
          onClick={this.addNewStage}
        >
          Export
        </button>
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

export default connect(mapStateToProps, mapDispatchToProps)(StagesBar);
