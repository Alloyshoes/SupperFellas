import { useEffect, useState } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import './RestoDetails.css';
import { Navigate } from 'react-router-dom';

function RestoDetails({ app, selectedRestaurant }) {
  const [reviews, setReviews] = useState([]);
  const [ratingsCount, setRatingsCount] = useState({});
  const [avgRating, setAvgRating] = useState(0);
  const [userReview, setUserReview] = useState({ rating: 5, review: '', image: '' });
  const auth = getAuth(app);
  const user = auth.currentUser;

  const update = () => {
    if (!selectedRestaurant?.name) return;

    const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
    const recoRef = ref(db, `Reccomendations/${selectedRestaurant.name}`);

    get(recoRef).then(snapshot => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      const reviewsArray = Object.entries(data || {}).map(([email, value]) => ({ ...value, email }));

      let totalRating = 0;
      const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      reviewsArray.forEach(r => {
        if (r.rating) {
          totalRating += r.rating;
          countByRating[r.rating] = (countByRating[r.rating] || 0) + 1;
        }
      });

      setReviews(reviewsArray);
      setRatingsCount(countByRating);
      setAvgRating(reviewsArray.length > 0 ? totalRating / reviewsArray.length : 0);

      if (user) {
        const userKey = user.email.replace(/\./g, '_');
        if (data[userKey]) setUserReview(data[userKey]);
      }
    });
  }

  useEffect(() => {
    update();
  }, [app, selectedRestaurant, user]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) =>
      <span key={i}>{i < rating ? '★' : '☆'}</span>
    );
  };

  const handleUpdate = () => {
    if (!user || !selectedRestaurant?.name) return;
    const db = getDatabase(app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
    const userKey = user.email.replace(/\./g, '_');
    const userRef = ref(db, `Reccomendations/${selectedRestaurant.name}/${userKey}`);

    set(userRef, userReview).then(() => {
      alert("Review updated!");

      update();
    });

  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUserReview(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const totalReviews = reviews.length;

  // for no selected restaurant
  if (selectedRestaurant === null) return <Navigate to="/Reco" />

  return (
    <div className="resto-details-container">
      <h2 className="resto-title">{selectedRestaurant?.name}</h2>
      <p className="resto-address">{selectedRestaurant?.location}</p>

      <div className="resto-summary">
        <div className="resto-avg-rating">
          <div className="avg-num">{avgRating.toFixed(1)}</div>
          <div className="stars">{renderStars(Math.round(avgRating))}</div>
          <div className="total">{totalReviews} reviews</div>
        </div>

        <div className="resto-rating-breakdown">
          {[5, 4, 3, 2, 1].map(star => (
            <div className="resto-bar-row" key={star}>
              <span>{star} star</span>
              <div className="resto-bar">
                <div className="resto-fill" style={{
                  width: totalReviews > 0
                    ? `${(ratingsCount[star] || 0) / totalReviews * 100}%`
                    : '0%'
                }} />
              </div>
              <span>{ratingsCount[star] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="resto-reviews">
        {reviews.map((r, idx) => (
          <div key={idx} className="resto-review-card">
            {r.image && <img src={r.image} alt="Review" className="resto-review-image" />}
            <div className="resto-review-content">
              <div className="stars">{renderStars(r.rating)}</div>
              <p>{r.review}</p>
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className="resto-update-form">
          <h3>Update Your Recommendation</h3>
          <label>
            Rating:
            <select value={userReview.rating} onChange={e => setUserReview({ ...userReview, rating: parseInt(e.target.value) })}>
              {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label>
            Review:
            <textarea
              value={userReview.review}
              onChange={e => setUserReview({ ...userReview, review: e.target.value })}
            />
          </label>
          <label>
            Upload Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
          <button onClick={handleUpdate}>Submit</button>
        </div>
      )}
    </div>
  );
}

export default RestoDetails;
