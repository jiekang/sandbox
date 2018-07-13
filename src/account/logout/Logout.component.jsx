import React, { Component } from 'react';

import {
  AUTH_TOKEN_KEY,
  AUTH_LOGOUT_URL
} from '../../api/auth/Account.service';

import * as styles from './Logout.css';

export class Logout extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  render() {
    return (
      <div className={styles.logout}>
        <button className="UI-logout-button" onClick={this.logout}>
          Log Out
        </button>
      </div>
    );
  }

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    let here = window.location.origin;
    window.location.replace(
      AUTH_LOGOUT_URL + '?redirect=' + encodeURIComponent(here)
    );
  }
}
