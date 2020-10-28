import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';

import './aggregate-editor.css';

import {
  ActionTypes,
  UpdateStoreAction
} from '../../store/actions';
import {
  AppState
} from '../../store/store';
import Stage, { STAGES } from '../../models/stage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const options = [
  { value: 'x', label: 'Coming soon' },
  { value: 'y', label: 'Not yet implemented' }
];

type StateProps = {
  activeStage: number;
  activeStageType: STAGES;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class AggregateEditor extends React.Component<StateProps & DispatchProps> {
  state = {
    addingMetric: false,
    metrics: [],
    metricName: undefined,
    metricConfigMeasure: null,
    metricConfigOperator: null
  };

  resetMetricConfigFields = () => {
    this.setState({
      addingMetric: false,
      metricName: undefined,
      metricConfigMeasure: null,
      metricConfigOperator: null
    });
  }

  onClickAddMetric = () => {
    this.setState({
      addingMetric: true
    });
  }

  onClickSaveMetric = () => {
    alert('Coming soon: add metric.');

    this.setState({
      metrics: [...this.state.metrics, 'Example metric']
    })

    this.resetMetricConfigFields();
  }

  renderMetrics() {
    const {
      metrics
    } = this.state;

    return (
      <div className="aggregate-editor-metrics-container col-sm-4">
        <div className="aggregate-editor-metrics-top-bar">
          <div className="aggregate-editor-area-title">
            Metrics
          </div>
          <button
            className="aggregate-editor-add-metric-button"
            onClick={this.onClickAddMetric}
          >
            <FontAwesomeIcon
              className="aggregate-editor-add-metric-button-icon"
              icon={faPlus}
            /> Add metric
          </button>
        </div>
        <div className="aggregate-editor-metrics-list">
          {metrics.map((metric, i) => (
            <div
              className="aggregate-editor-metrics-list-item"
              key={`${i}`}
            >
              {metric}
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderMetricConfig() {
    const {
      metricName,
      metricConfigMeasure,
      metricConfigOperator
    } = this.state;

    return (
      <Fragment>
        <div className="aggregate-editor-metric-group-by-container col-sm-4">
          <div className="aggregate-editor-metrics-top-bar">
            <div className="aggregate-editor-area-title">
              Group By
            </div>
          </div>
          <div className="aggregate-editor-group-by-list">
            {/* Group by list here */}
          </div>
        </div>
        <div className="aggregate-editor-metric-group-by-container col-sm-4">
          <div className="aggregate-editor-metric-config-item">
            <div className="aggregate-editor-metric-config-item-title">
              Name
            </div>
            <input
              className="aggregate-editor-list"
              type="text"
              placeholder="Optional"
              onChange={(e) => this.setState({ metricName: e.target.value })}
              value={metricName}
            />
          </div>

          <div className="aggregate-editor-metric-config-item">
            <div className="aggregate-editor-metric-config-item-title">
              Measure
            </div>
            <Select
              value={metricConfigMeasure}
              onChange={selectedOption => this.setState({
                metricConfigMeasure: selectedOption
              })}
              options={options}
            />
          </div>

          <div className="aggregate-editor-metric-config-item">
            <div className="aggregate-editor-metric-config-item-title">
              Aggregation Operator
            </div>
            <Select
              value={metricConfigOperator}
              onChange={selectedOption => this.setState({
                metricConfigOperator: selectedOption
              })}
              options={options}
            />
          </div>

          <button
            className="aggregate-editor-metric-config-add-button"
            onClick={this.onClickSaveMetric}
          >
            Add
          </button>
        </div>
      </Fragment>
    );
  }

  render() {
    const {
      addingMetric
    } = this.state;

    return (
      <div className="aggregate-editor">
        {this.renderMetrics()}
        {addingMetric && this.renderMetricConfig()}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const currentStage = state.stages[state.activeStage];

  return {
    activeStage: state.activeStage,
    activeStageType: currentStage.type,
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

export default connect(mapStateToProps, mapDispatchToProps)(AggregateEditor);
