import LoginSignup from './pages/LoginSignup/LoginSignup';

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
			<LoginSignup auth={auth}/>
		</div>
	);
}

export default App;
