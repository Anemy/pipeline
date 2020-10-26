import React, { Component } from 'react';
import { has, includes, isString } from 'lodash';
import { hasDistinctValue } from 'mongodb-query-util';
import { SCHEMA_CONSTANTS } from '../../../store/store';

const { DECIMAL_128, DOUBLE, LONG, INT_32 } = SCHEMA_CONSTANTS;

type props = {
  fieldName: string,
  queryValue: string,
  value: any
};

class ValueBubble extends Component<props> {
  onBubbleClicked = (e: React.MouseEvent) => {
    // const QueryAction = this.props.localAppRegistry.getAction('Query.Actions');
    // const action = e.shiftKey ?
    //   QueryAction.toggleDistinctValue : QueryAction.setValue;
    // action({
    //   field: this.props.fieldName,
    //   value: this.props.value,
    //   unsetIfSet: true
    // });
    alert(`Need to add action to add field ${this.props.fieldName}`);
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
      if (includes([DECIMAL_128, LONG], value._bsontype)) {
        return value.toString();
      }
      if (includes([DOUBLE, INT_32], value._bsontype)) {
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

export default ValueBubble;
