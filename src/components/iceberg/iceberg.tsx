import React from 'react';
// import p5Types from 'p5';
import Sketch from 'react-p5';

import createIcebergSeries from './iceberg-series';

import './iceberg.css';

type props = {
  width: number;
  height: number;
}

class IcebergSeries extends React.Component<props> {
  state = {
    version: 1
  };

  onClickSketch = () => {
    this.setState({
      version: this.state.version + 1
    });
  };

  setupIcebergSeries = (p5: p5, canvasParentRef: Element) => {
    const { width, height } = this.props

    const setup = createIcebergSeries(width, height, p5, canvasParentRef);

    setup(this.onClickSketch);
  }

  render() {
    const { width, height } = this.props;
    const { version } = this.state;

    return (
      <Sketch
        className="iceberg-series"
        setup={this.setupIcebergSeries}
        key={`${width}-${height}-${version}`}
      />
    );
  };
}

export default IcebergSeries;
