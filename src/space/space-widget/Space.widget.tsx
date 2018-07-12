import * as React from "react";

import { fetchSpaces } from '../../redux/actions';

import { Space } from '../Space.types';

import './Space.css';


export interface SpaceWidgetProps {
  dispatch: any,
  spaces: Space[]
}

export class SpaceWidget extends React.Component<SpaceWidgetProps> {
  componentDidMount() {
    this.props.dispatch(fetchSpaces());
  }

  render() {
    const spaceItems = this.props.spaces.map((space: Space) => {
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
