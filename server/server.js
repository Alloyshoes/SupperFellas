// Simple server... Just to post Puppeteer. Will expand in the future
// For database (more structured) and other endpoints

// I know in the proposal I indicated Spring Boot Java, but this is Express. 
// Due to time, this is just a temp and quick addon with the sole purpose of running puppeteer.
// I will eventually change this to a proper server setup.
// -isaac

const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const puppeteer = require("puppeteer");
const cors = require("cors");
const https = require("https");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
	res.send("Ping!");
})

// scrape grab restaurant data
app.post("/api/scrape", async (req, res) => {
	try {
		const link = req.body.url;
		console.log(link);


		const checkLink = link => {
			// checks if link is valid (grab group order for now)
			return link.startsWith("https://r.grab.com/o/");
		}

		// Scrapes details (from Grab group order link) such as:
		/*
			1. Restaurant Title
			2. Location
			3.
		*/
		if (!checkLink(link)) return null;	// link is not valid

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
		res.json(result);

	} catch (err) {
		console.error("Error while scraping:", err);
		res.status(500).json({ error: "Scrape failed!" });
	}
});

// guess restaurant location coords
app.get("/api/guess-loc", async (req, res) => {
	try {
		var query = req.query.query;
		console.log("Guessing location of: '" + query + "'");
		const endp = "https://www.onemap.gov.sg/api/common/elastic/search?returnGeom=Y&getAddrDetails=N&pageNum=1&searchVal="
		https.get(endp + query, {
			headers: { "Authorization": process.env.ONEMAP_API_KEY }
		}, (resp) => {
			var data = {};
			resp.on("data", d => data = d);
			resp.on("close", () => {
				data = JSON.parse(data);
				console.log(data);

				if (data.found === 0) {
					res.json({});
					return;
				}
				var d = data.results[0];
				res.json([d.LATITUDE, d.LONGITUDE]);
			})
		});

	} catch (err) {
		console.error("Error while guessing location coords:", err);
		res.status(500).json({ error: "Guess location failed!" });
	}
});


app.listen(PORT, () => {
	console.log("Server listening on PORT " + PORT);
});
