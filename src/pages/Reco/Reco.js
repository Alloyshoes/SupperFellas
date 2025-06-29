import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reco.css';
import prata1 from '../../assets/prata1.jpg';
import prata2 from '../../assets/prata2.jpg';

const restaurants = [
  {
    id: 1,
    name: "Sabeen Sara Prata And Briyani Stall",
    rating: 4.5,
    reviews: 85,
    location: "79 Telok Blangah Dr, #01-07",
    image: prata1
  },
  {
    id: 2,
    name: "Master Prata",
    rating: 4.6,
    reviews: 2004,
    location: "321 Alexandra Rd, Alexandra Central",
    image: prata2
  }
];

function Reco(props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (restaurant) => {
    props.onSelectRestaurant(restaurant); // update selected restaurant in App
    navigate('/RestoDetails'); // navigate to detail page
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
      </div>
      <div className="results-list">
        {filtered.map((r) => (
          <div key={r.id} className="restaurant-card" onClick={() => handleSelect(r)}>
            <img src={r.image} alt={r.name} />
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
