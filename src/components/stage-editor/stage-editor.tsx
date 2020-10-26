import React from 'react';
import { connect } from 'react-redux';

import './stage-editor.css';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState
} from '../../store/store';
import Stage from '../../models/stage';
import SchemaType from '../../models/schema';
import Loading from '../loading/loading';
import Schema, { SAMPLING_STATES } from '../schema/schema';

type StateProps = {
  activeStage: number;
  stages: Stage[];
  errorAnalyzingDocumentsSchema: string;
  hasAnalyzedSchema: boolean;
  isAnalyszingSchema: boolean;
  sampleDocumentsSchema: SchemaType;
};

type DispatchProps = {
  updateStore: (update: any) => void;
};


class StageEditor extends React.Component<StateProps & DispatchProps> {  
  render() {
    const {
      // activeStage,
      hasAnalyzedSchema,
      isAnalyszingSchema,
      sampleDocumentsSchema,
      // stages
    } = this.props;

    if (isAnalyszingSchema || !hasAnalyzedSchema) {
      return <Loading />;
    }

    return (
      <div className="stage-editor-container">
        <Schema
          samplingState={SAMPLING_STATES.complete}
          schema={sampleDocumentsSchema}
        />
        <div>
          {/* <pre>
            Sample docs Schema: {JSON.stringify(sampleDocumentsSchema, null, 2)}
          </pre> */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const currentStage = state.stages[state.activeStage];

  return {
    activeStage: state.activeStage,
    stages: state.stages,
    errorAnalyzingDocumentsSchema: currentStage.errorAnalyzingDocumentsSchema,
    hasAnalyzedSchema: currentStage.hasAnalyzedSchema,
    isAnalyszingSchema: currentStage.isAnalyszingSchema,
    sampleDocumentsSchema: currentStage.sampleDocumentsSchema
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
