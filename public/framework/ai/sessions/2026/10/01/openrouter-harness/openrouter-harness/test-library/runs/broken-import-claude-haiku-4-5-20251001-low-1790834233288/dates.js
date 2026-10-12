/* The real helper — the fixture's page.js imports the wrong filename (./date.js
 * instead of ./dates.js). This file is correct and should not need to change. */
export function formatDate(d){
	return d.toISOString().slice(0, 10);
}
