export const AUTH_URL = 'https://auth.openshift.io/api';

export const AUTH_LOGIN_URL = AUTH_URL + '/login';
export const AUTH_LOGOUT_URL = AUTH_URL + '/logout';
export const AUTH_USER_URL = AUTH_URL + '/user';

export const AUTH_TOKEN_KEY = 'auth_token';
export const USER_CONTEXT_KEY = 'user_context';

export function isAccessTokenValid() {
  let token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token) {
    return false;
  }
  try {
    JSON.parse(token);
    return true;
  } catch (e) {
    return false;
  }
}

export function getAccessToken() {
  let jwtToken = JSON.parse(localStorage.getItem(AUTH_TOKEN_KEY));
  if (jwtToken['access_token']) {
    return jwtToken['access_token'];
  }
  return null;
}

export function getUsername() {
  let userContext = JSON.parse(localStorage.getItem(USER_CONTEXT_KEY));
  return userContext.data.attributes.username;
}

export function fetchUserContext() {
  let accessToken = getAccessToken();
  if (accessToken != null) {
    fetch(AUTH_USER_URL, {
      method: 'get',
      mode: 'cors',
      headers: new Headers({
        Authorization: 'Bearer ' + accessToken
      })
    })
      .then(function(r) {
        console.log('response', r);
        return r.json();
      })
      .then(function(r) {
        localStorage.setItem(USER_CONTEXT_KEY, JSON.stringify(r));
      })
      .catch(function(e) {
        return e;
      });
  }
}

export function isLoggedIn() {
  if (isAccessTokenValid()) {
    if (!localStorage.getItem(USER_CONTEXT_KEY)) {
      fetchUserContext();
    }
    return true;
  }
  let query = window.location.search.substr(1);
  let result = {};
  query.split('&').forEach(function(part) {
    let item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });

  if (result['token_json']) {
    localStorage.setItem(AUTH_TOKEN_KEY, result['token_json']);

    let here = window.location.origin;
    window.location.replace(here);
  }

  return false;
}
