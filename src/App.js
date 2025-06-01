import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import PostsHome from './pages/Posts/PostsHome';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// saved in .env file
const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LoginSignup auth={auth} />}></Route>
					<Route path="posts" element={<PostsHome auth={auth} />}></Route>
					<Route path="*" element={<LoginSignup auth={auth} />}></Route> {/* Unknown page go login page for now */}
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
