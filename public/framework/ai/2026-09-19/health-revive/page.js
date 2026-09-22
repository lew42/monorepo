import { Page, p, md, div, span, img, View } from "/app.js";
import { HealthLog, today_url } from "/framework/ai/health/log.js";

View.stylesheet(import.meta, "/framework/ai/health/health.css");   // reused, not duplicated — same three status colors

const HEARTBEAT_URL = "/framework/ai/health/heartbeat.json";
const PROOF_URL = "/framework/ai/2026-09-19/health-revive/scratch-break/";

/* One screen: what the watcher is, proof it is alive right now, and proof it
   actually caught a real break tonight. Everything below content() reads
   LIVE data (the heartbeat file, today's health log) rather than describing
   a moment-in-time result, so this page keeps telling the truth after it
   lands. Full watcher design: /framework/ai/health/. */
export default new Page({
	meta: import.meta,
	title: "Health, revived",
	icon: "monitor_heart",
	description: "The dead page-health watcher, supervised and pointed at the live site.",
	children: "scratch-break",

	content(){
		md("**`Server/health.mjs` was dead tonight** — no process, and nothing that would " +
			"ever have restarted it or told anyone. This task put a small supervisor in front " +
			"of it, pointed it at the owner's own live site instead of a server that wasn't " +
			"running, and proved end to end that it catches a real break. Full watcher design " +
			"and every finding today: [/framework/ai/health/](/framework/ai/health/).");

		div.c("health-section", () => {
			div.c("health-head", "What is watched, and how");
			p("Every time a file under public/ changes, the watcher works out which page(s) that " +
				"file could have broken — its own page.js, or (for a shared file like framework.css) " +
				"a fixed set of canary pages plus its own — and loads them in a hidden browser " +
				"against http://localhost:80, the owner's own real site, read-only. That is a " +
				"deliberate choice: checking a private copy would prove nothing about the page the " +
				"owner is actually looking at.");
		});

		const $alive = div.c("health-section");
		poll_heartbeat($alive);

		div.c("health-section", () => {
			div.c("health-head", "What happens when it finds something");
			p("A finding is written as one line to today's health log, and the very next time the " +
				"agent who touched that file writes anything else, a hook (health-guard.mjs) tells " +
				"them plainly what they broke — before they do anything further. The proof below " +
				"shows both halves, captured while building this: the watcher noticing, and the " +
				"hook then blocking the very next write, unprompted.");
		});

		const $proof = div.c("health-section");
		load_proof($proof);
	},
});

/* ── is it alive right now? — reads Server/health-supervisor.mjs's own heartbeat ── */

function poll_heartbeat($box){
	async function tick(){
		let hb = null;
		try {
			const res = await fetch(HEARTBEAT_URL + "?_=" + Date.now());
			if (res.ok) hb = await res.json();
		} catch {}
		$box.empty(() => render(hb));
	}
	tick();
	setInterval(tick, 10_000);
}

function render(hb){
	div.c("health-head", "Is it alive right now?");
	if (!hb){
		p("No heartbeat file yet — the supervisor isn't running. Start it: " +
			"`node Server/health-supervisor.mjs` (from the repo root, left running — it is meant " +
			"to outlive any one terminal or task).");
		return;
	}
	const age_s = Math.round((Date.now() - new Date(hb.at).getTime()) / 1000);
	const alive = age_s < 30;   // three missed 10s heartbeats — generous, avoids a false "dead" from one slow tick
	div.c("health-row", () => {
		span.c(alive ? "health-clear" : "health-error", alive ? "● alive" : "● not reporting");
		span.c("muted", ` supervisor pid ${hb.supervisor_pid}, watcher pid ${hb.child_pid ?? "(none)"}, ` +
			`${hb.restarts} restart${hb.restarts === 1 ? "" : "s"} so far, last heartbeat ${age_s}s ago, ` +
			`checking ${hb.health_base}.`);
	});
	if (hb.last_exit){
		p.c("muted", `Last restart: the watcher exited (code ${hb.last_exit.code}, signal ` +
			`${hb.last_exit.signal ?? "none"}) after ${hb.last_exit.uptime_ms}ms, at ` +
			`${new Date(hb.last_exit.at).toLocaleTimeString()} — the supervisor brought it straight back.`);
	}
}

/* ── the proof: a scratch page under this same task dir, broken and fixed on purpose ── */

function load_proof($box){
	let draw = () => {};
	const log = new HealthLog({ url: today_url() });
	draw = () => $box.empty(() => board(log));
	log.live(draw).then(draw);
}

function board(log){
	div.c("health-head", "The proof: a scratch page, broken on purpose, caught, then fixed");
	p("[This disposable page](" + PROOF_URL + ") lives only under this task's own folder and is not " +
		"linked from anywhere else — the safe way to prove the watcher works without ever touching a " +
		"page the owner uses. It was edited to call a method that does not exist, then edited back.");

	if (!log.loaded){
		p("Today's health log hasn't loaded yet.");
		return;
	}

	const mine = [
		...log.errors.filter(e => e.url === PROOF_URL).map(e => ({ ...e, verb: "error" })),
		...log.oks.filter(e => e.url === PROOF_URL).map(e => ({ ...e, verb: "ok" })),
	].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));

	if (!mine.length){
		p("No log lines for the scratch page yet — the watcher checks within a couple of seconds of a save.");
	} else {
		mine.forEach(row => {
			div.c("health-row " + (row.verb === "error" ? "health-error" : "health-clear"), () => {
				span.c("muted", new Date(row.at).toLocaleTimeString() + " — ");
				span(row.verb === "error" ? `caught it: ${row.text}` : "clean again — the fix was seen.");
			});
		});
	}

	div.c("health-section", () => {
		p.c("muted", "What the broken page actually showed, screenshotted headless at the moment above:");
		img().attr("src", new URL("proof-broken.png", import.meta.url).pathname)
			.attr("alt", "The scratch page mid-break: 'Page Load Error — this.deliberately_missing_method is not a function'")
			.style({ maxWidth: "36em", border: "1px solid var(--fill-a08)", borderRadius: "0.3em" });
	});
}
