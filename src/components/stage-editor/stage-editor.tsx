import { MongoClient } from 'mongodb';
import React from 'react';
import { connect } from 'react-redux';
import parseSchema from 'mongodb-schema';

import './stage-editor.css';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  DEFAULT_MAX_TIME_MS,
  AppState
} from '../../store/store';
import Stage, {
  DataSourceStage,
  STAGES,
  buildAggregationPipelineFromStages
} from '../../models/stage';
import SchemaType, {
  placeHolderSchema
} from '../../models/schema';
import Loading from '../loading/loading';
import Schema, { SAMPLING_STATES } from '../schema/schema';
import AggregateEditor from '../aggregate-editor/aggregate-editor';

type StateProps = {
  activeStage: number;
  activeStageType: STAGES;
  dataSource: DataSourceStage;
  errorAnalyzingDocumentsSchema: string;
  hasAnalyzedSchema: boolean;
  isAnalyszingSchema: boolean;
  mongoClient: MongoClient;
  sampleCount: number;
  sampleDocumentsSchema: SchemaType;
  schemaDocumentsAreUpToDate: boolean;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class StageEditor extends React.Component<StateProps & DispatchProps> { 
  componentDidUpdate() {
    const {
      activeStage,
      stages
    } = this.props;

    if (
      !stages[activeStage].hasAnalyzedSchema &&
      !stages[activeStage].isAnalyszingSchema
    ) {
      this.analyzeSchemaOfSampleDocuments();
    }
  }

  asyncParseSchema = (sampleDocuments: any[]): Promise<SchemaType> => {
    return new Promise(
      (resolve, reject) => parseSchema(sampleDocuments, (
        err: Error,
        schema: SchemaType
      ) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(schema);
      })
    );
  }

  analyzeSchemaOfSampleDocuments = async () => {
    const {
      activeStage,
      dataSource,
      mongoClient,
      sampleCount
    } = this.props;

    const currentStageId = this.props.stages[this.props.activeStage].id;

    const updatedStages = [...this.props.stages];
    updatedStages[this.props.activeStage].isAnalyszingSchema = true;
    updatedStages[this.props.activeStage].hasAnalyzedSchema = false;
    updatedStages[this.props.activeStage].schemaDocumentsAreUpToDate = true;

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
      const db = mongoClient.db(dataSource.database);

      let stagesToRunInPipeline: Stage[] = [];
      if (activeStage >= 1) {
        stagesToRunInPipeline = updatedStages.slice(1, activeStage);
      }
      const pipeline = buildAggregationPipelineFromStages(
        stagesToRunInPipeline,
        sampleCount
      );
      
      console.log('Loading schema using pipeline:', pipeline);

      const sampleDocuments = await db
        .collection(dataSource.collection)
        .aggregate(
          pipeline,
          {
            maxTimeMS: DEFAULT_MAX_TIME_MS
          }
        ).toArray();

      const schema: SchemaType = await this.asyncParseSchema(sampleDocuments);

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
    } catch (err) {
      // Ensure we're still looking at the same stage.
      if (this.props.stages[this.props.activeStage].id === currentStageId) {
        updateWithError(err);
      }
    }
  }

  onClickRefreshDocs = () => {
    const {
      activeStage,
      stages
    } = this.props

    const updatedStages = [...stages];
    // TODO: Updating sample docs maybe not needed.
    updatedStages[activeStage].hasLoadedSampleDocuments = false;
    updatedStages[activeStage].hasAnalyzedSchema = false;

    this.props.updateStore({
      stages: updatedStages
    });
  };

  renderSchemaEditor() {
    const {
      // activeStage,
      sampleDocumentsSchema,
      schemaDocumentsAreUpToDate
      // stages
    } = this.props;

    return (
      <div className="stage-editor-container">
        {!schemaDocumentsAreUpToDate && (
          <div className="stage-editor-out-of-date-documents">
            Displayed documents are not up to date for this stage, please <a
              className="stage-editor-update-out-of-date-documents-button"
              onClick={this.onClickRefreshDocs}
            >fetch new documents</a> or click the 'Run' button above to retrieve up to date documents.
          </div>
        )}
        <div className="stage-editor-schema">
          <Schema
            samplingState={SAMPLING_STATES.complete}
            schema={sampleDocumentsSchema}
          />
        </div>
        {/* <div>
          <pre>
            Sample docs Schema: {JSON.stringify(sampleDocumentsSchema, null, 2)}
          </pre>
        </div> */}
      </div>
    );
  }

  render() {
    const {
      activeStageType,
      hasAnalyzedSchema,
      isAnalyszingSchema
    } = this.props;

    if (isAnalyszingSchema || !hasAnalyzedSchema) {
      return (
        <div className="stage-editor-container">
          <Loading />
        </div>
      );
    }

    return (
      <div className="stage-editor-container">
        {activeStageType !== STAGES.AGGREGATE && this.renderSchemaEditor()}
        {activeStageType === STAGES.AGGREGATE && <AggregateEditor />}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const currentStage = state.stages[state.activeStage];

  return {
    activeStage: state.activeStage,
    activeStageType: currentStage.type,
    dataSource: state.stages[0] as DataSourceStage,
    errorAnalyzingDocumentsSchema: currentStage.errorAnalyzingDocumentsSchema,
    hasAnalyzedSchema: currentStage.hasAnalyzedSchema,
    isAnalyszingSchema: currentStage.isAnalyszingSchema,
    mongoClient: state.mongoClient,
    sampleCount: state.sampleCount,
    sampleDocumentsSchema: currentStage.sampleDocumentsSchema,
    schemaDocumentsAreUpToDate: currentStage.schemaDocumentsAreUpToDate,
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
