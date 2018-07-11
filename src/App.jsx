import React, { Component } from 'react';
import Loadable from 'react-loadable';

import { Login } from './account/login/Login.component';
import { isLoggedIn } from './account/Account.service';

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
