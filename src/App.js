import React, { Component } from 'react';

import { Login } from './login/Login.js';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Welcome.</h1>
        </header>
        <Login>
        </Login>
      </div>
    );
  }
}

export default App;
