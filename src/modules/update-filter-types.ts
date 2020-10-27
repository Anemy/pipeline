
export enum UPDATE_FILTER_TYPE {
  SET_VALUE = 'SET_VALUE',
  SET_DISTINCT_VALUES = 'SET_DISTINCT_VALUES',
  TOGGLE_DISTINCT_VALUE = 'TOGGLE_DISTINCT_VALUE',
  SET_RANGE_VALUES = 'SET_RANGE_VALUES',
  CLEAR_VALUE = 'CLEAR_VALUE',
  SET_GEO_WITHIN_VALUE = 'SET_GEO_WITHIN_VALUE'
}

// type setValueType = (options: { field: string, value: any }, updateFilterType: UPDATE_FILTER_TYPE.SET_VALUE) => void;
// type setDistinctValues = (options: { field: string, value: any }, updateFilterType: UPDATE_FILTER_TYPE.SET_DISTINCT_VALUES) => void
// type toggleDistinctValue = (options: { field: string, value: any }, updateFilterType: UPDATE_FILTER_TYPE.TOGGLE_DISTINCT_VALUE) => void
// type setRangeValues = (options: { field: string, min: any, max: any, maxInclusive: boolean }, updateFilterType: UPDATE_FILTER_TYPE.SET_RANGE_VALUES) => void
// type clearValue = (options: { field: string }, updateFilterType: UPDATE_FILTER_TYPE.CLEAR_VALUE) => void
// type setGeoWithinValue = (options: { field: string, center: [number, number], radius: number }, updateFilterType: UPDATE_FILTER_TYPE.SET_GEO_WITHIN_VALUE) => void

export type UpdateFilterMethod = (options: any, updateFilterType: UPDATE_FILTER_TYPE) => void;
  // | setValueType
  // | setDistinctValues
  // | toggleDistinctValue
  // | setRangeValues
  // | clearValue
  // | setGeoWithinValue;
