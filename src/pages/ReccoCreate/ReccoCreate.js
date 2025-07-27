import React, { useState, useEffect } from 'react';
import './ReccoCreate.css';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

function ReccoCreate({ app }) {
  const auth = getAuth(app);
  const [posts, setPosts] = useState({});
  const [selectedPostId, setSelectedPostId] = useState('');
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [imageData, setImageData] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT}/posts.json`)
      .then(res => res.json())
      .then(data => {
        if (data) setPosts(data);
      })
      .catch(err => console.error('Error loading posts:', err));
  }, []);

  useEffect(() => {
    const rec = posts[selectedPostId];
    if (rec && rec.coords && rec.coords.length === 2) {
      const [lat, lon] = rec.coords;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(res => res.json())
        .then(js => setAddress(js.display_name || ''))
        .catch(() => setAddress(''));
    } else {
      setAddress('');
    }
  }, [selectedPostId, posts]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => setImageData(reader.result);
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !selectedPostId || !rating || !review) {
      alert('Fill all required fields');
      return;
    }

    const selectedPost = posts[selectedPostId];
    const restaurantName = selectedPost?.restaurantName;
    if (!restaurantName) {
      alert('Selected post does not have a restaurant name.');
      return;
    }

    const emailKey = user.email.replace(/[.#$[\]]/g, '_');
    const reviewPayload = {
      user: user.email,
      rating: Number(rating),
      review,
      image: imageData,
      address,
      timestamp: Date.now()
    };

    const idToken = await user.getIdToken();
    const path = `Reccomendations/${encodeURIComponent(restaurantName)}/${emailKey}`;
    const url = `${process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT}/${path}.json?auth=${idToken}`;

    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error(`code ${res.status}`);
        alert('Review saved!');
        setSelectedPostId('');
        setRating('');
        setReview('');
        setImageData('');
        setAddress('');
      })
      .catch(err => {
        console.error('Error writing review:', err);
        alert('Failed to submit review.');
      });
  };

  return (
    <div className="recco-form-container">
      <h2>Submit Review</h2>
      <form className="recco-form" onSubmit={handleSubmit}>
        <label>Restaurant</label>
        <select value={selectedPostId} onChange={e => setSelectedPostId(e.target.value)} required>
          <option value="">Select a post</option>
          {Object.entries(posts).map(([id, p]) => (
            <option key={id} value={id}>
              {p.restaurantName || `Post ${id}`}
            </option>
          ))}
        </select>

        <label>Rating</label>
        <select value={rating} onChange={e => setRating(e.target.value)} required>
          <option value="">1–5</option>
          {[1, 2, 3, 4, 5].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <label>Review</label>
        <textarea value={review} onChange={e => setReview(e.target.value)} required />

        <label>Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imageData && <img src={imageData} alt="preview" className="image-preview" />}

        {address && (
          <>
            <label>Address</label>
            <input type="text" value={address} readOnly />
          </>
        )}

        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ReccoCreate;
