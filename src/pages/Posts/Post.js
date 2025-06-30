import "./Posts.css";
import grabLogo from "../../assets/providers/grab-logo.png";
import { useNavigate } from "react-router-dom";

// Post object: (sent as a prop)
/*
	id: 		unique identifier (auto-increment for now)
	link: 		food delivery group order delivery link
	timestamp:  creation time of post
	title: 		title of post
	user:		author of post

	from scrape
	===========
	restaurant name
	distance info
	cuisine tags
*/
const Post = ({ post, id }) => {
	const navigate = useNavigate();
	const handleClick = () => navigate(`/order/${id}`)

	const isGrab = post.link.includes("grab"); 	// TODO: better check if it is a valid grab link

	return <div className="post-card" onClick={handleClick}>
		<div className="post-header">
			<span className="poster">{post.user}</span>
			<span className="timestamp">{new Date(post.timestamp).toLocaleString()}</span>
		</div>
		<div className="post-body">
			<div className="post-title">{post.title}</div>
			{isGrab && <img src={grabLogo} className="provider-logo"></img>}

			{post.restaurantName && <div className="restaurant-name">{post.restaurantName}</div>}
			{post.distanceInfo && <div className="distance-info">{post.distanceInfo}</div>}
			{post.cuisineInfo && <div className="cuisine-info">{post.cuisineInfo.replaceAll(",", ", ")}</div>}

			<a href={post.link} target="_blank" rel="noreferrer" className="post-link">
				{post.link}
			</a>
		</div>
	</div>;
}

export default Post;