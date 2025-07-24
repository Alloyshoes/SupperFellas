import React from "react";
import Post from "./Post.js";
import "./Posts.css";
import { getDatabase, ref, set, update } from "firebase/database";
import { scrape, guessLocation } from "./OrderScraper.js";

class PostsHome extends React.Component {
	constructor() {
		super();
		this.state = { user: null, items: {}, updated: false, postTitle: "", postLink: "" };
	}

	componentDidMount() {
		this.setState({ user: this.props.auth.currentUser, updated: false });

		if (this.state.user === null) {
			console.error("You are not logged in!");
		}
	}

	newPost(e) {
		// set limit for demo (10 posts)
		if (Object.keys(this.state.items).length == 10) {
			console.log("[DEMO] For testing purposes, number of posts allowed is limited to 10!");
			return;
		}

		e.preventDefault();
		e.target.reset();
		if (this.state.postTitle == "" || this.state.postLink == "") {
			alert("Please don't leave the fields blank!");
			return;
		};

		const db = getDatabase(this.props.app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
		const newId = Math.random().toString(36).substring(2, 10); 	// random 8-digit id
		if (Object.keys(this.state.items).includes(newId)) {
			this.newPost(e);
			return;
		}

		var postObj = {
			link: this.state.postLink,
			timestamp: Date.now(),
			title: this.state.postTitle,
			user: this.state.user.email,		// TODO: can change to displayName next time
			joinedUsers: [this.state.user.email]
		}
		// order scraper action insert
		scrape(this.state.postLink, newId).then(data => {
			if (data === null) alert("Link is invalid!");
			this.setState({ updated: false });

			// this linkage is done server-side too
			// // guessLoc
			// var restaurant = data.restaurantName;
			// guessLocation(restaurant, newId).then(data => {
			// 	console.log("Guessed coordinates: " + data);
			// 	this.setState({ updated: false });
			// })
		});

		console.log("Writing to database...")
		set(ref(db, "/posts/" + newId), postObj).then(() => this.setState({ updated: false }));
	}

	render() {
		if (this.state.user === null) {
			return <div style={{ fontSize: 100, textAlign: "center", color: "red" }}>You are not logged in!</div>
		}

		// hack-y way to get data from database lol
		const endpoint = process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT + "/.json";
		if (!this.state.updated) {
			console.log("Retrieving from database...");
			fetch(endpoint).then(e => e.json().then(root => this.setState({ items: root.posts, updated: true })));
		}

		return <div>
			<div className="posts-home-container">
				<div id="welcome-text">Welcome back {this.state.user.email}!</div>

				{/* TODO: to be exported into PostsCreator component */}
				<div className="add-post-form">
					<h2>Start a new group order!</h2>
					<form onSubmit={e => this.newPost(e)}>
						<label className="form-label">Title</label>
						<input className="form-input" onChange={(e) => this.setState({ postTitle: e.target.value })} />

						<label className="form-label">Link</label>
						<input className="form-input" onChange={(e) => this.setState({ postLink: e.target.value })} />

						<input className="submit-button" type="submit" value="Submit Post" />
					</form>
				</div>
				<hr /> <br />

				{/* Post Feed */}
				{Object.values(this.state.items).map((post, idx) => <Post key={idx} post={post} id={Object.keys(this.state.items)[idx]}></Post>)}
			</div>
		</div>;
	}
}

export default PostsHome;