import "./Posts.css";

// Post object: (sent as a prop)
/*
	id: 		unique identifier (auto-increment for now)
	link: 		food delivery group order delivery link
	timestamp:  creation time of post
	title: 		title of post
	user:		author of post
*/
const Post = props => {
	const post = props.post;

	return <div className="post-card">
		<div className="post-header">
			<span className="poster">{post.user}</span>
			<span className="timestamp">{new Date(post.timestamp).toLocaleString()}</span>
		</div>
		<div className="post-body">
			<div className="post-title">{post.title}</div>
			<a href={post.link} target="_blank" rel="noreferrer" className="post-link">
				{post.link}
			</a>
		</div>
	</div>;
}

export default Post;