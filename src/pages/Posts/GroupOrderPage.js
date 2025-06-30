import { get, getDatabase, ref, set } from "firebase/database";
import { useState } from "react";
import { useParams } from "react-router-dom";
import grabLogo from "../../assets/providers/grab-logo.png";

// The Group Order page is unique to each post, identified by the post ID.
// Includes: group order details, join order, chat feature
const GroupOrderPage = props => {
	const id = useParams().id;
	const db = getDatabase(props.app, process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT);

	const [post, setData] = useState({});
	const [chat, setChat] = useState([]);
	const [msg, setMsg] = useState("");
	const [updated, setStatus] = useState(false);

	if (!updated) {
		get(ref(db, "/posts/" + id)).then(r => {
			setData(r.val());
			setStatus(true);
		});

		get(ref(db, "/chat_data/" + id)).then(r => {
			setChat(r.val());
			setStatus(true);
		});
	}

	console.log(post);
	console.log(updated);

	function sendMessage() {
		set(ref(db, "/chat_data/" + id), [...chat, { from: post.user, text: msg }]).then(() => setStatus(false));
		setMsg("");
	}

	function handleJoin() {
		// TODO: post.user is actually wrong. it needs to be auth.user to be current user
		set(ref(db, "/posts/" + id + "/joinedUsers"), [...post.joinedUsers, post.user]).then(() => setStatus(false));
	}

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

		{!post.joinedUsers?.includes(post.user) && <button className="join-button" onClick={handleJoin}>Join Group Order</button>}

		<hr />

		<h3>Participants</h3>
		<ul className="participants-list">
			{post.joinedUsers ? Object.values(post.joinedUsers).map((u, i) => (
				<li key={i}>{u}</li>
			)) : <p>No one has joined yet!</p>}
		</ul>

		<hr />

		<h3>Group Chat</h3>
		<div className="chat-box">
			{chat.map((m, i) => (
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
		</div>
	</div>
}

export default GroupOrderPage;