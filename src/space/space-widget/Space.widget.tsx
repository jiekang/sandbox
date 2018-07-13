import * as React from 'react';
import { Dispatch } from 'redux';

import { fetchSpaces } from '../../redux/actions';

import { Space } from '../Space.types';

import './Space.css';


export interface SpaceWidgetProps {
  dispatch: Dispatch<any>,
  spaces: Space[]
}

const SpaceItem = (space: Space): React.ReactNode => (
  <li key={space.id}>{space.attributes.name}</li>
);

export class SpaceWidget extends React.Component<SpaceWidgetProps> {
  componentDidMount(): void {
    this.props.dispatch(fetchSpaces());
  }

  render(): React.ReactNode {
    return (
      <div className="UI-space-widget">
        <h1>My Spaces</h1>
        <ul>
          {this.props.spaces.map(SpaceItem)}
        </ul>
      </div>
    );
  }
}
