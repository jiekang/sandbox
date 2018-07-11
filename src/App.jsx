import React, { Component } from 'react';
import Loadable from 'react-loadable';

import { isLoggedIn } from './api/auth/Account.service';
import { Login } from './account/login/Login.component';

function Loading(props) {
  if (props.pastDelay) {
    return <div>Loading</div>;
  } else {
    return null;
  }
}

const LoadableOverview = Loadable({
  loader: () => import('./overview/Overview.component'),
  loading: Loading
});

class App extends Component {
  render() {
    if (isLoggedIn()) {
      return <LoadableOverview />;
    } else {
      return <Login />;
    }
  }
}

export default App;
