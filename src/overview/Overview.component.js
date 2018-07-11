import React, { Component } from 'react';

import { Logout } from '../account/logout/Logout.component';

export default class Overview extends Component {
  render() {
    return (
      <div className="UI-app">
        <header className="UI-app-header">
          <h1>Welcome to another React Application!</h1>
        </header>
        <Logout />
      </div>
    );
  }
}
