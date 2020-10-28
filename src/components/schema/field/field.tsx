import React, { Component } from 'react';
import { connect } from 'react-redux';
import detectCoordinates from 'detect-coordinates';
import { sortBy, find } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faEllipsisH,
  faHistory,
  faPen
} from '@fortawesome/free-solid-svg-icons';
import smalltalk from 'smalltalk';

import Type from '../type/type';
import Minichart from '../minichart/minichart';
import {
  ArrayFieldType,
  InnerFieldType,
  ObjectFieldType,
  Types
} from '../../../models/field-type';
import Stage, {
  ensureWeAreOnValidStageForAction,
  TransformStage,
  STAGES
} from '../../../models/stage';
import { AppState } from '../../../store/store';
import {
  ActionTypes,
  UpdateStoreAction
} from '../../../store/actions';

import './field.css';

// The full schema component class.
const FIELD_CLASS = 'schema-field';

type props = {
  name: string;
  path: string;
  types: InnerFieldType[];
  fields: any[];
}

type StateType = {
  activeType: null | InnerFieldType;
  collapsed: boolean;
  isFieldOptionsDropdownOpen: boolean;
  types: InnerFieldType[];

  showFindAndReplace: boolean;
  findValue: string;
  replaceValue: string;
  ignoreCase: boolean;
};

