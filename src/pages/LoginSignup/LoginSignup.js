import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';

import user_icon from '../../assets/person.png';
import email_icon from '../../assets/email.png';
import password_icon from '../../assets/password.png';

const LoginSignup = props => {
	const auth = props.auth;

	const [action, setAction] = useState("Login");

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const navigate = useNavigate();

	// temp function just to get the auth working ya
	async function submit(e) {
		e.preventDefault();

		if (action === "Login") {
			await signInWithEmailAndPassword(auth, email, password)
				.then(creds => {
					const user = creds.user;
					console.log("Logged in!");
					navigate("/posts");
				})
				.catch(error => {
					console.error(error.code, error.message);
				});

		} else if (action === "Sign Up") {
			await createUserWithEmailAndPassword(auth, email, password)
				.then(creds => {
					const user = creds.user;
					console.log("Successfully signed up!");
					navigate("/posts");
				})
				.catch(error => {
					console.error(error.code, error.message);
				});

		} else {
			console.error("Invalid action state!");
		}
	}

	return (
		<div className="container">
			<div className="header">
				<div className="text">{action}</div>
				<div className="underline"></div>
			</div>
			<div className="inputs"></div>
			{action === "Login" ? <div></div> : <div className="input">
				<img src={user_icon} alt="" />
				<input type="text" onChange={(e) => setName(e.target.value)} placeholder="Name" />
			</div>}

			<div className="input">
				<img src={email_icon} alt="" />
				<input type="email" onChange={(e) => setEmail(e.target.value)} required placeholder='Email Id' />
			</div>
			<div className="input">
				<img src={password_icon} alt="" />
				<input type="password" onChange={(e) => setPassword(e.target.value)} required placeholder='Password' />
			</div>
			{action === "Sign Up" ? <div></div> : <div className="forgot-password">Lost Password? <span>Click Here!</span></div>}
			<div className="submit-container">
				<div className={action === "Login" ? "submit gray" : "submit"} onClick={(e) => { action === "Sign Up" ? submit(e) : setAction("Sign Up"); }}>Sign Up</div>
				<div className={action === "Sign Up" ? "submit gray" : "submit"} onClick={(e) => { action === "Login" ? submit(e) : setAction("Login"); }}>Login</div>
			</div>
		</div>
	)
}

export default LoginSignup;
