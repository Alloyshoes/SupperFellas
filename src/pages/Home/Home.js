// Home.js
import './Home.css';
import { Link, Outlet } from 'react-router-dom';

function Home() {
  return (
    <>
      <nav className="custom-navbar">
        <div className="navbar-container">
          <Link to="/Posts" className="navbar-brand">SupperFellas</Link>
          <div className="navbar-links">
            <Link to="/Posts" className="navbar-link">Home</Link>
            <Link to="/Orders" className="navbar-link">Orders</Link>
            <Link to="/Reco" className="navbar-link">Recommendations</Link>
            <Link to="/Guide" className="navbar-link">Guide</Link>
          </div>
        </div>
      </nav>

      {/* Wrap page content in padded container */}
      <div className="page-content-wrapper">
        <Outlet />
      </div>
    </>
  );
}

export default Home;
