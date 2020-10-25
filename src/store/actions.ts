export enum ActionTypes {
  UPDATE_STORE = 'UPDATE_STORE'
}

export interface BaseAction {
  type: ActionTypes;
}

export interface UpdateStoreAction extends BaseAction {
  type: ActionTypes.UPDATE_STORE;
  update: any;
}

export type Actions =
  | UpdateStoreAction;
