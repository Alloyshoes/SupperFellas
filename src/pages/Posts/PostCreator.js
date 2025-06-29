import React from "react";
import "./Posts.css";

// The form component to create a new group order post; updates the database (WIP; currently in PostsHome)
class PostCreator extends React.Component {
	constructor() {
		super();
		this.state = {};
	}

	componentDidMount() {

	}

	render() {
		return <div className="add-post-form">
			<h2>Start a new group order!</h2>
			<form onSubmit={e => this.newPost(e)}>
				<label className="form-label">Title</label>
				<input className="form-input" onChange={(e) => this.setState({ postTitle: e.target.value })} />

				<label className="form-label">Link</label>
				<input className="form-input" onChange={(e) => this.setState({ postLink: e.target.value })} />

				<input className="submit-button" type="submit" value="Submit Post" />
			</form>
		</div>;
	}
}

export default PostCreator;