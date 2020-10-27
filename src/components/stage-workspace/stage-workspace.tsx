import { MongoClient } from 'mongodb';
import React from 'react';
import { connect } from 'react-redux';
import SplitterLayout from 'react-splitter-layout';
import parseSchema from 'mongodb-schema';

import 'react-splitter-layout/lib/index.css';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState,
  NO_ACTIVE_STAGE
} from '../../store/store';
import Stage, { buildAggregationPipelineFromStages } from '../../models/stage';
import DataSource from '../../models/data-source';
import Schema, { placeHolderSchema } from '../../models/schema';

import './stage-workspace.css';

import SampleDocuments from '../sample-documents/sample-documents';
import StageEditor from '../stage-editor/stage-editor';

const DEFAULT_MAX_TIME_MS = 10000;

type StateProps = {
  activeStage: number;
  dataSource: DataSource;
  documents: any[];
  mongoClient: MongoClient;
  sampleCount: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class StageWorkspace extends React.Component<StateProps & DispatchProps> {
  componentDidUpdate() {
    const {
      activeStage,
      stages
    } = this.props;

    const hasValidStageSelected = activeStage !== NO_ACTIVE_STAGE && !!stages[activeStage];

    if (hasValidStageSelected) {
      if (
        !this.props.stages[activeStage].hasLoadedSampleDocuments &&
        !this.props.stages[activeStage].isLoadingSampleDocuments
      ) {
        this.loadSampleDocuments();
      } else if (
        this.props.stages[activeStage].hasLoadedSampleDocuments &&
        !this.props.stages[activeStage].hasAnalyzedSchema &&
        !this.props.stages[activeStage].isAnalyszingSchema
      ) {
        this.analyzeSchemaOfSampleDocuments();
      }
    }
  }

  analyzeSchemaOfSampleDocuments = () => {
    const {
      documents
    } = this.props;

    const currentStageId = this.props.stages[this.props.activeStage].id;

    const updatedStages = [...this.props.stages];
    updatedStages[this.props.activeStage].isAnalyszingSchema = true;
    updatedStages[this.props.activeStage].hasAnalyzedSchema = false;

    this.props.updateStore({
      stages: updatedStages
    });

    const updateWithError = (err: Error) => {
      const newStages = [...this.props.stages];
      newStages[this.props.activeStage].isAnalyszingSchema = false;
      newStages[this.props.activeStage].hasAnalyzedSchema = true;
      newStages[this.props.activeStage].sampleDocumentsSchema = placeHolderSchema;
      newStages[this.props.activeStage].errorAnalyzingDocumentsSchema = err.message;

      this.props.updateStore({
        stages: newStages
      });
    };

    // TODO: We need to cover cases here where we just infinite load.
    try {
      parseSchema(documents, (err: Error, schema: Schema) => {
        if (err) {
          updateWithError(err);
          return;
        }

        // Ensure we're still looking at the same stage.
        if (this.props.stages[this.props.activeStage].id === currentStageId) {
          const newStages = [...this.props.stages];
          newStages[this.props.activeStage].isAnalyszingSchema = false;
          newStages[this.props.activeStage].hasAnalyzedSchema = true;
          newStages[this.props.activeStage].sampleDocumentsSchema = schema;
          newStages[this.props.activeStage].errorAnalyzingDocumentsSchema = '';

          this.props.updateStore({
            stages: newStages
          });
        }
      });
    } catch (err) {
      // Ensure we're still looking at the same stage.
      if (this.props.stages[this.props.activeStage].id === currentStageId) {
        updateWithError(err);
      }
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

    this.props.updateStore({
      stages: updatedStages
    });

    // TODO: We need to cover cases here where we just infinite load.
    try {
      const db = mongoClient.db(dataSource.database);

      let stagesToRunInPipeline: Stage[] = [];
      if (activeStage >= 1) {
        stagesToRunInPipeline = updatedStages.slice(1, activeStage);
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

  // onWorkspacePanelSizeChange = (newWidth: number) => {
  //   console.log('New panel size:', newWidth);
  // }

  renderNoActiveStage() {
    return (
      <div className="stage-workspace-empty-state">
        No active stage, please create a new one or choose one from above.
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
  const hasValidStageSelected = state.activeStage !== NO_ACTIVE_STAGE && !!state.stages[state.activeStage];

  return {
    activeStage: state.activeStage,
    dataSource: state.stages[0] as DataSource,
    documents: hasValidStageSelected ? state.stages[state.activeStage].sampleDocuments : [],
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
