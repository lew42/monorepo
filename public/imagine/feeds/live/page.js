import { Page, div, span, p, button, icon, img, md } from "/app.js";

const here = new URL(".", import.meta.url).pathname;

/* Container: feeds/'s row. Size: default track — five short rows, nothing wants
   more. Own layout: a control bar, then a plain list, one row per city. Regions: one.

   THE FETCH. `initialize()` fires it once; the box (`$box` in content()) is built
   SYNCHRONOUSLY and only ever filled inside `watch()`'s callback — the DOM-after-
   await trap this whole page exists to avoid. `catch()` is the honest half: a
   blocked network or a dead API reads as one quiet row, never a blank column.

   ACTUALLY LIVE: `activated()` starts a 60s poll plus a 1s status ticker;
   `deactivated()` clears both, so a tab nobody is looking at never fetches. The
   pause toggle only flips a flag the poll checks before it fires — `load()` is
   the one fetch function either way, called at boot and by the poll alike. */

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
	description: "Current weather, five cities, one keyless fetch — Open-Meteo. Auto-refreshes; pause any time.",
	icon: "cloud",

	rows: null,     // null while loading
	failed: false,
	live: true,
	updated_at: null,

	initialize(){
		this.watchers = [];
		this.load();
	},

	load(){
		const url = "https://api.open-meteo.com/v1/forecast"
			+ "?latitude=" + CITIES.map(c => c.lat).join(",")
			+ "&longitude=" + CITIES.map(c => c.lon).join(",")
			+ "&current=temperature_2m,weather_code,wind_speed_10m";

		fetch(url).then(r => r.ok ? r.json() : Promise.reject(r.status))
			.then(data => {
				this.rows = data.map((d, i) => ({ ...CITIES[i], ...d.current }));
				this.failed = false;
				this.updated_at = Date.now();
				this.notify();
			})
			.catch(() => { this.failed = true; this.notify(); });
	},

	// Only while this page is actually being viewed — a poll on a page nobody
	// opened would run forever for nothing.
	activated(){
		this.poll ??= () => { if (this.live) this.load(); };
		this.tick ??= () => this.$status?.text(this.moment());
		this.timer = setInterval(this.poll, 60_000);
		this.ticker = setInterval(this.tick, 1_000);
	},

	deactivated(){
		clearInterval(this.timer);
		clearInterval(this.ticker);
	},

	watch(fn){ this.watchers.push(fn); fn(); },
	notify(){ this.watchers.forEach(fn => fn()); },

	// A real still of real numbers (2026-09-05 rethink) — a snapshot, never the live
	// fetch itself: the hub's card must not poll the API just because it is on screen.
	preview(nav){
		return this.preview_card(nav, () => img.c("feeds-shot").attr("src", here + "../shots/live.jpg").attr("alt", nav.label));
	},

	moment(){
		if (this.failed) return "offline";
		if (!this.updated_at) return "loading…";
		const secs = Math.round((Date.now() - this.updated_at) / 1000);
		return (this.live ? "updated " : "paused · updated ") + secs + "s ago";
	},

	content(){
		md("One `fetch()`, five cities, no key — [Open-Meteo](https://open-meteo.com). This page polls every minute while it's live — pause any time; the request still runs in your browser, never a server.");

		div.c("feeds-live", () => {
			div.c("feeds-live-bar flex gap v-center", () => {
				button.c("feeds-live-toggle", $btn => this.watch(() => {
					$btn.text(this.live ? "Live" : "Paused");
					$btn.tc("feeds-live-on", this.live);
				})).on("click", () => { this.live = !this.live; this.notify(); });

				span.c("feeds-live-status", $s => { this.$status = $s; this.watch(() => $s.text(this.moment())); });
			});

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
		});

		md("**Verdict:** the honest-failure path is one `.catch()` and one class — block the network and this column still renders, calmly, instead of going blank. Live now means live: a minute poll and a pause toggle, not a page that was only ever going to be fetched the one time you opened it.");
	},
});
