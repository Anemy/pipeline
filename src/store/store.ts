import { MongoClient } from 'mongodb';
import DataSource from '../models/data-source';
import Stage from '../models/stage';
import { Actions, ActionTypes } from './actions';

export const NO_ACTIVE_STAGE = -1;

export interface AppState {
  activeStage: number,
  dataSource: DataSource,
  mongoClient: MongoClient,
  showGraph: boolean,
  stages: Stage[]
}

export const getInitialState = (mongoClient: MongoClient) => ({
  activeStage: NO_ACTIVE_STAGE,
  dataSource: new DataSource('test', 'sales'),
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
