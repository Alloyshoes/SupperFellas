import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
	return (
		<nav className="custom-navbar">
			<div className="navbar-container">
				<Link to="/Posts" className="navbar-brand">SupperFellas</Link>
				<div className="navbar-links">
					<Link to="/Posts" className="navbar-link">Home</Link>
					<Link to="/Orders" className="navbar-link">Orders</Link>
					<Link to="/Reco" className="navbar-link">Recommendations</Link>
					<Link to="/Posts" className="navbar-link">Posts</Link>
				</div>
			</div>
		</nav>
	);
}

export default Home;
