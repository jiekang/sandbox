import React, { Component } from 'react';

import SpaceContainer from '../space/space-widget/Space.container';

import { Logout } from '../account/logout/Logout.component';

import './Overview.css';
export default class Overview extends Component {
  render() {
    return (
      <div>
        <header className="UI-overview-header">
          <h1 className="UI-overview-title">
            Welcome to another React Application!
          </h1>
          <Logout />
        </header>
        <SpaceContainer />
      </div>
    );
  }
}
