import { getSpaces } from '../api/wit/Spaces.service';

export const SET_SPACES = 'SET_SPACES';

export function fetchSpaces() {
  return dispatch => {
    let promise = getSpaces();
    if (promise != null) {
      promise
        .then(function(r) {
          return r.json();
        })
        .then(function(json) {
          dispatch(setSpaces(json['data']));
        })
        .catch(function(e) {});
    }
  };
}

export function setSpaces(spaces) {
  return {
    type: SET_SPACES,
    spaces
  };
}
