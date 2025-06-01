import React from "react";

class PostsHome extends React.Component {
	constructor() {
		super();
		this.state = { user: null, items: ["one", "two", "three"] };
	}

	componentDidMount() {
		this.setState({ user: this.props.auth.currentUser });
		console.log(this.props)

		console.log(this.state.user);
		if (!this.state.user) {
			console.error("You are not logged in!")
		}
	}

	render() {
		if (this.state.user === null) {
			return <div style={{ fontSize: 100, textAlign: "center", color: "red" }}>You are not logged in!</div>
		}

		return <div>
			<div style={{ fontSize: 50, textAlign: "center" }}>Welcome back {this.state.user.email}!</div>
			<div id="postsContainer" style={{ fontSize: 30, padding: 70 }}>
				Add a new post: <br />
				<input id="newPost"></input> <br />
				<button>Submit</button>
				<ul>
					{this.state.items.map(i => <li>{i}</li>)}
				</ul>
			</div>
		</div>;
	}
}

export default PostsHome;