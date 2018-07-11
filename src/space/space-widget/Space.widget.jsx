import React, { Component } from 'react';

import { fetchSpaces } from '../../redux/actions';

import './Space.css';

export class SpaceWidget extends Component {
  componentDidMount() {
    this.props.dispatch(fetchSpaces());
  }

  render() {
    const spaceItems = this.props.spaces.map(space => {
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
