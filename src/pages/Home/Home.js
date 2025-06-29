import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <a href="#home" className="navbar-brand">SupperFellas</a>
        <div className="navbar-links">
          <Link to="/Posts" className="navbar-link">Home</Link>
          <Link to="/Reco" className="navbar-link">Recommendations</Link>
          <Link to="/Posts" className="navbar-link">Posts</Link>
        </div>
      </div>
    </nav>
  );
}

export default Home;
