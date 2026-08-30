import { Page, div, span, p, icon, md } from "/app.js";

/* Container: feeds/'s row. Size: default track — five short rows, nothing wants
   more. Own layout: a plain list, one row per city. Regions: one.

   THE FETCH. `initialize()` fires it once; the box (`$box` in content()) is built
   SYNCHRONOUSLY and only ever filled inside `watch()`'s callback — the DOM-after-
   await trap this whole page exists to avoid. `catch()` is the honest half: a
   blocked network or a dead API reads as one quiet row, never a blank column. */

const CITIES = [
	{ name: "London", lat: 51.51, lon: -0.13 },
	{ name: "New York", lat: 40.71, lon: -74.01 },
	{ name: "Tokyo", lat: 35.68, lon: 139.69 },
	{ name: "Sydney", lat: -33.87, lon: 151.21 },
	{ name: "Mexico City", lat: 19.43, lon: -99.13 },
];

// WMO weather codes, banded to a word — not every code, just the common ones.
function sky(code){
	if (code === 0) return "clear";
	if (code <= 3) return "cloudy";
	if (code <= 48) return "fog";
	if (code <= 67) return "rain";
	if (code <= 77) return "snow";
	if (code <= 82) return "showers";
	return "storm";
}

export default new Page({
	meta: import.meta,
	title: "Live",
	description: "Current weather, five cities, one keyless fetch — Open-Meteo.",
	icon: "cloud",

	rows: null,     // null while loading
	failed: false,

	initialize(){
		this.watchers = [];

		const url = "https://api.open-meteo.com/v1/forecast"
			+ "?latitude=" + CITIES.map(c => c.lat).join(",")
			+ "&longitude=" + CITIES.map(c => c.lon).join(",")
			+ "&current=temperature_2m,weather_code,wind_speed_10m";

		fetch(url).then(r => r.ok ? r.json() : Promise.reject(r.status))
			.then(data => { this.rows = data.map((d, i) => ({ ...CITIES[i], ...d.current })); this.notify(); })
			.catch(() => { this.failed = true; this.notify(); });
	},

	watch(fn){ this.watchers.push(fn); fn(); },
	notify(){ this.watchers.forEach(fn => fn()); },

	content(){
		md("One `fetch()`, five cities, no key — [Open-Meteo](https://open-meteo.com). This page is static; the request runs in your browser, live, every time you open it.");

		div.c("feeds-weather", $box => this.watch(() => $box.empty(() => {
			if (this.failed) return div.c("feeds-offline", () => {
				icon("cloud_off");
				span("Could not reach the weather API — offline, or it's down right now. Nothing else on this page needed it.");
			});

			if (!this.rows) return p.c("muted", "Loading…");

			this.rows.forEach(c => div.c("feeds-weather-row", () => {
				span.c("feeds-weather-city", c.name);
				span.c("feeds-weather-cond", sky(c.weather_code) + " · " + Math.round(c.wind_speed_10m) + " km/h");
				span.c("feeds-weather-temp", Math.round(c.temperature_2m) + "°C");
			}));
		})));

		md("**Verdict:** the honest-failure path is one `.catch()` and one class — block the network and this column still renders, calmly, instead of going blank.");
	},
});
