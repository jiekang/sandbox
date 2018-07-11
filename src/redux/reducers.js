import { combineReducers } from 'redux';

import { SET_SPACES } from './actions';

export function spaces(state = [], action) {
  switch (action.type) {
    case SET_SPACES:
      return action.spaces;
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  spaces
});

export default rootReducer;
