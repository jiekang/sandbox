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
