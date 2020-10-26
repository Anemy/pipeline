import { MongoClient } from 'mongodb';
import React from 'react';
import { connect } from 'react-redux';
// import { Resizable } from 're-resizable';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState,
  NO_ACTIVE_STAGE
} from '../../store/store';
import Stage from '../../models/stage';
import DataSource from '../../models/data-source';

import './stage-workspace.css';

import SampleDocuments from '../sample-documents/sample-documents';
import StageEditor from '../stage-editor/stage-editor';

type StateProps = {
  activeStage: number;
  dataSource: DataSource;
  mongoClient: MongoClient;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

// const resizeableDirections = {
//   top: false,
//   right: true,
//   bottom: false,
//   left: false,
//   topRight: false,
//   bottomRight: false,
//   bottomLeft: false,
//   topLeft: false
// };

class StageWorkspace extends React.Component<StateProps & DispatchProps> {
  componentDidUpdate() {
    const {
      activeStage,
      stages
    } = this.props;

    const hasValidStageSelected = activeStage !== NO_ACTIVE_STAGE && !!stages[activeStage];

    if (hasValidStageSelected) {
      if (!this.props.stages[activeStage].hasLoadedSampleDocuments && !this.props.stages[activeStage].isLoadingSampleDocuments) {
        this.loadSampleDocuments();
      } else if (this.props.stages[activeStage].hasLoadedSampleDocuments &&
        !this.props.stages[activeStage].hasAnalyzedSchema &&
        !this.props.stages[activeStage].isAnalyszingSchema
      ) {
        this.analyzeSchemaOfSampleDocuments();
      }
    }
  }

  analyzeSchemaOfSampleDocuments = () => {

  }

  loadSampleDocuments = async () => {
    const {
      dataSource,
      mongoClient
    } = this.props;

    const currentStageId = this.props.stages[this.props.activeStage].id;

    const updatedStages = [...this.props.stages];
    updatedStages[this.props.activeStage].isLoadingSampleDocuments = true;
    updatedStages[this.props.activeStage].hasLoadedSampleDocuments = false;

    this.props.updateStore({
      stages: updatedStages
    });

    this.setState({
      errorLoadingDocuments: '',
      isLoading: true
    });

    try {
      const db = mongoClient.db(dataSource.database);

      const documents = await db.collection(dataSource.collection).find().limit(10).toArray();

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

      this.setState({
        documents
      });
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
    return (
      <div className="stage-editor-empty-state">
        No active stage, please create a new one or choose one from above.
      </div>
    );
  }

  render() {
    const { activeStage, stages } = this.props;

    const hasValidStageSelected = activeStage !== NO_ACTIVE_STAGE && !!stages[activeStage];

    return (
      <div className="stage-editor-container">
        {!hasValidStageSelected && this.renderNoActiveStage()}
        {hasValidStageSelected && <div
          className="stage-editor-workspace"
        >
          <SampleDocuments />
          <StageEditor />
        </div>}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    activeStage: state.activeStage,
    dataSource: state.dataSource,
    mongoClient: state.mongoClient,
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
