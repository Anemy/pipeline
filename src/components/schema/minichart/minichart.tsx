import React, { Component } from 'react';
import UniqueMiniChart from '../unique-minichart/unique-minichart';
import DocumentMinichart from '../document-minichart/document-minichart';
import ArrayMinichart from '../array-minichart/array-minichart';
import CoordinatesMinichart from '../coordinates-minichart/coordinates-minichart';
import D3Component from '../d3-component/d3-component';

import { includes } from 'lodash';
import { SCHEMA_CONSTANTS } from '../../../store/store';
import { ArrayFieldType, InnerFieldType, ObjectFieldType, Types } from '../../../models/field-type';

const vizFns = require('../../../modules');

type props = {
  fieldName: string,
  type: InnerFieldType,
  nestedDocType: InnerFieldType | null
}

type StateType = {
  containerWidth: number | null,
  filter: any,
  valid: boolean,
  userTyping: boolean
};

class MiniChart extends Component<props> {
  state: StateType = {
    containerWidth: null,
    filter: {},
    valid: true,
    userTyping: false
  };

  _mc: HTMLDivElement | null = null;

  componentDidMount() {
    // yes, this is not ideal, we are rendering the empty container first to
    // measure the size, then render the component with content a second time,
    // but it is not noticable to the user.
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    // const QueryStore = this.props.localAppRegistry.getStore('Query.Store');
    // const onQueryChanged = (store) => {
    //   this.setState({
    //     filter: store.filter,
    //     valid: store.valid,
    //     userTyping: store.userTyping
    //   });
    // };

    // // Also populate initial values
    // onQueryChanged(QueryStore.state);

    // this.unsubscribeQueryStore = QueryStore.listen(onQueryChanged);
    // this.unsubscribeMiniChartResize = this.props.actions.resizeMiniCharts.listen(this.resizeListener);
  }

  shouldComponentUpdate(nextProps: props, nextState: StateType) {
    return nextState.valid && !nextState.userTyping;
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    // this.unsubscribeQueryStore();
    // this.unsubscribeMiniChartResize();
  }

  /**
   * Called when the window size changes or via the resizeMiniCharts action,
   * triggered by index.jsx. Only redraw if the size is > 0.
   */
  handleResize = () => {
    if (!this._mc) {
      return;
    }

    const rect = this._mc.getBoundingClientRect();
    if (rect.width > 0) {
      this.setState({
        containerWidth: rect.width
      });
    }
  };

  minichartFactory() {
    // cast all numeric types to Number pseudo-type
    // when drawing charts, group all the types of dates together
    const typeName = includes([SCHEMA_CONSTANTS.DECIMAL_128, SCHEMA_CONSTANTS.DOUBLE, SCHEMA_CONSTANTS.INT_32, SCHEMA_CONSTANTS.LONG], this.props.type.name)
      ? SCHEMA_CONSTANTS.NUMBER : includes([SCHEMA_CONSTANTS.UTCDATETIME, SCHEMA_CONSTANTS.TIMESTAMP], this.props.type.name)
        ? SCHEMA_CONSTANTS.DATE : this.props.type.name;

    const fieldName = this.props.fieldName;
    const queryValue = this.state.filter[fieldName];
    const hasDuplicates = this.props.type.has_duplicates;
    const fn = vizFns[typeName.toLowerCase()];
    const width = this.state.containerWidth;

    if (!width) {
      // ADDED @Rhys
      return;
    }

    if (includes([SCHEMA_CONSTANTS.STRING, SCHEMA_CONSTANTS.NUMBER], typeName) && !hasDuplicates) {
      return (
        <UniqueMiniChart
          key={typeName}
          fieldName={fieldName}
          queryValue={queryValue}
          type={this.props.type}
          width={width}
        />
      );
    }
    if (typeName === Types.COORDINATES) {
      const height = width / 1.618; // = golden ratio
      return (
        <CoordinatesMinichart
          fieldName={fieldName}
          type={this.props.type}
          width={width}
          height={height}
        />
      );
    }
    if (typeName === Types.DOCUMENT) {
      return (
        <DocumentMinichart
          nestedDocType={this.props.nestedDocType as ObjectFieldType}
        />
      );
    }
    if (typeName === Types.ARRAY) {
      return (
        <ArrayMinichart
          type={this.props.type as ArrayFieldType}
          nestedDocType={this.props.nestedDocType as InnerFieldType}
        />
      );
    }
    if (typeName === 'Null') {
      return <div>Null</div>;
    }
    if (!fn) {
      return null;
    }
    return (
      <D3Component
        fieldName={this.props.fieldName}
        type={this.props.type}
        renderMode="svg"
        query={queryValue}
        width={width}
        height={100}
        fn={fn}
      />
    );
  }

  render() {
    const minichart = this.state.containerWidth ? this.minichartFactory() : null;
    return (
      <div ref={(chart) => { this._mc = chart; }}>
        {minichart}
      </div>
    );
  }
}

export default MiniChart;
