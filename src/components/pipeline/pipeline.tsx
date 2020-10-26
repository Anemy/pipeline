import React from 'react';
// import Resizable from 're-resizable';
import { connect } from 'react-redux';

import GraphContainer from '../graph/graph-container';
import StageEditor from '../stage-workspace/stage-workspace';
import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import { AppState } from '../../store/store';

import './pipeline.css';
import StagesBar from '../stages-bar/stages-bar';

// const resizeableDirections = {
//   top: false, // This property is controlled in the component.
//   right: false,
//   bottom: false,
//   left: false,
//   topRight: false,
//   bottomRight: false,
//   bottomLeft: false,
//   topLeft: false
// };

// const defaultGraphClosed = 24;
// const defaultGraphHeightOpened = 240;

type StateProps = {
  showGraph: boolean;
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class Pipeline extends React.Component<StateProps & DispatchProps> {
  render() {
    const {
      showGraph
    } = this.props;

    return (
      <div className="pipeline-container">
        {showGraph && <GraphContainer />}
        {!showGraph && <StagesBar />}
        {!showGraph && <StageEditor />}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    showGraph: state.showGraph
  };
};

const mapDispatchToProps: DispatchProps = {
  // Resets URL validation if form was changed.
  updateStore: (update: any): UpdateStoreAction => ({
    type: ActionTypes.UPDATE_STORE,
    update
  })
};

export default connect(mapStateToProps, mapDispatchToProps)(Pipeline);
