// Scrapes details (from Grab group order link) such as:
/*
	1. Restaurant Title
	2. Location
	3.
*/
async function scrape(link) {
	const res = await fetch(process.env.REACT_APP_SCRAPER_ENDPOINT + "/api/scrape", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ url: link })
	});
	const data = await res.json();
	console.log(data);
	return data;
}

// Guess the coordinates of restaurant based on string; returns Latitude/Longitude
async function guessLocation(query) {
	// to get specific mall
	var qquery = query.split(" - ").pop();
	const res = await fetch(process.env.REACT_APP_SCRAPER_ENDPOINT + "/api/guess-loc?query=" + qquery, {
		method: "GET"
	});
	const data = await res.json();
	console.log(data);
	return data;
}

export { scrape, guessLocation };