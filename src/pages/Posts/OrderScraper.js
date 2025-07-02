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

export default scrape;