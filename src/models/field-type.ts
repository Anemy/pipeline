
export enum Types {
  ARRAY = 'Array',
  OBJECT = 'Object',
  STRING = 'String',
  UNDEFINED = 'Undefined'
  // TODO
};

type InnerFieldType = {
  name: string;
  probability: number;
  unique: number;
  values: any[];
};

type FieldType = {
  name: string;
  count: number;
  probability: number;
  types: InnerFieldType[];
  has_duplicates: boolean;
  type: Types[];
}

export default FieldType;
