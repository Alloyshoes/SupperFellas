import { useNavigate } from 'react-router-dom';
import './RestoDetails.css';

const reviews = [
  {
    user: "Ben Sia",
    rating: 5,
    text: "Good experience with the Briyani chicken. Rice is soft and fluffy. Chicken is tasty and portion is generous."
  },
  {
    user: "Alice Tan",
    rating: 4,
    text: "Loved the prata, crispy and flavorful. Service could be faster during peak hours."
  }
];

function RestoDetails({ restaurant }) {
  const navigate = useNavigate();

  if (!restaurant) {
    return (
      <div className="detail-page">
        <p>No restaurant selected. Go back to <button onClick={() => navigate('/Reco')}>search</button>.</p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <button className="back-button" onClick={() => navigate('/Reco')}>← Back to search</button>
      <div className="detail-header">
        <h2>{restaurant.name}</h2>
        <div className="detail-meta">
          <span className="stars">{renderStars(restaurant.rating)}</span>
          <span className="reviews">({restaurant.reviews} reviews)</span>
        </div>
        <p className="detail-location">{restaurant.location}</p>
      </div>
      <div className="ratings-breakdown">
        <h3>Ratings Breakdown</h3>
        <p>5 stars: ██████████</p>
        <p>4 stars: ████</p>
        <p>3 stars: █</p>
        <p>2 stars: </p>
        <p>1 star: </p>
      </div>
      <div className="review-list">
        <h3>Reviews</h3>
        {reviews.map((r, idx) => (
          <div key={idx} className="review">
            <p className="review-user">{r.user} - {renderStars(r.rating)}</p>
            <p className="review-text">{r.text}</p>
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

export default RestoDetails;
