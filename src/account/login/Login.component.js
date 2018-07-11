import React, { Component } from 'react';

import { AUTH_LOGIN_URL } from '../Account.service';

import './Login.css';

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
