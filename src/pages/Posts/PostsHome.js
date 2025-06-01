import React from "react";
import { getDatabase, ref, set } from "firebase/database";

class PostsHome extends React.Component {
	constructor() {
		super();
		this.state = { user: null, items: [], updated: false, newItem: "" };
	}

	componentDidMount() {
		this.setState({ user: this.props.auth.currentUser, updated: false });

		console.log(this.state.user);
		if (this.state.user === null) {
			console.error("You are not logged in!")
		}
	}

	addPost(items, item) {
		const db = getDatabase(this.props.app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);
		items.push(item);
		if (item !== "") {
			console.log("Writing to database...")
			set(ref(db, "/"), {
				posts: items
			}).then(() => this.setState({ updated: false }));
		}
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
			<div style={{ fontSize: 50, textAlign: "center" }}>Welcome back {this.state.user.email}!</div>
			<div id="postsContainer" style={{ fontSize: 30, padding: 70 }}>
				Add a new post: <br />
				<input id="newPost" onChange={(e) => this.setState({ newItem: e.target.value })}></input> <br />
				<button onClick={() => this.addPost(this.state.items, this.state.newItem)}>Submit</button>
				<ul>
					{this.state.items.map(i => <li>{i}</li>)}
				</ul>
			</div>
		</div>;
	}
}

export default PostsHome;