import React, { Component } from 'react';
import pluralize from 'pluralize';

import { ObjectFieldType } from '../../../models/field-type';

type props = {
  nestedDocType: ObjectFieldType
}

class DocumentMinichart extends Component<props> {
  render() {
    let docFieldsMessage = '';
    if (this.props.nestedDocType) {
      const numFields = Object.keys(this.props.nestedDocType.fields).length;
      const nestedFields = pluralize('nested field', numFields, true);
      docFieldsMessage = `Document with ${nestedFields}.`;
    }

    return (
      <div>
        <dl>
          <dt>{docFieldsMessage}</dt>
          <dd></dd>
        </dl>
      </div>
    );
  }
}

export default DocumentMinichart;
