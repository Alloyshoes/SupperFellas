import React from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import './ReccoCreate.css';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';

class ReccoCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      rating: '5',
      location: '',
      lat: '',
      lon: '',
      imageFile: null,
      review: '',
      suggestions: [],
      submitted: false,
      selectedSuggestion: null,
    };
    this.debounceTimeout = null;
  }
  // for use outside of ReccoCreate
  static async newReco(name, rating, location, lat, lon, imageUrl, review) {
    const user = getAuth().currentUser;
    const safeEmail = user.email.replace(/\./g, '_');
    const db = getDatabase(getApp(), process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);

    const newReview = {
      user: user.email,
      name,
      rating: parseInt(rating),
      location,
      lat,
      lon,
      image: imageUrl,
      review,
      timestamp: Date.now()
    };

    await set(ref(db, `recommendations/${name}/reviews/${safeEmail}`), newReview);
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const { name, rating, location, lat, lon, imageFile, review, selectedSuggestion } = this.state;
    const user = getAuth().currentUser;

    if (!user || !name || !rating || !location || !imageFile || !review || !selectedSuggestion) {
      alert('All fields are required and a valid location must be selected.');
      return;
    }

    const imageUrl = await this.uploadImage(imageFile);
    await ReccoCreate.newReco(name, rating, location, lat, lon, imageUrl, review);
    this.setState({ submitted: true });
  };


  uploadImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // base64 string
      reader.readAsDataURL(file);
    });
  };

  handleLocationChange = (e) => {
    const value = e.target.value;
    this.setState({
      location: value,
      selectedSuggestion: null,
      lat: '',
      lon: ''
    });

    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      if (value.length > 2) {
        this.fetchLocationSuggestions(value);
      }
    }, 300);
  };

  fetchLocationSuggestions = async (query) => {
    const apiKey = process.env.REACT_APP_LOCATIONIQ_API_KEY;
    const url = `https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&limit=5&format=json&countrycodes=sg`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        this.setState({ suggestions: data });
      } else {
        console.error('Unexpected response:', data);
        this.setState({ suggestions: [] });
      }
    } catch (err) {
      console.error('Location autocomplete error:', err);
      this.setState({ suggestions: [] });
    }
  };

  handleLocationSelect = (value) => {
    const selected = this.state.suggestions.find(s => s.display_name === value);
    if (selected) {
      this.setState({
        location: selected.display_name,
        lat: selected.lat,
        lon: selected.lon,
        selectedSuggestion: selected
      });
    }
  };

  render() {
    const { name, rating, location, review, submitted, suggestions } = this.state;

    if (submitted) {
      return <div className="recco-create-container"><h2>Recommendation Submitted!</h2></div>;
    }

    return (
      <div className="recco-create-container">
        <h2>Create a Restaurant Recommendation</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Restaurant Name</label>
          <input type="text" value={name} onChange={(e) => this.setState({ name: e.target.value })} />

          <label>Rating</label>
          <select value={rating} onChange={(e) => this.setState({ rating: e.target.value })}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <label>Location</label>
          <input
            list="location-suggestions"
            type="text"
            value={location}
            onChange={this.handleLocationChange}
            onBlur={(e) => this.handleLocationSelect(e.target.value)}
            placeholder="Start typing address..."
          />
          <datalist id="location-suggestions">
            {suggestions.map((s, idx) => (
              <option key={idx} value={s.display_name} />
            ))}
          </datalist>

          <label>Upload Image</label>
          <input type="file" accept="image/*" onChange={(e) => this.setState({ imageFile: e.target.files[0] })} />

          <label>Review</label>
          <textarea rows="4" value={review} onChange={(e) => this.setState({ review: e.target.value })}></textarea>

          <button type="submit">Submit Recommendation</button>
        </form>
      </div>
    );
  }
}

export default ReccoCreate;
