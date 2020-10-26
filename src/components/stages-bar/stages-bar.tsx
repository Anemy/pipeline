import classnames from 'classnames';
import React from 'react';
// import Resizable from 're-resizable';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faExpandAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import { AppState, NO_ACTIVE_STAGE } from '../../store/store';
import DataSource from '../../models/data-source';
import Stage, { STAGES } from '../../models/stage';

import './stage-bar.css';

type StateProps = {
  activeStage: number,
  dataSource: DataSource,
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class StagesBar extends React.Component<StateProps & DispatchProps> {
  addNewStage = (): void => {
    this.props.updateStore({
      activeStage: this.props.stages.length,
      stages: [
        ...this.props.stages,
        new Stage(STAGES.FILTER)
      ]
    });
  };

  onDataSourceClicked = (): void => {
    alert('data source clicked');
  };

  onDeleteStageClicked = (stageIndexToDelete: number): void => {
    const {
      activeStage,
      stages
    } = this.props;

    let newActiveStage = activeStage;

    if (activeStage === stageIndexToDelete) {
      if (stages.length === 1) {
        newActiveStage = NO_ACTIVE_STAGE;
      } else if (stages.length - 1 === activeStage) {
        newActiveStage = stages.length - 2;
      }
    }

    const newStages = [...stages];
    newStages.splice(stageIndexToDelete, 1);

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  }

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

  renderDataSource = (): React.ReactNode => {
    const {
      dataSource
    } = this.props;

    return (
      <div
        className={classnames({
          'stages-bar-data-source': true
        })}
        onClick={() => this.onDataSourceClicked()}
      >
        Datasource: {dataSource.database}.{dataSource.collection}
      </div>
    );
  }

  renderStages = (): React.ReactNode => {
    const {
      activeStage,
      stages
    } = this.props;

    return (
      <React.Fragment>
        {stages.map((stage, stageIndex) => (
          <div
            className="stages-bar-stage-container"
            key={`${stageIndex}-${stage.type}`}
          >
            <FontAwesomeIcon
              className="stages-bar-stage-arrow-right"
              icon={faArrowRight}
            />
            <div
              className={classnames({
                'stages-bar-stage': true,
                'stages-bar-stage-is-active': stageIndex === activeStage
              })}
              onClick={() => this.onStageClicked(stageIndex)}
            >
              <div>
                Stage: {stage.type}
              </div>
              <FontAwesomeIcon
                onClick={() => this.onDeleteStageClicked(stageIndex)}
                className="stages-bar-stage-delete-button"
                icon={faTimes}
              />
            </div>
          </div>
        ))}
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className="stages-bar-container">
        <div className="stages-bar-stages-area">
          {this.renderDataSource()}
          {this.renderStages()}
          <button
            onClick={this.addNewStage}
          >
            +
          </button>
          <div className="stages-bar-stages-empty-space" />
          <button
            className="stages-bar-expand-button"
            onClick={this.onExpandClicked}
          >
            <FontAwesomeIcon
              icon={faExpandAlt}
            />
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
    activeStage: state.activeStage,
    dataSource: state.dataSource,
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
