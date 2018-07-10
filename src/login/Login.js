import React, { Component } from 'react';

import './Login.css';

export const AUTH_KEY = 'auth_token';
export const AUTH_LOGIN_URL = 'https://auth.openshift.io/api/login';

export class Login extends Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  render() {
      return (
        <div className="UI-login">
          <button className="UI-login-button" onClick={this.onClick}>Log In</button>
        </div>
      )
  }

  onClick() {
    let here = window.location.href;
    window.location.replace(AUTH_LOGIN_URL + '?redirect=' + encodeURIComponent(here));
  }
}
