import React, { Component } from 'react';

import detectCoordinates from 'detect-coordinates';
import { sortBy, find } from 'lodash';

import Type from '../type/type';
import Minichart from '../minichart/minichart';
import FieldType, { ArrayFieldType, InnerFieldType, ObjectFieldType, Types } from '../../../models/field-type';

// The full schema component class.
const FIELD_CLASS = 'schema-field';

type props = {
  name: string;
  path: string;
  types: InnerFieldType[];
  fields: any[];
}

type StateType = {
  collapsed: boolean,
  activeType: null | InnerFieldType,
  types: InnerFieldType[]
};

class Field extends Component<props> {
  state: StateType = {
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

  /**
   * returns the field list (an array of <Field /> components) for nested
   * subdocuments.
   *
   * @return {component}  Field list or empty div
   */
  getChildren() {
    const nestedDocType = this.getNestedDocType();
    const fields = nestedDocType ? (nestedDocType as ObjectFieldType).fields || [] : [];
    let fieldList;

    if (this.state.collapsed) {
      // return empty div if field is collapsed
      fieldList = '';
    } else {
      fieldList = Object.keys(fields).map((key, index) => {
        const fieldToRender = fields[key as any];

        return (
          <Field
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
   * returns Document type object of a nested document, either directly nested
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
   * onclick handler to toggle collapsed/expanded state. This will hide/show
   * the nested fields and turn the disclosure triangle sideways.
   */
  titleClicked() {
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

  /**
   * Render a single field;
   *
   * @returns {React.Component} A react component for a single field
   */
  render() {
    // top-level class of this component
    const cls = FIELD_CLASS + ' ' + (this.state.collapsed ? 'collapsed' : 'expanded');

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

    // children fields in case of nested array / document
    return (
      <div className={cls}>
        <div className="row">
          <div className="col-sm-4">
            <div className="schema-field-name" onClick={this.titleClicked.bind(this)}>
              <span className={nestedDocType ? 'caret' : ''}></span>
              <span>{this.props.name}</span>
            </div>
            <div className="schema-field-type-list">
              {typeList}
            </div>
          </div>
          <div className="col-sm-7 col-sm-offset-1">
            <Minichart
              fieldName={this.props.path}
              type={activeType as InnerFieldType}
              nestedDocType={nestedDocType}
            />
          </div>
        </div>
        {this.getChildren()}
      </div>
    );
  }
}

export default Field;
