import React, { Component } from 'react';

import { AUTH_LOGIN_URL } from '../../api/auth/Account.service';

import * as styles from './Login.css';

export class Login extends Component {
  constructor(props) {
    super(props);
    this.login = this.login.bind(this);
  }

  render() {
    return (
      <div className={styles.login}>
        <button className="UI-login-button" onClick={this.login}>
          Log In
        </button>
      </div>
    );
  }

  login() {
    let here = window.location.href;
    window.location.replace(
      AUTH_LOGIN_URL + '?redirect=' + encodeURIComponent(here)
    );
  }
}
