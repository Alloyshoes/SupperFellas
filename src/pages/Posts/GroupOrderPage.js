import { get, getDatabase, ref, set, remove } from "firebase/database";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import grabLogo from "../../assets/providers/grab-logo.png";
import { getAuth } from "firebase/auth";

// The Group Order page is unique to each post, identified by the post ID.
// Includes: group order details, join order, chat feature
const GroupOrderPage = props => {
	const id = useParams().id;
	const db = getDatabase(props.app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);

	const [post, setData] = useState({});
	const [chat, setChat] = useState([]);
	const [msg, setMsg] = useState("");
	const [updated, setStatus] = useState(false);
	const [user, setUser] = useState(null);

	const [isReviewing, setReviewingStatus] = useState(false);
	const [review, setReview] = useState("");
	const [stars, setStars] = useState(5);

	const auth = getAuth();
	auth.authStateReady().then(() => {
		setUser(auth.currentUser);
	})

	const navigate = useNavigate();

	if (!updated) {
		get(ref(db, "/posts/" + id)).then(r => {
			setData(r.val());
			setStatus(true);
		});

		get(ref(db, "/chat_data/" + id)).then(r => {
			setChat(r.val() ?? []);
			setStatus(true);
		});
	}

	function sendMessage() {
		// set limit for demo
		if (chat.length >= 15) {
			alert("[DEMO] For testing purposes, chat messages per group order post is limited to 15!");
			return;
		}

		set(ref(db, "/chat_data/" + id), [...chat, { from: user.email, text: msg }]).then(() => setStatus(false));
		setMsg("");
	}

	function handleJoin() {
		set(ref(db, "/posts/" + id + "/joinedUsers"), [...post.joinedUsers, user.email]).then(() => setStatus(false));
		window.open(post.link);	// opens link in new tab
	}

	function handleClose() {
		if (!window.confirm("Are you sure you want to close this group order? This action cannot be undone.")) return;
		remove(ref(db, "/posts/" + id));
		navigate("/Posts");
	}

	if (user === null) return <div></div>;

	return <div className="grouporder-container">
		<div className="order-header">
			<h1 className="restaurant-name">{post.restaurantName}</h1>
			{post.link?.includes("grab") && (
				<img src={grabLogo} className="provider-logo-badge" />
			)}
		</div>

		<p className="order-title">“{post.title}”</p>
		<p><strong>Created by:</strong> {post.user}</p>
		<p><strong>Distance:</strong> {post.distanceInfo}</p>
		<p><strong>Cuisine:</strong> {post.cuisineInfo}</p>

		{!post.joinedUsers?.includes(user.email) && <button className="join-button" onClick={handleJoin}>Join Group Order</button>}
		{post.user === user.email && <button className="close-button" onClick={handleClose}>Close Group Order</button>}

		<hr />

		<h3>Participants</h3>
		<ul className="participants-list">
			{post.joinedUsers ? Object.values(post.joinedUsers).map((u, i) => (
				<li key={i}>{u}</li>
			)) : <p>No one has joined yet!</p>}
		</ul>

		<hr />

		{
			isReviewing ?
				<div>
					{/* Review Container*/}
					<h3>Leave a Review</h3>
					<div className="chat-input">
						<textarea rows="4" value={review} onChange={(e) => setReview(e.target.value)}></textarea>
						<button onSubmit={reviewSubmit}>
							Submit
						</button>
					</div>
					<select value={stars} onChange={(e) => setStars(e.target.value)}>
						{[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
					</select>
				</div>
				:
				<div>
					{/* Group Chat Container */}
					<h3>Group Chat</h3>
					<div className="chat-box">
						{chat?.map((m, i) => (
							<div key={i} className="chat-message">
								<strong>{m.from}:</strong> {m.text}
							</div>
						))}
					</div>
					<div className="chat-input">
						<input
							value={msg}
							onChange={(e) => setMsg(e.target.value)}
							placeholder="Type message..."
						/>
						<button onClick={sendMessage}>Send</button>
					</div></div>
		}
	</div>
}

export default GroupOrderPage;