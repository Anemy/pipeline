import Stage from '../components/models/stage';
import { Actions, ActionTypes } from './actions';

export const NO_ACTIVE_STAGE = -1;

export interface AppState {
  activeStage: number,
  stages: Stage[]
}

export const initialState: AppState = {
  activeStage: NO_ACTIVE_STAGE,
  stages: []
};

// eslint-disable-next-line complexity
export const rootReducer = (
  state: AppState = initialState,
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
