import React from 'react';
import { connect } from 'react-redux';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import { AppState } from '../../store/store';
import Graph from '../graph/graph';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompressAlt } from '@fortawesome/free-solid-svg-icons';

type StateProps = {};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class GraphContainer extends React.Component<StateProps & DispatchProps> {
  graphContainerRef: HTMLDivElement | null = null;

  state = {
    hasDimensions: false,
    width: 100,
    height: 100
  }

  componentDidMount() {
    this.setState({
      hasDimensions: true,
      width: this.graphContainerRef?.offsetWidth,
      height: this.graphContainerRef?.offsetHeight
    });
  }

  onCollapseClicked = (): void => {
    this.props.updateStore({
      showGraph: false
    });
  };

  render() {
    const {
      hasDimensions,
      width,
      height
    } = this.state;

    return (
      <div
        className="graph-container"
        ref={ref => {this.graphContainerRef = ref;}}
      >
        {hasDimensions && (
          <Graph
            width={width}
            height={height}
          />
        )}
        <button
          className="graph-container-collapse-button"
          onClick={this.onCollapseClicked}
        >
          <FontAwesomeIcon
            icon={faCompressAlt}
          />
        </button>
      </div>
    );
  }
}


const mapStateToProps = (state: AppState): StateProps => {
  return {};
};

const mapDispatchToProps: DispatchProps = {
  // Resets URL validation if form was changed.
  updateStore: (update: any): UpdateStoreAction => ({
    type: ActionTypes.UPDATE_STORE,
    update
  })
};

export default connect(mapStateToProps, mapDispatchToProps)(GraphContainer);
