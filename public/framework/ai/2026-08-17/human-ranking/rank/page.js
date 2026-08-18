import { Page, View, div, p, h2, md, ui } from "/app.js";
import FileSaver from "/framework/ext/Saver/FileSaver.js";
import LocalStorageSaver from "/framework/ext/Saver/LocalStorageSaver.js";
import { build, comparisons } from "./rank.js";
import { duel, standings, src } from "./duel.js";
import { record } from "./record.js";
import { table, places } from "./compare.js";

View.stylesheet(import.meta, "rank.css");

const HERE = "/framework/ai/2026-08-17/human-ranking/";
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || location.hostname.endsWith(".localhost");
const clock = iso => iso ? new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "—";

export default new Page({
	meta: import.meta,
	title: "Rank the 18",
	description: "Two screenshots, pick the better one. Fifty-nine of those and the site has the reference standard its scoring tiers are missing.",

	// FileSaver lands the conclusion in the repo on every pick; off localhost it
	// warns once and resolves false, so the page says which one is live.
	initialize(){
		this.saver = LOCAL ? new FileSaver({ path: HERE + "ranking.json" }) : new LocalStorageSaver({ key: "human-ranking" });
		document.addEventListener("keydown", e => this.key(e));
	},

	content(){
		div.c("rank bleed", async $rank => {
			this.$rank = $rank;
			const [frozen, saved] = await Promise.all([
				fetch(HERE + "tiers.json").then(r => r.json()),
				this.saver.load().catch(() => null),
			]);

			this.tiers = frozen.tiers;
			this.rows = frozen.rows;
			this.shot = frozen.width + "px";
			this.state = { verdicts: [], revisions: [], ...saved };
			this.live = LOCAL && await this.probe();

			$rank.empty(() => this.draw());
		});
	},

	// One request decides for all eighteen: probing per image would paint a grid of
	// broken frames, which is the state this route's absence must never look like.
	probe(){ return fetch(src(this.rows[0])).then(r => r.ok).catch(() => false); },

	row(hash){ return this.rows.find(r => r.hash === hash); },

	// ⚠ Clears the keyboard's two hashes first: left over from a duel no longer on
	// screen, `←` would silently record a verdict about the wrong pair.
	draw(){
		this.keys = null;
		const state = build(this.rows.map(r => r.hash), this.state.verdicts, this.state.revisions);

		if (state.broke !== null) return this.broken(state);

		this.progress(state);
		if (!this.live) this.absent();
		else if (this.rejudge ?? state.duel) this.keys = duel(this, this.rejudge ?? state.duel);
		if (state.done && !this.rejudge) this.done();
		if (state.order.length) standings(this, state.order);
		if (state.order.length >= 6) this.payoff(state);
	},

	progress(state){
		div.c("rank-say flow", () => {
			md(`**${state.order.length} of ${this.rows.length} placed** — at most ${state.at_most} comparisons left of ${comparisons(this.rows.length)}. `
				+ "Every pick is written the moment you make it: closing the tab loses nothing, and there is nothing to submit.");
			p.c("muted", (LOCAL ? "Writing `" + HERE + "ranking.json`" : "Writing to this browser only — off localhost the repo file cannot be saved")
				+ ` · last write ${clock(this.state.updated_at)}`
				+ (this.state.verdicts.length ? " · press `u` to undo" : ""));
		});
	},

	/** A pick during the build extends the sort; a pick on a re-judged pair promotes. */
	pick(better, worse){
		(this.rejudge ? this.state.revisions : this.state.verdicts)
			.push({ better, worse, at: new Date().toISOString() });
		this.rejudge = null;
		this.commit();
	},

	undo(){
		const list = this.state.revisions.length ? this.state.revisions : this.state.verdicts;
		if (list.pop()) this.commit();
	},

	revise(hash, above){
		this.rejudge = hash && { contender: hash, incumbent: above, flip: false };
		this.$rank.empty(() => this.draw());
	},

	commit(){
		this.state.updated_at = new Date().toISOString();
		this.state.started_at ??= this.state.updated_at;
		this.saver.save(record(this.rows, this.state));
		this.$rank.empty(() => this.draw());
	},

	// An <img> that 404s individually still means the route is gone, so one error
	// takes the whole page to the honest state rather than leaving 17 good frames.
	route_gone(){
		if (!this.live) return;
		this.live = false;
		this.$rank.empty(() => this.draw());
	},

	done(){
		div.c("rank-say flow", () => md("**All eighteen placed** — the reference standard is at `" + HERE + "ranking.json`. "
			+ "Re-judge any neighbour below that looks wrong; every change rewrites the file and the correlations under it."));
	},

	payoff(state){
		div.c("rank-say flow", () => {
			h2("Do the machines agree with you?");
			md("Four candidate instruments and the reference's own blind second pass, each ranking these same images. ρ is against **your** order.");
		});

		div.c("flow", () => {
			table(this.tiers, this.rows, state.order);
			h2("Your order, and where each tier puts the same image");
			places(this.tiers, this.rows, state.order);
		});
	},

	/* Loopback-only, and added today — so the honest states are "not on localhost"
	   and "the server has not restarted yet", never a wall of broken frames.
	   ext/AITask's shots.js answers the same question the same way. */
	absent(){
		div.c("rank-say rank-absent flow", () => {
			h2("The screenshots are not being served yet");
			md(LOCAL
				? "The eighteen PNGs live outside the repo (RULE#12), and only `GET /screenshot?path=…` reaches them — a "
					+ "loopback-only dev route added **today**, which needs `node server.js` restarted to load. Nothing is "
					+ "broken and no pick is lost: restart it, reload, and the duel appears. *Another agent is on port 80, "
					+ "so the restart is deliberately not automatic.*"
				: "This page needs the dev server: the screenshots sit in a scratchpad outside the repo, served by a "
					+ "loopback-only route (LAW#2 — nothing static may depend on it). Open it on `localhost`.");
			if (this.state.verdicts.length) p.c("muted", `${this.state.verdicts.length} picks are already recorded — the order and the correlations below are real.`);
		});
	},

	broken(state){
		div.c("rank-say flow", () => md(`⚠ **\`ranking.json\` is inconsistent.** Verdict ${state.broke} names a pair that is not `
			+ "the comparison the sort had reached, so replaying past it would give a plausible but wrong order. Nothing "
			+ "has been changed. Drop that verdict — or the file — and start again."));
		ui.table(["verdicts replayed", "placed before it broke"], [[String(state.used), String(state.order.length)]]);
	},

	// ⚠ Bound on `document`, so it has to ask whether this page is the one showing.
	// Escape before `u`: mid-re-judge, `u` would undo a verdict he never questioned.
	key(e){
		if (!this.view?.hc("active-page") || e.metaKey || e.ctrlKey || e.altKey) return;
		if (e.key === "Escape" && this.rejudge) return this.revise(null, null);
		if (e.key === "u") return this.undo();
		if (!this.keys) return;
		if (e.key === "ArrowLeft") this.pick(this.keys[0], this.keys[1]);
		if (e.key === "ArrowRight") this.pick(this.keys[1], this.keys[0]);
	},
});
