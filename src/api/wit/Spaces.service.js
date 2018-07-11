import { getAccessToken, getUsername } from '../auth/Account.service';

export const WIT_URL = 'https://api.openshift.io/api';

export const SPACES_URL = WIT_URL + '/namedspaces';

export function getSpaces() {
  return getSpacesByUsername(getUsername());
}

export function getSpacesByUsername(userName) {
  let url = SPACES_URL + '/' + encodeURIComponent(userName);
  let accessToken = getAccessToken();
  if (accessToken != null) {
    return fetch(url, {
      method: 'get',
      mode: 'cors',
      headers: new Headers({
        Authorization: 'Bearer ' + accessToken
      })
    });
  }
  return null;
}
