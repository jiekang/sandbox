import React, { Component } from 'react';

import { Logout } from '../account/logout/Logout.component';
import { SpaceWidget } from '../space/space-widget/Space.widget';

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
        <SpaceWidget />
      </div>
    );
  }
}
