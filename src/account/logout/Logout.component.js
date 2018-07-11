import React, { Component } from 'react';

import { AUTH_KEY, AUTH_LOGOUT_URL } from '../Account.service';

import './Logout.css';

export class Logout extends Component {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  render() {
      return (
        <div className="UI-logout">
          <button className="UI-logout-button" onClick={this.onClick}>Log Out</button>
        </div>
      )
  }

  onClick() {
    localStorage.removeItem(AUTH_KEY);
    let here = window.location.origin;
    window.location.replace(AUTH_LOGOUT_URL + '?redirect=' + encodeURIComponent(here));
  }
}
