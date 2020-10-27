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
import Stage, { STAGES } from '../../../models/stage';
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
  isFieldOptionsDropdownOpen: boolean,
  collapsed: boolean,
  activeType: null | InnerFieldType,
  types: InnerFieldType[]
};

type StateProps = {
  activeStage: number;
  isHiddenField: boolean;
  isRenamedField: boolean;
  renamedFieldName: string;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

// https://docs.mongodb.com/manual/reference/aggregation-variables/#variable.REMOVE
// Note - don't change this value, it's used in the pipeline ^
// const HIDDEN_FIELD = '$$REMOVE';
// {
//   $cond: {
//     if: { $eq: ["", "123"] },
//     then: "$$REMOVE",
//     else: "0"
//   }
// }; // '$$REMOVE';

const HIDDEN_FIELD = 'HIDDEN_FIELD';

class Field extends Component<props & StateProps & DispatchProps> {
  state: StateType = {
    isFieldOptionsDropdownOpen: false,
    // Whether the nested fields are collapsed (true) or expanded (false).
    collapsed: true,
    // A reference to the active type object (only null initially).
    activeType: null,
    types: []
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

  // Adds a new stage of the type if we aren't already on that stage.
  ensureWeAreOnValidStageForAction = (stageType: STAGES) => {
    const {
      activeStage,
      stages
    } = this.props;

    let newActiveStage = activeStage;
    const newStages = [...stages];

    if (newStages[activeStage].type !== stageType) {
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

  onClickRenameField = async () => {
    const {
      isRenamedField,
      name,
      path,
      renamedFieldName
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
    } = this.ensureWeAreOnValidStageForAction(STAGES.PROJECT);

    // https://docs.mongodb.com/manual/reference/operator/aggregation/project/#pipe._S_project

    const currentStage = newStages[newActiveStage];

    // If already renamed, remove old renaming.
    if (isRenamedField) {
      // TODO: Do we want to remove all the rename occurences?
      // This might conflict in the future.
      // We probably want a more manual control of field renames.
      delete currentStage.content[renamedFieldName];
    }

    // Only rename then if the new name isn't equal to the current name.
    if (newFieldName !== path.split('.').slice(-1)[0]) {
      const renameExpr = `$${path}`;
      currentStage.content[newFieldName] = renameExpr;
    }

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  };

  onClickToggleHideField = (): void => {
    const {
      isHiddenField,
      path
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = this.ensureWeAreOnValidStageForAction(STAGES.UNSET);

    // Update the stage's unset to include or remove the field.
    const currentStage = newStages[newActiveStage];

    // TODO: Maybe we can use:
    // https://docs.mongodb.com/manual/reference/aggregation-variables/#variable.REMOVE
    // And put it all in one project?
    if (isHiddenField) {
      delete currentStage.content[path];
    } else {
      currentStage.content[path] = HIDDEN_FIELD;
    }

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  };

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
      </div>
    );
  }

  /**
   * Render a single field;
   *
   * @returns {React.Component} A react component for a single field
   */
  render() {
    const {
      collapsed,
      isFieldOptionsDropdownOpen
    } = this.state;

    const {
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
          <div className="col-sm-4">
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
            {isRenamedField && <div
              className="schema-field-changes-area"
            >
              <FontAwesomeIcon
                className="schema-field-changes-icon"
                icon={faHistory}
              />
              <div className="schema-field-changes-list">
                Renamed {this.props.name} to {renamedFieldName}
              </div>
            </div>
            }
            <div className="schema-field-type-list">
              {typeList}
            </div>
          </div>
          <div className="col-sm-7 offset-sm-1">
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
            <FontAwesomeIcon
              icon={faEllipsisH}
            />
          </button>
        </div>
        {isFieldOptionsDropdownOpen && this.renderFieldOptions()}
        {this.getChildren()}
      </div>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: props): StateProps => {
  const currentStage = state.stages[state.activeStage];
  let isHiddenField = currentStage.type === STAGES.UNSET
    && currentStage.content[ownProps.path]
    && currentStage.content[ownProps.path] === HIDDEN_FIELD;

  // TODO: This only pulls in the first renaming.
  // We should ensure we show all of the names this field has been renamed to.
  let isRenamedField = false;
  let renamedFieldName = '';
  const renameExpr = `$${ownProps.path}`;
  const alreadyRenamed = Object.keys(currentStage.content).filter(
    (renamedPath: string) => currentStage.content[renamedPath] === renameExpr
  );

  if (alreadyRenamed && alreadyRenamed.length > 0) {
    isRenamedField = true;
    renamedFieldName = alreadyRenamed[0];
  }

  return {
    activeStage: state.activeStage,
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
