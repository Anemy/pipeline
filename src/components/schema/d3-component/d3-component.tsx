/* eslint-disable valid-jsdoc */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import bson from 'bson';
import { assign } from 'lodash';
import { InnerFieldType } from '../../../models/field-type';

/**
 * Convert back to BSON types from the raw JS.
 */
const TO_BSON_CONVERSIONS = {
  'Long': (value: number) => bson.Long.fromNumber(value),
  'Decimal128': (value: string) => bson.Decimal128.fromString(value),
  'Date': (value: string) => new Date(value),
  'UtcDatetime': (value: string) => new Date(value),
  'ObjectId': (value: string) => bson.ObjectId.createFromHexString(value)
};

/**
 * Default conversion.
 */
const DEFAULT = (value: any) => { return value; };

type props = {
  fieldName: string,
  type: InnerFieldType,
  // localAppRegistry: object.,
  renderMode: string, // oneOf(['svg', 'div']),
  width: number,
  height: number,
  fn: () => any,
  query: any
};

type StateType = {
  chart: any
};

class D3Component extends Component<props> {
  state: StateType = {
    chart: null
  };

  componentWillMount() {
    this.setState({
      // Prop was local app registry V
      chart: this.props.fn() // this.props.localAppRegistry
    });
  }

  componentDidMount() {
    this._redraw();
  }

  componentDidUpdate() {
    this._redraw();
  }

  componentWillUnmount() {
    this._cleanup();
  }

  _getContainer() {
    let options = {
      className: 'minichart',
      ref: 'container'
    };
    const sizeOptions = {
      width: this.props.width,
      height: this.props.height
    };
    if (this.props.renderMode === 'svg') {
      options = assign(options, sizeOptions);
      return (
        <svg {...options}>
          <defs>
            <pattern id="diagonal-stripes" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2.5" height="4" transform="translate(0,0)" fill="white"></rect>
            </pattern>
            <mask id="mask-stripe">
              <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonal-stripes)"></rect>
            </mask>
          </defs>
        </svg>
      );
    }
    options = assign(options, {
      style: sizeOptions
    });
    return <div {...options}></div>;
  }

  _cleanup() {
    if (this.state.chart) {
      this.state.chart.cleanup();
    }
  }

  _redraw() {
    const el = ReactDOM.findDOMNode(this.refs.container);
    this.state.chart
      .width(this.props.width)
      .height(this.props.height);

    // @todo: Durran: add the original type here.
    //
    // @todo: Irina: figure out if we need the promoter, since all the values
    // are already converted to acceptable JS values. bsonType can be stored in
    // options as well
    this.state.chart.options({
      fieldName: this.props.fieldName,
      unique: this.props.type.unique || 0,
      query: this.props.query,
      promoter: (TO_BSON_CONVERSIONS as any)[this.props.type.bsonType] || DEFAULT
    });

    d3.select(el as any) // TODO: was erroring without any
      .datum(this.props.type.values)
      .call(this.state.chart);
  }

  render() {
    const container = this._getContainer();
    return (
      <div className="minichart-wrapper" ref="wrapper">
        {container}
      </div>
    );
  }
}

export default D3Component;
