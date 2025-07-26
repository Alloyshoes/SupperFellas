require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./supperfellas-firebase-admin-serviceaccount.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_ENDPOINT
});
const db = admin.database();

module.exports = db;
