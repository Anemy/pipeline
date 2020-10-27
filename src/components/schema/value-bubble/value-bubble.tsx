import React, { Component } from 'react';
import { has, includes, isString } from 'lodash';
import { hasDistinctValue } from 'mongodb-query-util';
import { connect } from 'react-redux';

import { AppState, DATA_SERVICE_STAGE_INDEX } from '../../../store/store';
import {
  ActionTypes,
  UpdateStoreAction
} from '../../../store/actions';
import { Types } from '../../../models/field-type';
import Stage, { STAGES } from '../../../models/stage';

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
  // Adds a new stage of the type if we aren't already on that stage.
  ensureWeAreOnValidStageForAction = (stageType: STAGES) => {
    const {
      activeStage,
      stages
    } = this.props;

    let newActiveStage = activeStage;
    const newStages = [...stages];

    if (newStages[activeStage].type !== stageType || activeStage === DATA_SERVICE_STAGE_INDEX) {
      if (newStages[activeStage + 1] && newStages[activeStage + 1].type === stageType) {
        // When the next stage is the type we want
        // we can just jump to that one and update.
        newActiveStage = activeStage + 1;
      } else {
        // Create a new stage and set it as our active stage.
        const newStage = new Stage(stageType);

        // Copy details/sample docs from current stage.
        // TODO: I think we actually want to make this re-render the docs
        // or say the docs are out of date...
        newStage.copyStageItems(newStages[activeStage]);

        newStages.splice(newActiveStage + 1, 0, newStage);
        newActiveStage++;
      }
    }

    return {
      newActiveStage,
      newStages
    };
  }

  onBubbleClicked = (e: React.MouseEvent) => {
    // const QueryAction = this.props.localAppRegistry.getAction('Query.Actions');
    // const action = e.shiftKey ?
    //   QueryAction.toggleDistinctValue : QueryAction.setValue;
    // action({
    //   field: this.props.fieldName,
    //   value: this.props.value,
    //   unsetIfSet: true
    // });

    const {
      fieldName,
      queryValue,
      value
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = this.ensureWeAreOnValidStageForAction(STAGES.MATCH);

    const currentStage = newStages[newActiveStage];

    // TODO: Shift key handling

    // If already renamed, remove old renaming.
    if (hasDistinctValue(queryValue, value)) {
      delete currentStage.content[fieldName];

      // TODO: Remove it from the array of values instead of deleting the value
    } else {
      currentStage.content[fieldName] = value;
    }

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  }

  /**
   * converts the passed in value into a string, supports the 4 numeric
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
