import React from 'react';
import { connect } from 'react-redux';
import parseSchema from 'mongodb-schema';

import './stage-editor.css';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState
} from '../../store/store';
import Stage, { STAGES } from '../../models/stage';
import SchemaType, { placeHolderSchema } from '../../models/schema';
import Loading from '../loading/loading';
import Schema, { SAMPLING_STATES } from '../schema/schema';
import AggregateEditor from '../aggregate-editor/aggregate-editor';

type StateProps = {
  activeStage: number;
  activeStageType: STAGES;
  documentsAreUpToDate: boolean;
  errorAnalyzingDocumentsSchema: string;
  hasAnalyzedSchema: boolean;
  isAnalyszingSchema: boolean;
  sampleDocuments: any[];
  sampleDocumentsSchema: SchemaType;
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
      stages[activeStage].hasLoadedSampleDocuments &&
      !stages[activeStage].hasAnalyzedSchema &&
      !stages[activeStage].isAnalyszingSchema
    ) {
      this.analyzeSchemaOfSampleDocuments();
    }
  }

  analyzeSchemaOfSampleDocuments = () => {
    const {
      sampleDocuments
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
      parseSchema(sampleDocuments, (err: Error, schema: SchemaType) => {
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

  onClickRefreshDocs = () => {
    const {
      activeStage,
      stages
    } = this.props

    const updatedStages = [...stages];
    updatedStages[activeStage].hasLoadedSampleDocuments = false;
    updatedStages[activeStage].hasAnalyzedSchema = false;

    this.props.updateStore({
      stages: updatedStages
    });
  };

  renderSchemaEditor() {
    const {
      // activeStage,
      documentsAreUpToDate,
      sampleDocumentsSchema,
      // stages
    } = this.props;

    return (
      <div className="stage-editor-container">
        {!documentsAreUpToDate && (
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
    documentsAreUpToDate: currentStage.documentsAreUpToDate,
    errorAnalyzingDocumentsSchema: currentStage.errorAnalyzingDocumentsSchema,
    hasAnalyzedSchema: currentStage.hasAnalyzedSchema,
    isAnalyszingSchema: currentStage.isAnalyszingSchema,
    sampleDocuments: currentStage.sampleDocuments,
    sampleDocumentsSchema: currentStage.sampleDocumentsSchema,
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
