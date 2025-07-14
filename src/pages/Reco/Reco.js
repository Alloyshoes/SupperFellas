import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import './Reco.css';

function Reco({ app, onSelectRestaurant }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState([]);

  const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);

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

          // 🔍 Find first review with an image
          const imageReview = reviewArray.find(r => typeof r.image === 'string' && r.image.trim().startsWith('data:image/'));
          const image = imageReview?.image || '';

          // 📍 Also get a location from any review
          const locationReview = reviewArray.find(r => r.location);
          const location = locationReview?.location || '';

          return {
            id: name,
            name,
            rating,
            reviews: reviewArray.length,
            location,
            image
          };
        });
        setRestaurants(list);
      }
    });
  }, [db]);




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

export default Reco;
