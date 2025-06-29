import React from "react";

// The Group Order page is unique to each post, identified by the post ID.
// Includes: group order details, join order, chat feature
class GroupOrderPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		// ID is from this.props.id, rest of the details are from the database
		const id = this.props.id;
	}

	render() {
		return <div>
			
		</div>;
	}
}

export default GroupOrderPage;