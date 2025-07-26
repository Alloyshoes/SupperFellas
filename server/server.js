// Simple server... Just to post Puppeteer. Will expand in the future
// For database (more structured) and other endpoints

// I know in the proposal I indicated Spring Boot Java, but this is Express. 
// Due to time, this is just a temp and quick addon with the sole purpose of running puppeteer.
// I will eventually change this to a proper server setup. (if there's time D:)
// -isaac

const express = require("express");
require("dotenv").config();
const puppeteer = require("puppeteer");
const cors = require("cors");
const https = require("https");
const { Worker } = require("worker_threads");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
	res.send("Ping!");
})

/*
	All scraping/location guessing --> update database will be done server-side. 
	This is to allow the updating of the database to be done regardless of whether the client waits or not
*/
const db = require("./firebase.config");

// makes life a bit more easier ya
async function guessJob(query, newId) {
	console.log("Guessing location of: '" + query + "'");

	async function _guess(query) {
		const endp = "https://www.onemap.gov.sg/api/common/elastic/search?returnGeom=Y&getAddrDetails=N&pageNum=1&searchVal="
		var coords = [];
		await https.get(endp + query, {
			headers: { "Authorization": process.env.ONEMAP_API_KEY }
		}, (resp) => {
			var data = {};
			resp.on("data", d => data = d);
			resp.on("close", async () => {
				data = JSON.parse(data);
				console.log(data);

				if (data.found === 0) {
					return {};
				}
				var d = data.results[0];
				coords = [d.LATITUDE, d.LONGITUDE];
				await db.ref("/posts/" + newId).update({ coords: coords });	// update database
			})
		});

		return coords;
	}
	try {
		var coords = _guess(query);
		return coords;

	} catch (err) {
		console.error("Error while guessing location coords:", err);

		await _guess(query);
	}
}

// scrape grab restaurant data
app.post("/api/scrape", async (req, res) => {
	const link = req.body.url;
	const newId = req.body.newId;
	console.log("Scraping: " + link);


	const checkLink = link => {
		// checks if link is valid (grab group order for now)
		return link.startsWith("https://r.grab.com/o/");
	}

	// Scrapes details (from Grab group order link) such as:
	/*
		1. Restaurant Title
		2. Cuisine
		3. Distance
	*/
	if (!checkLink(link)) return null;	// link is not valid

	async function _scrape(link) {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto(link, { waitUntil: "networkidle2" });
		console.log("Scraping " + link + " ...");

		const result = await page.evaluate(() => {
			const restaurantName = document.getElementsByClassName("name___1Ls94")[0].textContent;
			const cuisineInfo = document.getElementsByClassName("cuisine___3sorn infoRow___3TzCZ")[0].textContent;
			const distanceInfo = document.getElementsByClassName("distance___3UWcK")[0].textContent;
			console.log(restaurantName);
			console.log(cuisineInfo);
			console.log(distanceInfo);

			return { restaurantName, cuisineInfo, distanceInfo };
		})

		await browser.close();
		console.log("Done.");
		console.log(result);
		console.log("Updating database...");
		await (db.ref("/posts/" + newId).update({ ...result }));	// update database

		return result;
	}

	try {
		var result = await _scrape(link);
		res.json(result);

		// might as well link to guess-loc for continuity lol
		var qquery = result.restaurantName.split(" - ").pop();
		try {
			await guessJob(qquery, newId);
		} catch (err) {
			console.error("Guess location failed! " + err);
		}

	} catch (err) {
		console.error("Error while scraping:", err);
		res.status(500).json({ error: "Scrape failed!" });

		await _scrape(link);
	}
});

// guess restaurant location coords
app.get("/api/guess-loc", async (req, res) => {
	var query = req.query.query;
	const newId = req.body.newId;

	try {
		var coords = await guessJob(query, newId);
		res.json(coords);

	} catch (err) {
		res.status(500).json({ error: "Guess location failed!" });
	}
});


app.listen(PORT, () => {
	console.log("Server listening on PORT " + PORT);
});
