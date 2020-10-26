/* eslint react/no-multi-comp:0 */
import React, { Component } from 'react';
import classnames from 'classnames';

import Field from './field/field';
import { SCHEMA_CONSTANTS } from '../../store/store';
import Tooltip from './tooltip/tooltip';
import SchemaType from '../../models/schema';

import styles from './schema.less';

export enum SAMPLING_STATES {
  initial = 'initial',
  counting = 'counting',
  sampling = 'sampling',
  analyzing = 'analyzing',
  error = 'error',
  complete = 'complete',
  outdated = 'outdated',
  timeout = 'timeout'
}

type props = {
  // actions: object,
  // store: object,
  samplingState: SAMPLING_STATES,
  // samplingProgress: number,
  // samplingTimeMS: number,
  // errorMessage: string,
  // maxTimeMS: number,
  schema: SchemaType
  // count: number
};

class Schema extends Component<props> {
  // constructor(props) {
  //   super(props);
  // const appRegistry = props.store.localAppRegistry;
  // this.queryBarRole = appRegistry.getRole('Query.QueryBar')[0];
  // this.queryBar = this.queryBarRole.component;
  // this.queryBarStore = appRegistry.getStore(this.queryBarRole.storeName);
  // this.queryBarActions = appRegistry.getAction(this.queryBarRole.actionName);
  // }

  // onApplyClicked() {
  //   this.props.actions.startSampling();
  // }

  // onResetClicked() {
  //   this.props.actions.startSampling();
  // }

  renderFieldList() {
    const fields = this.props.schema.fields;
    // sort fields alphabetically, since Object.keys() does not keep initial
    // order
    return Object.keys(fields).sort().map((key) => {
      const fieldToRender = fields[key as any];
      return (
        <Field
          key={key}
          name={fieldToRender.name}
          path={fieldToRender.path}
          types={fieldToRender.types}
          fields={fieldToRender.fields || []}
        />
      );
    });
  }

  /**
   * Renders the zero state during the initial state; renders the schema if not.
   * @returns {React.Component} Zero state or fields.
   */
  renderContent() {
    return (
      <div className="column-container">
        <div className="column main">
          <div className="schema-field-list">
            {this.renderFieldList()}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render the schema
   *
   * @returns {React.Component} The schema view.
   */
  render() {
    return (
      <div className={classnames(styles.root)}>
        {/* <div className="controls-container">
          <this.queryBar
            store={this.queryBarStore}
            actions={this.queryBarActions}
            buttonLabel="Analyze"
            onApply={this.onApplyClicked.bind(this)}
            onReset={this.onResetClicked.bind(this)}
          />
          {this.renderBanner()}
        </div> */}
        {this.renderContent()}
        <Tooltip
          id={SCHEMA_CONSTANTS.SCHEMA_PROBABILITY_PERCENT}
          className="opaque-tooltip"
        />
      </div>
    );
  }
}

export default Schema;
