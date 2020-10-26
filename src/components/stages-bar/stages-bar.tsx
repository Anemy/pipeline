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
      activeStage: this.props.stages.length,
      stages: [
        ...this.props.stages,
        new Stage(STAGES.FILTER)
      ]
    });
  };

  onExpandClicked = (): void => {
    this.props.updateStore({
      showGraph: true
    });
  };

  onExportClicked = (): void => {
    alert('export clicked');
  };

  onRunClicked = (): void => {
    alert('run clicked');
  };

  onStageClicked = (stageIndex: number): void => {
    this.props.updateStore({
      activeStage: stageIndex
    });
  };

  renderStages = (): React.ReactNode => {
    const { stages } = this.props;

    return (
      <React.Fragment>
        {stages.map((stage, stageIndex) => (
          <div
            className="stages-bar-stage"
            onClick={() => this.onStageClicked(stageIndex)}
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
        <div className="stages-bar-stages-area">
          {this.renderStages()}
          <button
            onClick={this.addNewStage}
          >
            +
          </button>
          <button
            className="stages-bar-expand-button"
            onClick={this.onExpandClicked}
          >
            Expand
          </button>
        </div>
        <button
          onClick={this.onRunClicked}
        >
          Run
        </button>
        <button
          onClick={this.onExportClicked}
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
