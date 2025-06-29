import './Home.css';

function Home() {
  return (
    <nav className="custom-navbar">
      <div className="navbar-container">
        <a href="#home" className="navbar-brand">Navbar</a>
        <div className="navbar-links">
          <a href="#home" className="navbar-link">Home</a>
          <a href="#features" className="navbar-link">Features</a>
          <a href="#pricing" className="navbar-link">Pricing</a>
        </div>
      </div>
    </nav>
  );
}

export default Home;
