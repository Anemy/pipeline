import classnames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faExpandAlt,
  faPlus,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import smalltalk from 'smalltalk';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState
} from '../../store/store';
import Stage, {
  buildAggregationPipelineFromStages,
  getDescriptionForStageType,
  getNewStageForStageType,
  getNiceStageNameForStageType,
  DATA_SERVICE_STAGE_INDEX,
  NO_ACTIVE_STAGE,
  STAGES,
  DataSourceStage
} from '../../models/stage';

import './stage-bar.css';

type StateProps = {
  activeStage: number,
  dataSourceStage: DataSourceStage,
  sampleCount: number,
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class StagesBar extends React.Component<StateProps & DispatchProps> {
  state = {
    isChoosingNewStage: false
  };

  componentWillUnmount() {
    if (this.state.isChoosingNewStage) {
      window.removeEventListener('click', this.handleWindowClick);
    }
  }

  handleWindowClick = (event: any) => {
    if (!event.target.classList.contains('.stages-bar-add-new-stage-dropdown')) {
      this.setState({
        isChoosingNewStage: false
      });
      window.removeEventListener('click', this.handleWindowClick);
    }
  }

  onClickAddNewStage = (): void => {
    if (this.state.isChoosingNewStage) {
      return;
    }

    this.setState({
      isChoosingNewStage: true
    });

    setImmediate(() => {
      window.addEventListener('click', this.handleWindowClick);
    });
  };

  onClickAddStageOption = (newStageType: STAGES): void => {
    this.setState({
      isChoosingNewStage: false
    });

    if (newStageType === STAGES.DATA_SOURCE) {
      alert('Coming soon.');
      return;
    }

    this.props.updateStore({
      activeStage: this.props.stages.length,
      stages: [
        ...this.props.stages,
        getNewStageForStageType(newStageType)
      ]
    });
  };

  onDataSourceClicked = (): void => {
    this.props.updateStore({
      activeStage: DATA_SERVICE_STAGE_INDEX
    });
  };

  onDeleteStageClicked = (e: React.MouseEvent, stageIndexToDelete: number): void => {
    e.preventDefault();
    e.stopPropagation();

    const {
      activeStage,
      stages
    } = this.props;

    let newActiveStage = activeStage;

    if (activeStage === stageIndexToDelete) {
      if (stages.length - 1 === activeStage) {
        newActiveStage = activeStage - 1;
      }
    } else if (stageIndexToDelete < activeStage) {
      newActiveStage--;
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
    const {
      activeStage,
      sampleCount,
      stages
    } = this.props;

    let stagesToRunInPipeline: Stage[] = [];
    if (activeStage >= 1) {
      stagesToRunInPipeline = stages.slice(1);
    }
    const pipeline = buildAggregationPipelineFromStages(
      stagesToRunInPipeline,
      sampleCount
    );

    smalltalk
      .alert('Here\'s the pipline:', JSON.stringify(pipeline, null, 2))
      .then(() => { })
      .catch(() => { });
  };

  onRunClicked = (): void => {
    const {
      activeStage,
      stages
    } = this.props

    if (activeStage === NO_ACTIVE_STAGE) {
      this.props.updateStore({
        activeStage: DATA_SERVICE_STAGE_INDEX
      });
    } else {
      const hasValidStageSelected = activeStage !== NO_ACTIVE_STAGE && !!stages[activeStage];

      let newActiveStage = activeStage;

      if (!hasValidStageSelected) {
        newActiveStage = stages.length - 1;
      }

      // Reset docs in the current stage to ensure we run.
      const updatedStages = [...stages];
      updatedStages[activeStage].hasLoadedSampleDocuments = false;
      updatedStages[activeStage].hasAnalyzedSchema = false;

      this.props.updateStore({
        activeStage: newActiveStage,
        stages: updatedStages
      });
    }
  };

  onStageClicked = (stageIndex: number): void => {
    this.props.updateStore({
      activeStage: stageIndex
    });
  };

  renderDataSource = (): React.ReactNode => {
    const {
      activeStage,
      dataSourceStage
    } = this.props;

    return (
      <div
        className={classnames({
          'stages-bar-data-source': true,
          'stages-bar-data-source-is-selected': activeStage === DATA_SERVICE_STAGE_INDEX
        })}
        onClick={() => this.onDataSourceClicked()}
      >
        Datasource: {dataSourceStage.database}.{dataSourceStage.collection}
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
        {stages.map((stage, stageIndex) => (stageIndex > 0 && (
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
                'stages-bar-stage-is-selected': stageIndex === activeStage
              })}
              onClick={() => this.onStageClicked(stageIndex)}
            >
              <div>
                {getNiceStageNameForStageType(stage.type)}
              </div>
              <FontAwesomeIcon
                onClick={(e) => this.onDeleteStageClicked(e, stageIndex)}
                className="stages-bar-stage-delete-button"
                icon={faTimes}
              />
            </div>
          </div>
        )))}
      </React.Fragment>
    );
  }

  renderStageOptions() {
    return (
      <div
        className="stages-bar-add-new-stage-dropdown"
      >
        {Object.keys(STAGES).map((stage: string, i: number) => (
          <a
            className="stages-bar-add-new-stage-option"
            onClick={() => this.onClickAddStageOption(stage as STAGES)}
            key={`${stage}`}
          >
            <div
              className="stages-bar-add-new-stage-option-text"
            >
              {getNiceStageNameForStageType(stage as STAGES)}
            </div>
            <div className="stages-bar-add-new-stage-info-hover">
              {getDescriptionForStageType(stage as STAGES)}
            </div>
          </a>
        ))}
      </div>
    );
  }

  render() {
    const {
      isChoosingNewStage
    } = this.state;

    return (
      <div className="stages-bar-container">
        <div className="stages-bar-stages-area">
          {this.renderDataSource()}
          {this.renderStages()}
          <div className="stages-bar-add-new-stage-area">
            <button
              className="stages-bar-add-stage-button"
              onClick={this.onClickAddNewStage}
            >
              <FontAwesomeIcon
                icon={faPlus}
              />
            </button>
            {isChoosingNewStage && this.renderStageOptions()}
          </div>
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
    dataSourceStage: state.stages[0] as DataSourceStage,
    sampleCount: state.sampleCount,
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
