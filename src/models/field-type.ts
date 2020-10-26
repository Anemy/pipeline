
export enum Types {
  ARRAY = 'Array',
  COORDINATES = 'Coordinates',
  DATE = 'Date',
  DOCUMENT = 'Document',
  NUMBER = 'Number',
  OBJECT_ID = 'ObjectID',
  STRING = 'String',
  UNDEFINED = 'Undefined'
  // TODO
};

type BasicInnerFieldType = {
  name: string;
  path: string;
  count: number;
  bsonType: Types;
  total_count: number; // Don't use this value - might be more valid for arrays?
  probability: number;
  has_duplicates: boolean;
  unique: number;
  values: any[];
};

export type ArrayFieldType = BasicInnerFieldType & {
  lengths: any[]
  average_length: number;
  total_count: number;
  types: InnerFieldType[];
}

export type ObjectFieldType = BasicInnerFieldType & {
  fields: FieldType[];
}

export type InnerFieldType = BasicInnerFieldType | ArrayFieldType | ObjectFieldType;

type FieldType = {
  name: string;
  path: string;
  count: number;
  total_count: number;
  probability: number;
  types: InnerFieldType[];
  has_duplicates: boolean;
  type: Types | Types[];
  fields?: FieldType[]
}

export default FieldType;
