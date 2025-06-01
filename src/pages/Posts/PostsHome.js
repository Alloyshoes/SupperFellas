import React from "react";

class PostsHome extends React.Component {
	constructor() {
		super();
		this.state = { user: null, items: [] };
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
		</div>;
	}
}

export default PostsHome;