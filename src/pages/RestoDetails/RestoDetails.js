import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get, update } from 'firebase/database';
import './RestoDetails.css';

function RestoDetails({ app, auth, restaurant }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState('5');

  const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);

  useEffect(() => {
    if (!restaurant) return;

    const restaurantRef = ref(db, `recommendations/${restaurant.id}/reviews`);
    get(restaurantRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setReviews(Object.values(data));
      }
    });
  }, [db, restaurant]);

  const handleSubmitReview = async () => {
    if (!auth.currentUser) {
      alert("Please login to submit a review.");
      return;
    }

    const safeEmail = auth.currentUser.email.replace(/\./g, '_');
    const reviewRef = ref(db, `recommendations/${restaurant.id}/reviews/${safeEmail}`);

    const newReview = {
      rating: parseInt(userRating),
      review: userReview,
      timestamp: Date.now(),
      user: auth.currentUser.email
    };


    // Only update rating and review
    await update(reviewRef, newReview);

    // Refresh reviews list
    const updatedSnapshot = await get(ref(db, `recommendations/${restaurant.id}/reviews`));
    if (updatedSnapshot.exists()) {
      setReviews(Object.values(updatedSnapshot.val()));
    }

    setUserReview('');
    setUserRating('5');
  };

  if (!restaurant) {
    return (
      <div className="detail-page">
        <p>No restaurant selected. Go back to <button onClick={() => navigate('/Reco')}>search</button>.</p>
      </div>
    );
  }

  const ratingsCount = [1, 2, 3, 4, 5].map(rating =>
    reviews.filter(r => r.rating === rating).length
  );

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
        {restaurant.image && <img src={restaurant.image} alt={restaurant.name} style={{ maxWidth: "300px", marginTop: "10px" }} />}
      </div>

      <div className="ratings-breakdown">
        <h3>Ratings Breakdown</h3>
        {[5, 4, 3, 2, 1].map((star, i) => (
          <p key={star}>{star} stars: {'█'.repeat(ratingsCount[star - 1])}</p>
        ))}
      </div>

      <div className="review-list">
        <h3>Reviews</h3>
        {reviews.map((r, idx) => (
          <div key={idx} className="review">
            <p className="review-user">{r.user} - {renderStars(r.rating)}</p>
            <p className="review-text">{r.review}</p>
          </div>
        ))}
      </div>

      <div className="submit-review">
        <h3>Submit/Update Your Review</h3>
        <label>Rating</label>
        <select value={userRating} onChange={(e) => setUserRating(e.target.value)}>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <label>Review</label>
        <textarea value={userReview} onChange={(e) => setUserReview(e.target.value)} rows="4" />
        <button onClick={handleSubmitReview}>Submit Review</button>
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
