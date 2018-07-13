import React, { Component } from 'react';

import SpaceContainer from '../space/space-widget/Space.container';

import { Logout } from '../account/logout/Logout.component';

import * as styles from './Overview.css';

export default class Overview extends Component {
  render() {
    return (
      <div>
        <header className={styles.overviewHeader}>
          <h1 className={styles.overviewTitle}>
            Welcome to another React Application!
          </h1>
          <Logout />
        </header>
        <SpaceContainer />
      </div>
    );
  }
}
