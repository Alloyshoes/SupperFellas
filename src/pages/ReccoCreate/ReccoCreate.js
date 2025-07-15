import React from 'react';
import { getDatabase, ref, set } from 'firebase/database';
import './ReccoCreate.css';

class ReccoCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      rating: '5',
      location: '',
      imageFile: null,
      review: '',
      submitted: false,
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const { name, rating, location, imageFile, review } = this.state;
    const user = this.props.auth?.currentUser;

    if (!user || !name || !rating || !location || !imageFile || !review) {
      alert('All fields are required.');
      return;
    }

    const imageUrl = await this.uploadImage(imageFile);
    const db = getDatabase(this.props.app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
    const safeEmail = user.email.replace(/\./g, '_');

    const newReview = {
      user: user.email,
      name,
      rating: parseInt(rating),
      location,
      image: imageUrl,
      review: review,
      timestamp: Date.now()
    };

    // Save under the user's email as the key
    await set(ref(db, `recommendations/${name}/reviews/${safeEmail}`), newReview);
    this.setState({ submitted: true });
  };

  uploadImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // base64
      reader.readAsDataURL(file);
    });
  };

  render() {
    if (this.state.submitted) {
      return <div className="recco-create-container"><h2>Recommendation Submitted!</h2></div>;
    }

    return (
      <div className="recco-create-container">
        <h2>Create a Restaurant Recommendation</h2>
        <form onSubmit={this.handleSubmit}>
          <label>Restaurant Name</label>
          <input type="text" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} />

          <label>Rating</label>
          <select value={this.state.rating} onChange={(e) => this.setState({ rating: e.target.value })}>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>

          <label>Location</label>
          <input type="text" value={this.state.location} onChange={(e) => this.setState({ location: e.target.value })} />

          <label>Upload Image</label>
          <input type="file" accept="image/*" onChange={(e) => this.setState({ imageFile: e.target.files[0] })} />

          <label>Review</label>
          <textarea rows="4" value={this.state.review} onChange={(e) => this.setState({ review: e.target.value })}></textarea>

          <button type="submit">Submit Recommendation</button>
        </form>
      </div>
    );
  }
}

export default ReccoCreate;
