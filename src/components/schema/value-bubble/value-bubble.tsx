import React, { Component } from 'react';
import { has, includes, isString } from 'lodash';
import { hasDistinctValue } from 'mongodb-query-util';
import { connect } from 'react-redux';

import { AppState } from '../../../store/store';
import {
  ActionTypes,
  UpdateStoreAction
} from '../../../store/actions';
import { Types } from '../../../models/field-type';
import Stage, {
  ensureWeAreOnValidStageForAction,
  FilterStage,
  STAGES
} from '../../../models/stage';

type props = {
  fieldName: string,
  queryValue: any,
  value: any
};

type StateProps = {
  activeStage: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class ValueBubble extends Component<props & StateProps & DispatchProps> {
  onBubbleClicked = (e: React.MouseEvent) => {
    const {
      activeStage,
      fieldName,
      queryValue,
      stages,
      value
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.FILTER, stages, activeStage);

    const currentStage = newStages[newActiveStage] as FilterStage;

    // TODO: Get rid of this query value and just use the stage with path / current stage content.

    // It's already part of the match/filter, remove.
    if (hasDistinctValue(queryValue, value)) {
      if (queryValue && queryValue.$in) {
        // Remove it from the array.
        queryValue.$in.splice(queryValue.$in.indexOf(value), 1);

        if (queryValue.$in.length === 0) {
          delete currentStage.content[fieldName];
        }
      } else {
        delete currentStage.content[fieldName];
      }
    } else if (e.shiftKey && queryValue !== undefined) {
      // Add the value to the list of other values for this match on this field.
      if (queryValue.$in) {
        currentStage.content[fieldName].$in.push(value);
      } else {
        currentStage.content[fieldName] = {
          $in: [queryValue, value]
        }
      }
    } else {
      // Add the value to the field in the match.
      currentStage.content[fieldName] = value;
    }

    currentStage.sampleDocumentsAreUpToDate = false;

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  }

  /**
   * Converts the passed in value into a string, supports the 4 numeric
   * BSON types as well.
   *
   * @param {Any} value     value to be converted to a string
   * @return {String}       converted value
   */
  _extractStringValue(value: any) {
    if (has(value, '_bsontype')) {
      if (includes([Types.DECIMAL_128, Types.LONG], value._bsontype)) {
        return value.toString();
      }
      if (includes([Types.DOUBLE, Types.INT_32], value._bsontype)) {
        return String(value.value);
      }
    }
    if (isString(value)) {
      return value;
    }
    return String(value);
  }

  render() {
    const value = this._extractStringValue(this.props.value);
    const selectedClass = hasDistinctValue(this.props.queryValue, this.props.value) ?
      'selected' : 'unselected';

    return (
      <li className="bubble">
        <code
          className={`selectable ${selectedClass}`}
          onClick={this.onBubbleClicked}
        >
          {value}
        </code>
      </li>
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

export default connect(mapStateToProps, mapDispatchToProps)(ValueBubble);
