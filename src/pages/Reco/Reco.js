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

  // 🌍 Get user location on mount
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
    const recoRef = ref(db, 'recommendations');
    get(recoRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(name => {
          const allReviews = data[name].reviews || {};
          const reviewArray = Object.values(allReviews);
          const rating = reviewArray.length > 0
            ? reviewArray.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewArray.length
            : 0;

          const imageReview = reviewArray.find(r => typeof r.image === 'string' && r.image.trim().startsWith('data:image/'));
          const image = imageReview?.image || '';

          const locationReview = reviewArray.find(r => r.location);
          const location = locationReview?.location || '';

          // 📌 Use lat/lon if available
          const lat = parseFloat(locationReview?.lat) || null;
          const lon = parseFloat(locationReview?.lon) || null;

          return {
            id: name,
            name,
            rating,
            reviews: reviewArray.length,
            location,
            image,
            lat,
            lon
          };
        });

        // 📏 Sort by distance if user coordinates available
        if (userCoords) {
          list.sort((a, b) => {
            const distA = a.lat && a.lon ? haversine(userCoords.lat, userCoords.lon, a.lat, a.lon) : Infinity;
            const distB = b.lat && b.lon ? haversine(userCoords.lat, userCoords.lon, b.lat, b.lon) : Infinity;
            return distA - distB;
          });
        }

        setRestaurants(list);
      }
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
                <span className="reviews">({r.reviews} reviews)</span>
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

// 📏 Haversine formula to calculate distance in KM
function haversine(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371; // Earth radius in KM
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default Reco;
