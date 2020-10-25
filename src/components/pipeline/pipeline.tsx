import React from 'react';
// import Resizable from 're-resizable';

import Graph from '../graph/graph';
import StageEditor from '../stage-editor/stage-editor';

import './pipeline.css';

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

class Pipeline extends React.Component {
  render() {
    return (
      <div className="pipeline-container">
        {/* <Resizable>
          <Graph />
        </Resizable> */}
        <Graph />
        <StageEditor />

      </div>
    );
  }
}

export default Pipeline;
