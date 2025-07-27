import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import './Reco.css';

function Reco({ app, onSelectRestaurant }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [userCoords, setUserCoords] = useState(null);

  const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        err => {
          console.warn("User location not available:", err.message);
          setUserCoords(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    const recoRef = ref(db, 'Reccomendations');
    const postsRef = ref(db, 'posts');

    Promise.all([get(recoRef), get(postsRef)]).then(([recoSnap, postSnap]) => {
      if (!recoSnap.exists()) return;

      const recoData = recoSnap.val();
      const postData = postSnap.exists() ? postSnap.val() : {};

      const addressMap = {};
      Object.entries(postData).forEach(([postId, post]) => {
        if (post.restaurantName && post.address) {
          addressMap[post.restaurantName] = post.address;
        }
      });

      const list = Object.entries(recoData).map(([restaurantName, userReviews]) => {
        const reviewArray = Object.values(userReviews);
        const rating = reviewArray.length > 0
          ? reviewArray.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewArray.length
          : 0;

        const imageReview = reviewArray.find(r => typeof r.image === 'string' && r.image.trim().startsWith('data:image/'));
        const image = imageReview?.image || '';

        const coords = reviewArray.find(r => r.coords)?.coords || {};
        const lat = parseFloat(coords.lat || coords[0]) || null;
        const lon = parseFloat(coords.lon || coords[1]) || null;
        const address = addressMap[restaurantName] || 'No address provided';

        return {
          id: restaurantName,
          name: restaurantName,
          rating,
          reviews: reviewArray.length,
          location: address,
          image,
          lat,
          lon
        };
      });

      if (userCoords) {
        list.sort((a, b) => {
          const distA = a.lat && a.lon ? haversine(userCoords.lat, userCoords.lon, a.lat, a.lon) : Infinity;
          const distB = b.lat && b.lon ? haversine(userCoords.lat, userCoords.lon, b.lat, b.lon) : Infinity;
          return distA - distB;
        });
      }

      setRestaurants(list);
    });
  }, [db, userCoords]);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (restaurant) => {
    onSelectRestaurant(restaurant);
    navigate('/RestoDetails');
  };

  return (
    <div className="search-page">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => navigate('/ReccoCreate')}>Create Recommendation</button>
      </div>

      <div className="results-list">
        {filtered.map((r) => (
          <div key={r.id} className="restaurant-card" onClick={() => handleSelect(r)}>
            {r.image && (
              <img
                src={r.image}
                alt={r.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/120x90?text=No+Image';
                }}
              />
            )}
            <div className="restaurant-info">
              <h3>{r.name}</h3>
              <div className="meta">
                <span className="stars">{renderStars(r.rating)}</span>
                <span className="reviews">({r.reviews > 0 ? `${r.reviews} reviews` : 'No reviews'})</span>
              </div>
              <div className="location">{r.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderStars(rating) {
  const stars = [];
  const full = Math.floor(rating);
  for (let i = 0; i < full; i++) stars.push("★");
  while (stars.length < 5) stars.push("☆");
  return stars.join("");
}

function haversine(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default Reco;