type StateProps = {
  activeStage: number;
  changesHaveBeenMade: boolean;
  isFindAndReplaceField: boolean;
  isHiddenField: boolean;
  isRenamedField: boolean;
  renamedFieldName: string;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

class Field extends Component<props & StateProps & DispatchProps> {
  state: StateType = {
    // A reference to the active type object (only null initially).
    activeType: null,
    // Whether the nested fields are collapsed (true) or expanded (false).
    collapsed: true,
    isFieldOptionsDropdownOpen: false,
    types: [],

    showFindAndReplace: false,
    findValue: '',
    replaceValue: '',
    ignoreCase: false
  }

  componentWillMount() {
    // sort the types in descending order and push null to the end
    const types = sortBy(this.props.types, (type) => {
      if (type.name === 'Null') {
        return -Infinity;
      }
      return type.probability;
    }).reverse();

    // sets the active type to the first type in the props.types array
    this.setState({
      types: types,
      activeType: types.length > 0 ? types[0] : null
    });
  }

  componentWillUnmount() {
    if (this.state.isFieldOptionsDropdownOpen) {
      window.removeEventListener('click', this.handleWindowClick);
    }
  }

  handleWindowClick = (event: any) => {
    if (!event.target.classList.contains('.schema-field-options-dropdown')) {
      this.setState({
        isFieldOptionsDropdownOpen: false
      });
      window.removeEventListener('click', this.handleWindowClick);
    }
  }

  onClickShowFieldOptions = (): void => {
    if (this.state.isFieldOptionsDropdownOpen) {
      return;
    }

    this.setState({
      isFieldOptionsDropdownOpen: true
    });

    setImmediate(() => {
      window.addEventListener('click', this.handleWindowClick);
    });
  };

  onClickRenameField = async () => {
    const {
      activeStage,
      isRenamedField,
      name,
      path,
      stages
    } = this.props;

    let newFieldName;
    try {
      newFieldName = await smalltalk.prompt('Rename Field', 'Enter the new field name:', name);
    } catch (err) {
      // Cancelled prompt.
      return;
    }

    if (newFieldName === null || newFieldName.replace(/\s+/g, '') === '') {
      return;
    }

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.TRANSFORM, stages, activeStage);

    // https://docs.mongodb.com/manual/reference/operator/aggregation/project/#pipe._S_project

    const currentStage = newStages[newActiveStage] as TransformStage;

    // If already renamed, remove old renaming.
    if (isRenamedField) {
      // TODO: Do we want to remove all the rename occurences?
      // This might conflict in the future.
      // We probably want a more manual control of field renames.
      delete currentStage.renamedFields[path];
    }

    // Only rename then if the new name isn't equal to the current name.
    if (newFieldName !== path.split('.').slice(-1)[0]) {
      currentStage.renamedFields[path] = newFieldName;
    }

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  };

  onClickToggleHideField = (): void => {
    const {
      activeStage,
      isHiddenField,
      path,
      stages
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.TRANSFORM, stages, activeStage);

    // Update the stage's unset to include or remove the field.
    const currentStage = newStages[newActiveStage] as TransformStage;

    // TODO: Maybe we can use:
    // https://docs.mongodb.com/manual/reference/aggregation-variables/#variable.REMOVE
    // And put it all in one project?
    if (isHiddenField) {
      delete currentStage.hiddenFields[path];
    } else {
      currentStage.hiddenFields[path] = true;
    }

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  };

  onClickFindAndReplace = (): void => {
    this.setState({
      showFindAndReplace: true
    });
  }

  /**
   * Returns the field list (an array of <Field /> components) for nested
   * subdocuments.
   *
   * @return {component}  Field list or empty div
   */
  getChildren() {
    const nestedDocType = this.getNestedDocType();
    const fields = nestedDocType ? (nestedDocType as ObjectFieldType).fields || [] : [];
    let fieldList;

    if (this.state.collapsed) {
      // Return empty div if field is collapsed.
      fieldList = '';
    } else {
      fieldList = Object.keys(fields).map((key, index) => {
        const fieldToRender = fields[key as any];

        return (
          <ConnectedField
            key={index}
            name={fieldToRender.name}
            path={fieldToRender.path}
            types={fieldToRender.types}
            fields={fieldToRender.fields || []}
          />
        );
      });
    }
    return (
      <div className="schema-field-list">
        {fieldList}
      </div>
    );
  }

  /**
   * Returns Document type object of a nested document, either directly nested
   * or sub-documents inside an array.
   *
   * @return {Object}   object representation of `Document` type.
   *
   * @example
   * {foo: {bar: 1}} ==> {bar: 1} is a direct descendant
   * {foo: [{baz: 2}]} ==> {baz: 2} is a nested document inside an array
   *
   * @see mongodb-js/mongodb-schema
   */
  getNestedDocType(): InnerFieldType | null {
    // Check for directly nested document first.
    const docType = find(this.props.types, { name: Types.DOCUMENT });
    if (docType) {
      return docType;
    }
    // Otherwise check for nested documents inside an array.
    const arrType = find(this.props.types, { name: Types.ARRAY });
    if (arrType) {
      return find((arrType as ArrayFieldType).types, { name: Types.DOCUMENT }) as InnerFieldType;
    }
    return null;
  }

  /**
   * Tests type for semantic interpretations, like geo coordinates, and
   * replaces type information like name and values if there's a match.
   *
   * @param  {Object} type   The original type
   * @return {Object}        The possibly modified type
   */
  getSemanticType(type: InnerFieldType): InnerFieldType {
    // Check if the type represents geo coordinates, if privacy settings allow
    // if (global.hadronApp.isFeatureEnabled('enableMaps') && process.env.HADRON_ISOLATED !== 'true') {
    const coords = detectCoordinates(type);
    if (coords) {
      type.name = 'Coordinates';
      type.values = coords;
    }
    // }
    return type;
  }

  /**
   * Onclick handler to toggle collapsed/expanded state. This will hide/show
   * the nested fields and turn the disclosure triangle sideways.
   */
  onClickToggleCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  }

  /**
   * callback passed down to each type to be called when the type is
   * clicked. Will change the state of the Field component to track the
   * active type.
   *
   * @param {Object} type   object of the clicked type
   */
  renderType = (type: InnerFieldType) => {
    this.setState({ activeType: type });
  }

  renderFieldOptions = () => {
    const {
      isHiddenField
    } = this.props;

    return (
      <div
        className="schema-field-options-dropdown"
      >
        <a
          className="schema-field-options-dropdown-option"
          onClick={this.onClickToggleHideField}
        >
          {isHiddenField ? 'Unhide' : 'Hide'}
        </a>
        <a
          className="schema-field-options-dropdown-option"
          onClick={this.onClickRenameField}
        >
          Rename
        </a>
        <a
          className="schema-field-options-dropdown-option"
          onClick={this.onClickFindAndReplace}
        >
          Find &amp; Replace
        </a>
      </div>
    );
  }

  resetFindAndReplace = () => {
    this.setState({
      showFindAndReplace: false,
      findValue: '',
      replaceValue: '',
      ignoreCase: false
    });
  }

  onClickAddFindAndReplace = () => {
    const {
      activeStage,
      path,
      stages
    } = this.props;

    const {
      findValue,
      ignoreCase,
      replaceValue
    } = this.state;

    if (findValue === replaceValue) {
      alert('Invalid find and replace, same value.');
      return;
    }

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.TRANSFORM, stages, activeStage);

    const currentStage = newStages[newActiveStage] as TransformStage;

    // If already renamed, remove old renaming.
    if (currentStage.findAndReplaceFields[path]) {
      alert('Currently we only support 1 find and replace at a time.')
      return;
    }

    currentStage.findAndReplaceFields[path] = {
      findValue,
      ignoreCase,
      replaceWithValue: replaceValue
    };

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });

    this.resetFindAndReplace();
  }

  renderFindAndReplace = () => {
    const {
      findValue,
      ignoreCase,
      replaceValue
    } = this.state;

    return (
      <div
        className="schema-field-find-and-replace-container"
      >
        <div className="schema-field-find-and-replace-form col-sm-4">
          <div className="schema-field-find-and-replace-title">
            <strong>
              Find &amp; Replace
            </strong>
          </div>
          <div className="schema-field-find-and-replace-item">
            <div className="schema-field-find-and-replace-item-title">
              Find
            </div>
            <input
              className="schema-field-find-and-replace-item-field"
              type="text"
              onChange={e => this.setState({ findValue: e.target.value })}
              value={findValue}
            />
          </div>
          <div className="schema-field-find-and-replace-item">
            <div className="schema-field-find-and-replace-item-title">
              Replace With
            </div>
            <input
              className="schema-field-find-and-replace-item-field"
              type="text"
              onChange={e => this.setState({ replaceValue: e.target.value })}
              value={replaceValue}
            />
          </div>
          {/* <div className="schema-field-find-and-replace-item">
            <div className="schema-field-find-and-replace-item-title">
              Ignore Case
            </div>
            <input
              className="schema-field-find-and-replace-item-field"
              type="checkbox"
              onChange={() => this.setState({ ignoreCase: !ignoreCase })}
              checked={ignoreCase}
            />
          </div> */}
          <div className="schema-field-find-and-replace-item schema-field-find-and-replace-actions">
            <button
              onClick={this.resetFindAndReplace}
            >
              Cancel
            </button>
            <button
              onClick={this.onClickAddFindAndReplace}
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderChangesArea() {
    const {
      activeStage,
      isFindAndReplaceField,
      isRenamedField,
      path,
      renamedFieldName,
      stages
    } = this.props;

    return (
      <div
        className="schema-field-changes-area"
      >
        <FontAwesomeIcon
          className="changesicon"
          icon={faHistory}
        />
        <div className="schema-field-changes-list">
          {isRenamedField && <div className="schema-field-change-item">
            Renamed '{this.props.name}' to '{renamedFieldName}'
          </div>}
          {isFindAndReplaceField && <div className="schema-field-change-item">
            Replacing '{(stages[activeStage] as TransformStage).findAndReplaceFields[path].findValue}' with '{(stages[activeStage] as TransformStage).findAndReplaceFields[path].replaceWithValue}'
          </div>}
        </div>
      </div>
    );
  }

  render() {
    const {
      collapsed,
      isFieldOptionsDropdownOpen,
      showFindAndReplace
    } = this.state;

    const {
      changesHaveBeenMade,
      isHiddenField,
      isRenamedField,
      renamedFieldName
    } = this.props;

    // top-level class of this component
    const cls = FIELD_CLASS + ' ' + (collapsed ? 'collapsed' : 'expanded');

    // Types represented as horizontal bars with labels.
    const typeList = Object.keys(this.state.types).map((key, index: number) => {
      // Allow for semantic types and convert the type, e.g. geo coordinates.
      const type: InnerFieldType = this.getSemanticType(this.state.types[key as any]);
      return (
        <Type
          key={index}
          activeType={this.state.activeType}
          renderType={() => this.renderType(type)}
          selfType={type}
          showSubTypes

          bsonType={type.bsonType}
          name={type.name}
          probability={type.probability}
          types={(type as ArrayFieldType).types}
        />
      );
    });

    const activeType = this.state.activeType;
    const nestedDocType = this.getNestedDocType();

    return (
      <div className={cls}>
        <div className="row">
          {isHiddenField && <div className="schema-field-is-hidden" />}

          <div className="col-sm-10 offset-sm-1">
            <div className="schema-field-name">
              {nestedDocType && (
                <button
                  className="schema-field-expand-collapse-button"
                  onClick={this.onClickToggleCollapse}
                >
                  <FontAwesomeIcon
                    icon={collapsed ? faCaretRight : faCaretDown}
                  />
                </button>
              )}
              <div className="schema-field-name-name">
                {isRenamedField ? renamedFieldName : this.props.name}
              </div>
              <button
                className="schema-field-name-rename-button"
                onClick={this.onClickRenameField}
              >
                <FontAwesomeIcon
                  icon={faPen}
                />
              </button>
            </div>
            {changesHaveBeenMade && this.renderChangesArea()}
            <div className="schema-field-type-list">
              {typeList}
            </div>
       
            <Minichart
              fieldName={this.props.path}
              type={activeType as InnerFieldType}
              nestedDocType={nestedDocType}
            />
          </div>
          <button
            className="schema-field-options-button"
            onClick={this.onClickShowFieldOptions}
          >
            <FontAwesomeIcon className="ellipsisbutton"
              icon={faEllipsisH}
            />
          </button>
        </div>
        {showFindAndReplace && this.renderFindAndReplace()}
        {isFieldOptionsDropdownOpen && this.renderFieldOptions()}
        {this.getChildren()}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: props): StateProps => {
  const currentStage = state.stages[state.activeStage];

  let isRenamedField = false;
  let renamedFieldName = '';
  let isHiddenField = false;
  let isFindAndReplaceField = false;
  if (currentStage.type === STAGES.TRANSFORM) {
    isHiddenField = (currentStage as TransformStage).hiddenFields[ownProps.path];

    isRenamedField = !!(currentStage as TransformStage).renamedFields[ownProps.path];
    renamedFieldName = (currentStage as TransformStage).renamedFields[ownProps.path];
    isFindAndReplaceField = !!(currentStage as TransformStage).findAndReplaceFields[ownProps.path];
  }

  return {
    activeStage: state.activeStage,
    changesHaveBeenMade: isRenamedField || isFindAndReplaceField,
    isFindAndReplaceField,
    isHiddenField,
    isRenamedField,
    renamedFieldName,
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

const ConnectedField = connect(mapStateToProps, mapDispatchToProps)(Field);

export default ConnectedField;
