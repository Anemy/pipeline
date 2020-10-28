import React from 'react';
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
import Stage, { AggregateStage, MetricType, STAGES } from '../../models/stage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Schema from '../../models/schema';
import { ACCUMULATORS, aggAccumulators } from '../../models/accumulators';

const accumulatorOptions = aggAccumulators.map(accumulator => ({
  value: accumulator.accumulator,
  label: accumulator.displayName
}));

type StateType = {
  metricName: string,
  metricConfigMeasure: any,
  metricConfigAccumulator: any,
  selectedGroupBy: { [fieldPath: string]: boolean }
}

type StateProps = {
  activeStage: number;
  activeStageType: STAGES;
  metrics: { [metricName: string]: MetricType };
  sampleDocumentsSchema: Schema;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class AggregateEditor extends React.Component<StateProps & DispatchProps> {
  state: StateType = {
    // addingMetric: false,
    metricName: '',
    metricConfigMeasure: null,
    metricConfigAccumulator: null,
    selectedGroupBy: {}
  };

  resetMetricConfigFields = () => {
    // Don't reset for now - users might use same fields in multiple metrics.

    // this.setState({
    //   // addingMetric: false,
    //   metricName: '',
    //   metricConfigMeasure: null,
    //   metricConfigAccumulator: null,
    //   selectedGroupBy: {}
    // });
  }

  // onClickAddMetric = () => {
  //   this.setState({
  //     addingMetric: true
  //   });
  // }

  onClickSaveMetric = () => {
    const {
      metricName,
      metricConfigMeasure,
      metricConfigAccumulator,
      selectedGroupBy
    } = this.state;

    const {
      activeStage,
      metrics,
      stages
    } = this.props;

    if (!selectedGroupBy || Object.keys(selectedGroupBy).length === 0) {
      alert('Please select a group by option before adding a metric.');
      return;
    }

    if (!metricConfigAccumulator || Object.keys(metricConfigAccumulator).length === 0) {
      alert('Please select an accumulator before adding a metric.');
      return;
    }

    if (
      Object.keys(metrics).length > 0
      && !!metrics[Object.keys(metrics)[0]].groupBy.find(currentGroupBy => (
        !Object.keys(selectedGroupBy).includes(currentGroupBy)
      ))
    ) {
      // TODO: Allow multiple with same group by or multiple with different group by?
      alert('We currently only allow 1 set of group by options at a time.');
      return;
    }

    const newStages = [...stages];

    const currentStage = newStages[activeStage] as AggregateStage;

    const accumulator = metricConfigAccumulator.value;

    let newMetricName;
    if (metricName && metricName.length > 0) {
      newMetricName = metricName;

      if (currentStage.metrics[newMetricName]) {
        // Already exists.
        alert('Metric with that name already exists, please specify a unique name');
        return;
      }
    } else {
      let measureMessage = '';
      if (metricConfigMeasure && metricConfigMeasure.value && metricConfigMeasure.value.length > 0) {
        if (
          accumulator === ACCUMULATORS.ADD_TO_SET
          || accumulator === ACCUMULATORS.PUSH
          || accumulator === ACCUMULATORS.STD_DEV_POP
          || accumulator === ACCUMULATORS.STD_DEV_SAMP
          || accumulator === ACCUMULATORS.SUM
        ) {
          measureMessage = ` with '${metricConfigMeasure.value}'`;
        } else if (
          accumulator === ACCUMULATORS.AVG
          || accumulator === ACCUMULATORS.FIRST
          || accumulator === ACCUMULATORS.LAST
          || accumulator === ACCUMULATORS.MAX
          || accumulator === ACCUMULATORS.MIN
        ) {
          measureMessage = ` of '${metricConfigMeasure.value}'`;
        }
      }

      newMetricName = `Group by '${Object.keys(selectedGroupBy).join(', ')}' and ${metricConfigAccumulator.label}${measureMessage}`;
    }

    if (currentStage.metrics[newMetricName]) {
      // Metric with the same auto generated name already exists.
      // TODO: Just add a number index or something.
      alert('Metric with that name already exists, please specify a unique name');
      return;
    }

    // TODO: Name conflicts.
    currentStage.metrics[newMetricName] = {
      groupBy: Object.keys(selectedGroupBy),
      accumulator,
      // TODO: We can be more selective about which accumulators we allow
      // null as a measure for (like $sum).
      measure: metricConfigMeasure ? metricConfigMeasure.value : ''
    };

    this.props.updateStore({
      stages: newStages
    });

    this.resetMetricConfigFields();
  }

  onClickRemoveMetric = (metricName: string) => {
    const {
      activeStage,
      stages
    } = this.props;

    const newStages = [...stages];

    const currentStage = newStages[activeStage] as AggregateStage;

    if (currentStage.metrics[metricName]) {
      delete currentStage.metrics[metricName];
    }

    this.props.updateStore({
      stages: newStages
    });
  }

  renderMetrics() {
    const {
      metrics
    } = this.props;

    return (
      <div className="aggregate-editor-metrics-container col-sm-4">
        <div className="aggregate-editor-metrics-top-bar">
          <div className="aggregate-editor-area-title">
            Metrics
          </div>
          {/* <button
            className="aggregate-editor-add-metric-button"
            onClick={this.onClickAddMetric}
          >
            <FontAwesomeIcon
              className="aggregate-editor-add-metric-button-icon"
              icon={faPlus}
            /> Add metric
          </button> */}
        </div>
        <div className="aggregate-editor-metrics-list">
          {Object.keys(metrics).map((metricName, i) => (
            <div
              className="aggregate-editor-metrics-list-item"
              key={`${metricName}-${i}`}
            >
              <div className="aggregate-editor-metrics-list-item-name">
                {metricName}
              </div>
              <button
                className="aggregate-editor-remove-metric-button"
                onClick={() => this.onClickRemoveMetric(metricName)}
              >
                <FontAwesomeIcon
                  className="aggregate-editor-remove-metric-button-icon"
                  icon={faTrashAlt}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  renderGroupByConfig() {
    const {
      sampleDocumentsSchema
    } = this.props;

    const {
      selectedGroupBy
    } = this.state;

    return (
      <div className="aggregate-editor-metric-group-by-container col-sm-4">
        <div className="aggregate-editor-metrics-top-bar">
          <div className="aggregate-editor-area-title">
            Group By
          </div>
        </div>
        <div className="aggregate-editor-group-by-list">
          {(!sampleDocumentsSchema.fields || sampleDocumentsSchema.fields.length === 0) && (
            <div className="aggregate-editor-group-by-list-empty">
              <em>
                No fields found in sample documents to group by
              </em>
            </div>
          )}
          {/* TODO: Go into sub docs. */}
          {sampleDocumentsSchema.fields.map((field, index) => (
            <div
              className="aggregate-editor-group-by-list-item"
              key={`${field.path}-${index}`}
            >
              <input
                type="checkbox"
                className="aggregate-editor-group-by-checkbox"
                id={`checkbox-${field.path}-${index}`}
                checked={!!selectedGroupBy[field.path]}
                onChange={() => this.setState({
                  selectedGroupBy: {
                    ...selectedGroupBy,
                    [field.path]: !selectedGroupBy[field.path]
                  }
                })}
              />
              <label
                htmlFor={`checkbox-${field.path}-${index}`}
                className="aggregate-editor-group-by-list-item-name"
              >
                {field.path}
              </label>
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
      metricConfigAccumulator
    } = this.state;

    const {
      sampleDocumentsSchema
    } = this.props;

    const measureOptions = sampleDocumentsSchema.fields.map(field => ({
      value: field.path,
      label: field.path
    }));

    return (
      <div className="aggregate-editor-metric-group-by-container col-sm-4">
        <div className="aggregate-editor-metric-config-item">
          <div className="aggregate-editor-metric-config-item-title">
            Name
          </div>
          <input
            className="aggregate-editor-metric-name-input"
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
            options={measureOptions}
          />
        </div>

        <div className="aggregate-editor-metric-config-item">
          <div className="aggregate-editor-metric-config-item-title">
            Aggregation Operator
          </div>
          <Select
            value={metricConfigAccumulator}
            onChange={selectedOption => this.setState({
              metricConfigAccumulator: selectedOption
            })}
            options={accumulatorOptions}
          />
        </div>

        <button
          className="aggregate-editor-metric-config-add-button"
          onClick={this.onClickSaveMetric}
        >
          Add
        </button>
      </div>
    );
  }

  render() {
    return (
      <div className="aggregate-editor">
        {this.renderMetrics()}
        {this.renderGroupByConfig()}
        {this.renderMetricConfig()}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  const currentStage = state.stages[state.activeStage] as AggregateStage;

  return {
    activeStage: state.activeStage,
    activeStageType: currentStage.type,
    metrics: currentStage.metrics,
    sampleDocumentsSchema: currentStage.sampleDocumentsSchema,
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
