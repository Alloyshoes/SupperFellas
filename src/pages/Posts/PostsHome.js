import React from "react";
import Post from "./Post.js";
import "./Posts.css";
import { get, getDatabase, ref, set, update } from "firebase/database";
import { scrape, guessLocation } from "./OrderScraper.js";
import { getAuth } from "firebase/auth";

class PostsHome extends React.Component {
	constructor() {
		super();
		this.state = { user: null, items: {}, updated: false, postTitle: "", postLink: "" };
	}

	componentDidMount() {
		const auth = getAuth();
		auth.authStateReady().then(() => {
			this.setState({ user: auth.currentUser, updated: false });
			console.log(auth.currentUser)
		})

		if (this.state.user === null) {
			console.error("You are not logged in!");
		}
	}

	newPost(e) {
		// set limit for demo
		if (Object.keys(this.state.items).length >= 15) {
			alert("[DEMO] For testing purposes, number of posts is limited to 15!");
			return;
		}

		e.preventDefault();
		e.target.reset();
		if (this.state.postTitle == "" || this.state.postLink == "") {
			alert("Please don't leave the fields blank!");
			return;
		};

		// limit to grab group order links only (temp)
		if (!this.state.postLink.startsWith("https://r.grab.com/o/")) {
			alert("Please only input Grab group order links only! :(");
			return;
		}

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
			if (data === null) window.alert("Link is invalid!");
			this.setState({ updated: false });

			// this linkage has been done on the server-side 
			// // guessLoc
			// var restaurant = data.restaurantName;
			// guessLocation(restaurant, newId).then(data => {
			// 	console.log("Guessed coordinates: " + data);
			// 	this.setState({ updated: false });
			// })
		});

		console.log("Writing to database...")
		set(ref(db, "/posts/" + newId), postObj).then(() => this.setState({ updated: false }));

		alert("Group order posted!");
	}

	render() {
		if (this.state.user === null) {
			return <div style={{ fontSize: 100, textAlign: "center" }}>Loading...</div>
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
				<div><b>Open Orders:</b></div> <br />
				{Object.values(this.state.items).map((post, idx) => <Post key={idx} post={post} id={Object.keys(this.state.items)[idx]}></Post>)}
			</div>
		</div>;
	}
}

export default PostsHome;