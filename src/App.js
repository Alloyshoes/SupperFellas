import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import PostsHome from './pages/Posts/PostsHome';
import Home from './pages/Home/Home';
import Reco from './pages/Reco/Reco';
import RestoDetails from './pages/RestoDetails/RestoDetails';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import GroupOrderPage from './pages/Posts/GroupOrderPage';

// saved in .env file
const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
	const [selected, setSelected] = useState(null);
	const location = useLocation();
	const hideNavbar = location.pathname === '/';
	return (
		<div className="App">
			{!hideNavbar && <Home />}
			<Routes>
				<Route path="/" element={<LoginSignup auth={auth} />}></Route>
				<Route path="posts" element={<PostsHome app={app} auth={auth} />}></Route>
				<Route path="Reco" element={<Reco app={app} auth={auth} onSelectRestaurant={setSelected} />}></Route>
				<Route path="RestoDetails" element={<RestoDetails app={app} auth={auth} restaurant={selected} />}></Route>
				<Route path="/order/:id" element={<GroupOrderPage />}></Route>
				<Route path="*" element={<LoginSignup auth={auth} />}></Route> {/* Unknown page go login page for now */}
			</Routes>
		</div>
	);
}

export default App;
