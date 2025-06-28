import React from "react";
import Post from "./Post.js";
import { getDatabase, ref, set } from "firebase/database";

class PostsHome extends React.Component {
	constructor() {
		super();
		this.state = { user: null, items: [], updated: false, postTitle: "", postLink: "" };
	}

	componentDidMount() {
		this.setState({ user: this.props.auth.currentUser, updated: false });

		console.log(this.state.user);
		if (this.state.user === null) {
			console.error("You are not logged in!");
		}
	}

	newPost(e) {
		e.preventDefault();
		if (this.state.postTitle == "" || this.state.postLink == "") return;

		const db = getDatabase(this.props.app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
		console.log(this.state);

		var postObj = {
			id: "placeholder_id",
			link: this.state.postLink,
			timestamp: Date.now(),
			title: this.state.postTitle,
			user: this.state.user.email		// TODO: can change to displayName
		}
		this.state.items.push(postObj);


		console.log("Writing to database...")
		set(ref(db, "/"), {
			posts: this.state.items
		}).then(() => this.setState({ updated: false }));
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

				<div className="add-post-form">
					<h2>Add a new post</h2>
					<form onSubmit={e => this.newPost(e)}>
						<label className="form-label">Title</label>
						<input className="form-input" onChange={(e) => this.setState({ postTitle: e.target.value })} />

						<label className="form-label">Link</label>
						<input className="form-input" onChange={(e) => this.setState({ postLink: e.target.value })} />

						<input className="submit-button" type="submit" value="Submit Post" />
					</form>
				</div>

				{/* Post Feed */}
				{this.state.items.map((post, idx) => <Post key={idx} post={post}></Post>)}
			</div>
		</div>;
	}
}

export default PostsHome;