import FieldType from './field-type';

type Schema = {
  count: number;
  fields: FieldType[];
}

export const placeHolderSchema: Schema = {
  count: 0,
  fields: []
};

export default Schema;
