import { MongoClient } from 'mongodb';
import React from 'react';
import { connect } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import Button from '@leafygreen-ui/button';

import 'react-splitter-layout/lib/index.css';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  DEFAULT_MAX_TIME_MS,
  AppState
} from '../../store/store';
import Stage, {
  NO_ACTIVE_STAGE,
  buildAggregationPipelineFromStages,
  DataSourceStage
} from '../../models/stage';

import './stage-workspace.css';

import SampleDocuments from '../sample-documents/sample-documents';
import StageEditor from '../stage-editor/stage-editor';
import IcebergSeries from '../iceberg/iceberg';
// import { placeHolderSchema } from '../../models/schema';

type StateProps = {
  activeStage: number;
  dataSource: DataSourceStage;
  mongoClient: MongoClient;
  sampleCount: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

type StateType = {
  canvasMeasurements: any;
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// `wait` milliseconds.
const debounce = (func: () => void, wait: number /* ms */) => {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction() { // was ...args here and func
    const later = () => {
      clearTimeout(timeout);
      func();
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const RESIZE_DEBOUNCE_MS = 100;

class StageWorkspace extends React.Component<StateProps & DispatchProps> {
  inactiveStateRef: any;
  debouncedUpdateIcebergDimensions?: () => void;

  state: StateType = {
    canvasMeasurements: undefined
  };

  componentDidMount() {
    if (!this.state.canvasMeasurements && this.inactiveStateRef) {
      const rect = this.inactiveStateRef.getBoundingClientRect();;

      this.setState({
        canvasMeasurements: rect
      });
    }

    this.debouncedUpdateIcebergDimensions = debounce(this.updateIcebergDimensions, RESIZE_DEBOUNCE_MS);
    // debouncedUpdateIcebergDimensions: () => void = debounce(function() , 250);

    window.addEventListener('resize', this.debouncedUpdateIcebergDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedUpdateIcebergDimensions as () => void);
  }

  componentDidUpdate() {
    const {
      activeStage,
      stages
    } = this.props;

    const hasValidStageSelected = activeStage !== NO_ACTIVE_STAGE && !!stages[activeStage];

    if (hasValidStageSelected) {
      if (!this.props.stages[activeStage].sampleDocumentsAreUpToDate || (
        !this.props.stages[activeStage].hasLoadedSampleDocuments &&
        !this.props.stages[activeStage].isLoadingSampleDocuments
      )) {
        this.loadSampleDocuments();
      }
    } else if (!this.state.canvasMeasurements && this.inactiveStateRef) {
      const rect = this.inactiveStateRef.getBoundingClientRect();;

      this.setState({
        canvasMeasurements: rect
      });
    }
  }

  // Don't call this directly, use the debounce so we don't render a lot.
  updateIcebergDimensions = () => {
    if (this.inactiveStateRef && this.inactiveStateRef.getBoundingClientRect) {
      const rect = this.inactiveStateRef.getBoundingClientRect();;

      this.setState({
        canvasMeasurements: rect
      });
    }
  }

  loadSampleDocuments = async () => {
    const {
      activeStage,
      dataSource,
      mongoClient,
      sampleCount
    } = this.props;

    const currentStageId = this.props.stages[this.props.activeStage].id;

    const updatedStages = [...this.props.stages];
    updatedStages[this.props.activeStage].isLoadingSampleDocuments = true;
    updatedStages[this.props.activeStage].hasLoadedSampleDocuments = false;
    updatedStages[this.props.activeStage].sampleDocumentsAreUpToDate = true;
    // updatedStages[this.props.activeStage].hasAnalyzedSchema = false;
    // updatedStages[this.props.activeStage].isAnalyszingSchema = false;
    // updatedStages[this.props.activeStage].sampleDocumentsSchema = {
    //   ...placeHolderSchema
    // };

    this.props.updateStore({
      stages: updatedStages
    });

    // TODO: We need to cover cases here where we just infinite load.
    try {
      const db = mongoClient.db(dataSource.database);

      let stagesToRunInPipeline: Stage[] = [];
      if (activeStage >= 1) {
        stagesToRunInPipeline = updatedStages.slice(1, activeStage + 1);
      }
      const pipeline = buildAggregationPipelineFromStages(
        stagesToRunInPipeline,
        sampleCount
      );

      console.log('Running pipeline:', pipeline);

      // http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#aggregate
      const documents = await db
        .collection(dataSource.collection)
        .aggregate(
          pipeline,
          {
            maxTimeMS: DEFAULT_MAX_TIME_MS
          }
        ).toArray();
      // const documents = await db.collection(dataSource.collection).find().limit(sampleCount).toArray();

      // Ensure we're still looking at the same stage.
      if (this.props.stages[this.props.activeStage].id === currentStageId) {
        const newStages = [...this.props.stages];
        newStages[this.props.activeStage].isLoadingSampleDocuments = false;
        newStages[this.props.activeStage].hasLoadedSampleDocuments = true;
        newStages[this.props.activeStage].sampleDocuments = documents;
        newStages[this.props.activeStage].errorLoadingSampleDocuments = '';

        this.props.updateStore({
          stages: newStages
        });
      }
    } catch (err) {
      // Ensure we're still looking at the same stage.
      if (this.props.stages[this.props.activeStage].id === currentStageId) {
        const newStages = [...this.props.stages];
        newStages[this.props.activeStage].isLoadingSampleDocuments = false;
        newStages[this.props.activeStage].hasLoadedSampleDocuments = true;
        newStages[this.props.activeStage].sampleDocuments = [];
        newStages[this.props.activeStage].errorLoadingSampleDocuments = err.message;

        this.props.updateStore({
          stages: newStages
        });
      }
    }
  };

  renderNoActiveStage() {
    const {
      canvasMeasurements
    } = this.state;

    return (
      <div
        className="stage-workspace-empty-state-container"
        ref={ref => this.inactiveStateRef = ref}
      >
        {canvasMeasurements && <IcebergSeries
          width={canvasMeasurements.width}
          height={canvasMeasurements.height}
        />}
        <div className="stage-workspace-empty-state">
          <div>
            No active stage, create a new one above or
          </div>
          <Button
            variant="primary"
            className="stage-workspace-empty-state-button"
            title="View data source"
            onClick={() => this.props.updateStore({ activeStage: 0 })}
          >
            View data source
          </Button>
        </div>
      </div>
    );
  }

  render() {
    const { activeStage, stages } = this.props;

    const hasValidStageSelected = activeStage !== NO_ACTIVE_STAGE && !!stages[activeStage];

    return (
      <div className="stage-workspace-container">
        {!hasValidStageSelected && this.renderNoActiveStage()}
        {hasValidStageSelected && <div
          className="stage-workspace"
        >
          <SplitterLayout
            percentage
            // onSecondaryPaneSizeChange={this.onWorkspacePanelSizeChange}
            primaryMinSize={10}
            secondaryInitialSize={60}
            secondaryMinSize={10}
          >
            <SampleDocuments />
            <StageEditor />
          </SplitterLayout>
        </div>}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    activeStage: state.activeStage,
    dataSource: state.stages[0] as DataSourceStage,
    mongoClient: state.mongoClient,
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

export default connect(mapStateToProps, mapDispatchToProps)(StageWorkspace);
