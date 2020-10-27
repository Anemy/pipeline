import { MongoClient } from 'mongodb';
import DataSource from '../models/data-source';
import Stage from '../models/stage';
import { Actions, ActionTypes } from './actions';

export const DATA_SERVICE_STAGE_INDEX = 0;
export const NO_ACTIVE_STAGE = -1;

export const SCHEMA_CONSTANTS = {
  'SCHEMA_PROBABILITY_PERCENT': 'schema-probability-percent'
};

export const DEFAULT_SAMPLE_COUNT = 50;

export interface AppState {
  activeStage: number,
  mongoClient: MongoClient,
  sampleCount: number,
  showGraph: boolean,
  stages: Stage[]
}

export const getInitialState = (mongoClient: MongoClient) => ({
  activeStage: NO_ACTIVE_STAGE,
  mongoClient,
  sampleCount: DEFAULT_SAMPLE_COUNT,
  showGraph: false,
  // The datasource here tells us which 'database', 'collection' to use.
  stages: [new DataSource('ships', 'shipwrecks')]
  // stages: [new DataSource('dxl', 'versions')]
  // stages: [new DataSource('test', 'sales')]
  // stages: [new DataSource('encryption', 'dataKeys')]
});

// eslint-disable-next-line complexity
export const rootReducer = (
  state: AppState = getInitialState(null as any),
  action: Actions
): AppState => {
  switch (action.type) {
    case ActionTypes.UPDATE_STORE:
      return {
        ...state,
        ...action.update
      };

    default:
      return state;
  }
};
