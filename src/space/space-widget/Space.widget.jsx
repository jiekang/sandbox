import React, { Component } from 'react';

import { fetchSpaces } from '../../api/wit/Spaces.service';

import './Space.css';

export class SpaceWidget extends Component {
  constructor(props) {
    super(props);
    this.state = { spaces: [] };
  }

  componentDidMount() {
    this.loadSpaces();
  }

  loadSpaces() {
    let promise = fetchSpaces();
    if (promise != null) {
      promise
        .then(function(r) {
          return r.json();
        })
        .then(
          function(r) {
            this.setState({
              spaces: r['data']
            });
          }.bind(this)
        )
        .catch(function(e) {});
    }
  }

  render() {
    const spaceItems = this.state.spaces.map(space => {
      return <li key={space.id}>{space.attributes.name}</li>;
    });
    return (
      <div className="UI-space-widget">
        <h1>My Spaces</h1>
        <ul>{spaceItems}</ul>
      </div>
    );
  }
}
