import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          OpenJDK Builds
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Pipeline Jobs
          </Link>
          <Link 
            to="/temurin" 
            className={`nav-link ${location.pathname === '/temurin' ? 'active' : ''}`}
          >
            Temurin Jobs
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;



