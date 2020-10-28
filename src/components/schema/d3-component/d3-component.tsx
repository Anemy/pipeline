import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';
import bson from 'bson';
import { connect } from 'react-redux';
import { isArray, isPlainObject } from 'lodash';
import { bsonEqual, hasDistinctValue } from 'mongodb-query-util';

import Stage, { ensureWeAreOnValidStageForAction, FilterStage, STAGES } from '../../../models/stage';
import { InnerFieldType } from '../../../models/field-type';
import { AppState } from '../../../store/store';
import {
  ActionTypes,
  UpdateStoreAction
} from '../../../store/actions';
import { UpdateFilterMethod, UPDATE_FILTER_TYPE } from '../../../modules/update-filter-types';

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
  renderMode: string, // oneOf(['svg', 'div']),
  width: number,
  height: number,
  fn: (updateFilter: UpdateFilterMethod) => any,
  query: any
};

type StateType = {
  chart: any
};

type StateProps = {
  activeStage: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class D3Component extends Component<props & StateProps & DispatchProps> {
  state: StateType = {
    chart: null
  };

  containerRef: any = null;
  mounted = false;
  wrapperRef: any = null;

  componentWillMount() {
    this.mounted = true;
    this.setState({
      chart: this.props.fn(this.updateFilter)
    });
  }

  componentDidMount() {
    this._redraw();
  }

  componentDidUpdate() {
    this._redraw();
  }

  componentWillUnmount() {
    this.mounted = false;
    this._cleanup();
  }

  // TODO - better pairing with types in update-filter-types in modules for this.
  updateFilter: UpdateFilterMethod = (
    options: any,
    updateFilterType: UPDATE_FILTER_TYPE
  ) => {
    if (!this.mounted) {
      return;
    }

    const {
      activeStage,
      stages
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.FILTER, stages, activeStage);

    const currentStage = newStages[newActiveStage] as FilterStage;

    // Now we update....
    // TODO: Maybe we want more deconstructing to make sure we're not
    // editing refs of current stages.

    switch (updateFilterType) {
      case UPDATE_FILTER_TYPE.SET_GEO_WITHIN_VALUE:
        const newValue: any = {};
        const radius = options.radius === undefined ? options.radius : 0;
        const center = options.center === undefined ? options.center : null;

        if (radius && center) {
          newValue.$geoWithin = {
            $centerSphere: [[center[0], center[1]], radius]
          };
          currentStage.content[options.field] = newValue;
          break;
        }
        // Else if center or radius are not set, or radius is 0, clear field.
        if (currentStage.content[options.field]) {
          delete currentStage.content[options.field];
        }

        break;
      case UPDATE_FILTER_TYPE.SET_RANGE_VALUES:
        const value: any = {};
        let op;
        // Without min and max, clear the field.
        const minValue = options.min;
        const maxValue = options.max;
        if (minValue === undefined && maxValue === undefined) {
          if (currentStage.content[options.field]) {
            delete currentStage.content[options.field];
          }
          break;
        }

        if (minValue !== undefined) {
          // Default minInclusive to true. (could add this as option).
          op = '$gte'// : '$gt';
          value[op] = minValue;
        }

        if (maxValue !== undefined) {
          op = !!options.maxInclusive ? '$lte' : '$lt';
          value[op] = maxValue;
        }

        if (currentStage.content[options.field] === value
          || bsonEqual(currentStage.content[options.field], value)
        ) {
          delete currentStage.content[options.field];
        } else {
          currentStage.content[options.field] = value;
        }
        break;
      case UPDATE_FILTER_TYPE.SET_VALUE:
        if (currentStage.content[options.field] === options.value
          || bsonEqual(currentStage.content[options.field], options.value)
        ) {
          delete currentStage.content[options.field];
        } else {
          currentStage.content[options.field] = options.value;
        }
        break;
      case UPDATE_FILTER_TYPE.TOGGLE_DISTINCT_VALUE:
        const currentValue = currentStage.content[options.field];

        if (hasDistinctValue(currentValue, options.value)) {
          // Remove distinct field.
          // We already have the value for this field, toggle remove it.
          if (currentValue === undefined) {
            break;
          }

          if (isPlainObject(currentValue)) {
            if (currentValue && currentValue.$in) {
              // Add value to $in array if it is not present yet.
              const newArray = [...currentValue.$in];
              newArray.splice(
                newArray.indexOf(options.value),
                1
              );
              // currentStage.content[options.field].$in.splice(
              //   currentStage.content[options.field].$in.indexOf(options.value),
              //   1
              // );

              // If $in array was reduced to single value, replace with primitive.
              if (newArray.length > 1) {
                currentStage.content[options.field].$in = newArray;
              } else if (newArray.length === 1) {
                currentStage.content[options.field] = newArray[0];
              } else {
                delete currentStage.content[options.field];
              }
              break;
            }
          }
          // If value to remove is the same as the primitive value, unset field.
          if (currentValue === options.value
            || bsonEqual(currentValue, options.value)
          ) {
            delete currentStage.content[options.field];
            break;
          }
          break;
        }

        // Below is add distinct value.

        // Field not present in filter yet, add primitive value.
        if (currentValue === undefined) {
          currentStage.content[options.field] = options.value;
          break;
        }
        // Field is object, could be a $in clause or a primitive value.
        if (isPlainObject(currentValue)) {
          if (currentValue && currentValue.$in) {
            // Add value to $in array if it is not present yet.
            const inArray: any[] = currentStage.content[options.field].$in;
            if (!inArray.includes(options.value)) {
              // TODO: @Rhys - we were using lodash contains
              currentStage.content[options.field].$in.push(options.value);
            }
            break;
          }
          // It is not a $in operator, replace the value.
          currentStage.content[options.field] = options.value;
          break;
        }
        // In all other cases, we want to turn a primitive value into a $in list.
        currentStage.content[options.field] = { $in: [currentValue, options.value] };
        break;
      case UPDATE_FILTER_TYPE.SET_DISTINCT_VALUES:
        if (isArray(options.value)) {
          if (options.value.length > 1) {
            currentStage.content[options.field] = { $in: options.value };
          } else if (options.value.length === 1) {
            currentStage.content[options.field] = options.value[0];
          } else {
            delete currentStage.content[options.field];
          }
          break;
        }
        currentStage.content[options.field] = options.value;
        break;
      case UPDATE_FILTER_TYPE.CLEAR_VALUE:
        if (currentStage.content[options.field]) {
          delete currentStage.content[options.field];
        }
        break;
      default:
        new Error(`Unknown filter type: ${updateFilterType}`);
        break;
    }

    currentStage.sampleDocumentsAreUpToDate = false;

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  };

  _getContainer() {
    const sizeOptions = {
      width: this.props.width,
      height: this.props.height
    };
    if (this.props.renderMode === 'svg') {
      return (
        <svg
          className="minichart"
          ref={ref => this.containerRef = ref}
          width={this.props.width}
          height={this.props.height}
        >
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
    return <div
      className="minichart"
      ref={ref => this.containerRef = ref}
      style={sizeOptions}
    />;
  }

  _cleanup() {
    if (this.state.chart) {
      this.state.chart.cleanup();
    }
  }

  _redraw() {
    const el = ReactDOM.findDOMNode(this.containerRef);
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
      <div className="minichart-wrapper" ref={ref => this.wrapperRef = ref}>
        {container}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    activeStage: state.activeStage,
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

export default connect(mapStateToProps, mapDispatchToProps)(D3Component);
