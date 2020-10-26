import { MongoClient } from 'mongodb';
import DataSource from '../models/data-source';
import Stage from '../models/stage';
import { Actions, ActionTypes } from './actions';

export const NO_ACTIVE_STAGE = -1;

export const SCHEMA_CONSTANTS = {
  'SCHEMA_PROBABILITY_PERCENT': 'schema-probability-percent',
  'LONG_RUNNING_QUERIES_URL': 'https://docs.mongodb.com/compass/current/faq/#what-happens-to-long-running-queries',
  'DECIMAL_128': 'Decimal128',
  'DOUBLE': 'Double',
  'LONG': 'Long',
  'INT_32': 'Int32',
  'STRING': 'String',
  'NUMBER': 'Number',
  'UTCDATETIME': 'UtcDatetime',
  'TIMESTAMP': 'Timestamp',
  'DATE': 'Date'
};

export interface AppState {
  activeStage: number,
  dataSource: DataSource,
  mongoClient: MongoClient,
  showGraph: boolean,
  stages: Stage[]
}

export const getInitialState = (mongoClient: MongoClient) => ({
  activeStage: NO_ACTIVE_STAGE,
  dataSource: new DataSource('test', 'shipwrecks'),
  mongoClient,
  showGraph: false,
  stages: []
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
