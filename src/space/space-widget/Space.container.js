import { connect } from 'react-redux';
import { SpaceWidget } from './Space.widget';

const mapStateToProps = state => {
  return {
    spaces: state.spaces
  };
};

const SpaceContainer = connect(mapStateToProps)(SpaceWidget);

export default SpaceContainer;
