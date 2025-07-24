// Updated to send an job to the server instead for the scraping and updating to be done async in the server.
// (previously was done in the browser)
// Now, all updating of scraped data will be done in the server, to prevent desync if user leaves it's done
//

// Scrapes details (from Grab group order link) such as:
async function scrape(link, newId) {
	const res = await fetch(process.env.REACT_APP_SCRAPER_ENDPOINT + "/api/scrape", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url: link, newId: newId })
	});
	const data = await res.json();
	console.log(data);
	return data;
}

// Guess the coordinates of restaurant based on string; returns Latitude/Longitude
async function guessLocation(query, newId) {
	// to get specific mall (from Grab order)
	var qquery = query.split(" - ").pop();
	const res = await fetch(process.env.REACT_APP_SCRAPER_ENDPOINT + "/api/guess-loc?query=" + qquery, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ newId: newId })
	});
	const data = await res.json();
	console.log(data);
	return data;
}

export { scrape, guessLocation };