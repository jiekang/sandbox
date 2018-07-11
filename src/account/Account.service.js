export const AUTH_KEY = 'auth_token';
export const AUTH_LOGIN_URL = 'https://auth.openshift.io/api/login';
export const AUTH_LOGOUT_URL = 'https://auth.openshift.io/api/logout';

export function getAccessToken() {
  let jwtToken = localStorage.getItem('auth_token');
  if (jwtToken['access_token']) {
    return jwtToken['access_token'];
  }
  return null;
}

export function isLoggedIn() {
  if (localStorage.getItem(AUTH_KEY)) {
    return true;
  }
  let query = window.location.search.substr(1);
  let result = {};
  query.split('&').forEach(function(part) {
    let item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });

  if (result['token_json']) {
    localStorage.setItem(AUTH_KEY, result['token_json']);
    let here = window.location.origin;
    window.location.replace(here);
  }

  return false;
}
