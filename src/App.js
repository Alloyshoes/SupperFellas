import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import PostsHome from './pages/Posts/PostsHome';
import Orders from './pages/Orders/Orders';
import Reco from './pages/Reco/Reco';
import RestoDetails from './pages/RestoDetails/RestoDetails';
import ReccoCreate from './pages/ReccoCreate/ReccoCreate';
import GroupOrderPage from './pages/Posts/GroupOrderPage';
import Home from './pages/Home/Home';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import GuidePage from './pages/Guide/Guide';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  return (
    <Routes>
      {/* Pages without navbar */}
      <Route path="/" element={<LoginSignup auth={auth} />} />

      {/* Pages wrapped with navbar layout */}
      <Route element={<Home />}>
        <Route path="Posts" element={<PostsHome app={app} auth={auth} />} />
        <Route path="Orders" element={<Orders app={app} auth={auth} />} />
        <Route path="Reco" element={<Reco app={app} auth={auth} onSelectRestaurant={setSelectedRestaurant} />} />
        <Route path="ReccoCreate" element={<ReccoCreate app={app} auth={auth} />} />
        <Route path="RestoDetails" element={<RestoDetails app={app} auth={auth} restaurant={selected} />} />
        <Route path="/order/:id" element={<GroupOrderPage auth={auth} />} />
        <Route path="/guide" element={<GuidePage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<LoginSignup auth={auth} />} />
    </Routes>
  );
}

export default App;
