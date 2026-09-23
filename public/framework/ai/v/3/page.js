import { Page, View, div, h1, h2, p, a, b, span, pre, small, button, input, textarea, details, summary, demo, md } from "/app.js";
import { icon, select, option } from "/framework/core/View/View.js";
import grip from "/framework/ext/grip/grip.js";
import { JSONL, TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import { edit } from "/framework/ext/Ask/edit.js";
import Socket from "/framework/dev/Socket/Socket.js";
import picker from "../versions.js";
import * as DEMOS from "./demos.js";
import { Timeline, BOARD, LOG_URL, VERDICTS_URL, clock, text_lines, author_of, author_label, author_kind, status_word } from "./timeline.js";
import composer from "./compose.js";
import { ask_controls } from "./ask.js";
import { agents_strip } from "./agents.js";
import { prompts_view, prompt_board_cards } from "./prompts.js";
import { usage_rail } from "/framework/ext/AITask/usage.js";
import { current } from "/framework/ext/AITask/card.js";

View.stylesheet(import.meta, "v3.css");

// ⚠ `VERDICTS_URL` (imported above, from `timeline.js` — never a path named
// here) is the FULL url `import.meta.resolve()` returns, correct for reading
// (`Verdicts`'s own `url:`, below) but NOT safe to hand to `rpc:append`
// directly — found live while proving this page:
// `Server/plugins/SocketServer/Append.js`'s own `resolve()` was never given
// the fix `Tail.js`'s got the same day (that file's own long comment explains
// it) — it only strips a LEADING SLASH, so a full `http://localhost/…` url
// sails through untouched and `fs.appendFileSync` throws on the bogus path,
// answered as a flat "append failed" with no hint why. `VERDICTS_PATH` is the
// bare pathname carved out of the ONE imported constant — still nothing here
// names the file's location a second time, it only works around a real
// Server/ bug logged as a finding in this task's own log (Server/ is outside
// every minion's fence tonight, so the actual fix waits for someone with a
// fenced restart window).
const VERDICTS_PATH = new URL(new URLSearchParams(location.search).get("verdicts") || VERDICTS_URL, location.origin).pathname;

/**
 * INBOX ZERO (2026-09-19, `ai/2026-09-19/inbox-zero/`) — the owner's own words:
 * "so that as I click through things, I can study things one at a time and try
 * and get to zero inbox." Every card the mastermind or a minion posts can now
 * get a VERDICT — Approve, or Improve with a sentence saying what is wrong —
 * the same Approve/Improve mechanism the day-audit page already proved
 * (`ai/2026-09-19/day-audit/page.js`), copied here rather than shared, for the
 * same reason that page copied its own six lines from `ext/Ask/reply.js`: a
 * page that has to keep working while the site is being edited carries its
 * own small write path instead of importing a chain that might blank it.
 *
 * ONE MORE FILE, append-only, right beside this one: `verdicts.jsonl`. A line
 * never changes a board card — it only points at one by `id` and says what
 * was decided:
 *
 *   {"verdict": {"id": "<the board card's id>", "say": "approve" | "improve" | "reopen",
 *                "note": "<required for improve>", "at": "…", "by": "owner"}}
 *
 * `id` is the SAME id the board itself already uses. Merged in place here —
 * the newest line for one id replaces the last one shown, never the file
 * itself — so a press is undoable by pressing again: Approve, then later
 * Undo, is just a second line reading `say: "reopen"`. Nothing is ever
 * deleted; every line this page ever wrote is still in `verdicts.jsonl`, only
 * the newest one is what the page currently shows for that card.
 */
class Verdicts extends JSONL {
	static verbs = [...JSONL.verbs, "verdict"];
	verdicts = [];
	verdict(value) {
		const i = value.id != null ? this.verdicts.findIndex(v => v.id === value.id) : -1;
		if (i === -1) this.verdicts.push(value); else this.verdicts[i] = value;
	}
	reset() { this.verdicts = []; return super.reset(); }
}

/** The newest verdict on one card, or `undefined` if nobody has judged it yet. */
const verdict_of = (id, verdicts) => verdicts.verdicts.find(v => v.id === id);
const is_approved = (id, verdicts) => verdict_of(id, verdicts)?.say === "approve";

/**
 * ELIGIBLE FOR A VERDICT — found live, 2026-09-19: the first cut of this
 * feature counted every non-owner top-level card, which opened at 117 (185
 * cards on the real board, most of them not a thing a verdict means anything
 * on). A verdict is a judgment on FINISHED WORK — you cannot approve the
 * owner's own sentence echoed back, and you cannot approve "in flight: six
 * minions". So a card only enters the count and the undecided queue when:
 *   - it is not the owner's own card (unchanged — a verdict judges what the
 *     mastermind reported, never what the owner said);
 *   - it is not a child preview (`parent` set) — a child is judged on its
 *     OWN parent's page as part of that story, never loose in the queue;
 *   - `status === "done"` — the one field that actually means "this is a
 *     finished thing to judge," not "still running" (`working`) or "an
 *     operational question, not a quality one" (`needs-you` — see the
 *     decision log for why that status was excluded too, not just folded
 *     into "done").
 * A card that fails this is NEVER hidden — `wall()`/`by_recency()` still
 * show every card the board has always shown. It only stops counting toward
 * "N left" and stops being a stop the undecided-queue (Approve/Improve,
 * keyboard next) makes — `queue()` inside `master_detail()` is the one place
 * that reads this for stepping; `detail()` reads it to decide whether to
 * draw the verdict controls at all.
 */
const eligible = c => !c.parent && author_of(c) !== "owner" && c.status === "done";

/**
 * WHETHER THE OWNER CAN SPEAK ON A CARD AT ALL — deliberately NOT `eligible()`
 * (the owner, 2026-09-21: "I still don't seem to have a feedback mechanism for
 * these cards … I want you to prompt me yes or no, approve, improve, whatever,
 * give feedback per item and I'm not seeing that yet").
 *
 * `eligible()` above answers a DIFFERENT question — what counts toward "N left"
 * and what the undecided queue steps through — and `status === "done"` is right
 * for that: an unfinished card is not a debt. The bug was using one predicate
 * for both, so every `working` card (which is most of what the owner is looking
 * at while work is in flight) showed "Still in progress — nothing finished yet
 * to judge" where the controls belong. Feedback on work IN FLIGHT is the most
 * useful kind there is; withholding it until `done` is exactly backwards.
 *
 * So: the count stays honest, and the owner can always say something. The only
 * card that still takes no verdict is the owner's own — a verdict judges what
 * the mastermind said, not what the owner asked for.
 */
const can_judge = c => !c.parent && author_of(c) !== "owner";

/** An ISO stamp carrying THIS machine's own offset — copied from day-audit's
    page.js, the same reason it gives: `toISOString()` would move it to UTC. */
function stamp() {
	const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
		+ "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
		+ (off < 0 ? "-" : "+") + pad(off / 60) + ":" + pad(off % 60);
}

/** Today's own day-dir name (`2026-09-21`), THIS machine's local date — never
    hardcoded, since a fixed date is wrong the very next day. `ways_out()`,
    below, is the one place that reads this. */
function today_str() {
	const d = new Date(), pad = n => String(n).padStart(2, "0");
	return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

/** One whole line into a .jsonl under public/, through the dev socket's own
    `rpc:append` (`Server/plugins/SocketServer/Append.js`) — true when the
    server actually took it. */
async function append_line(url, line) {
	const answer = await Promise.race([
		Socket.singleton().async_rpc("append", url, [JSON.stringify(line)]),
		new Promise(done => setTimeout(done, 4000, null)),
	]);
	return answer?.response === "append successful";
}

/**
 * ONE line onto `verdicts.jsonl` — shared by `verdict_controls()`'s own
 * Approve/Improve/undo buttons AND the toast's own Undo (approve-loop,
 * 2026-09-20), so there is exactly one place that builds a verdict line and
 * exactly one place that reads `window.$VERDICT_AUTHOR` — the same append-
 * only, never-edit-the-card contract either caller writes through stays true
 * no matter which button the owner (or a test) actually pressed.
 */
async function write_verdict(id, say, note) {
	const line = { verdict: { id, say, at: stamp(), by: window.$VERDICT_AUTHOR || "owner" } };
	if (note) line.verdict.note = note;
	return append_line(VERDICTS_PATH, line);
}

/**
 * Improve must reach the mastermind the same way the owner's own spoken words
 * do — `.claude/skills/every-prompt/say.mjs`'s own `relay` verb appends a
 * `chat` line to the newest mastermind run that has not landed yet. That
 * script only runs on the command line (it touches the filesystem directly),
 * and this page's fence does not include it — `v3-data` owns it tonight — so
 * this does the SAME thing over the dev socket calls this page already has:
 * list `ai/` (`rpc:ls`), find the newest date, find its newest `mastermind-*`
 * run, read that run's own `task.jsonl`, and if its last `assign` line has no
 * `landed_at` yet, that is the open run — append the note there as a `chat`
 * line in the exact shape `say.mjs` itself writes.
 */
async function open_mastermind_run() {
	const listing = await Socket.singleton().ls("/framework/ai/");
	const days = (listing?.response ?? [])
		.filter(e => e.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
		.sort((a, b) => (a.name < b.name ? 1 : -1));   // newest date first

	for (const day of days) {
		const runs = (day.children ?? [])
			.filter(e => e.type === "dir" && e.name.startsWith("mastermind-"))
			.sort((a, b) => (a.name < b.name ? 1 : -1));   // newest run first — say.mjs's own tiebreak

		for (const run of runs) {
			if (!(run.children ?? []).some(f => f.type === "file" && f.name === "task.jsonl")) continue;
			// ⚠ Built from `day.name`/`run.name`, NEVER `run.full`/`run.path` — found
			// live while proving this page: `Server/plugins/Directory.js`'s own
			// `build_dir()` only strips the literal substring "public/" out of
			// `file.parentPath`, which `Runtime.ls()` always hands it as an
			// ABSOLUTE path (`path.resolve("./public/", dir)`) — so `entry.path`
			// for anything nested comes back as the repo's own absolute prefix
			// with just the word "public" cut out of the middle (measured:
			// "C:/Code/lew42/monorepo/framework/ai", not "framework/ai"), and a
			// url built from it 404s every time with no hint why. The plain
			// directory NAMES this loop already has are correct regardless —
			// this only ever needs those. Logged as a finding for
			// `Server/plugins/Directory.js` in this task's own log, since
			// Server/ is outside every minion's fence tonight.
			const url = `/framework/ai/${day.name}/${run.name}/task.jsonl`;
			const res = await fetch(url).catch(() => null);
			if (!res?.ok) continue;
			const lines = JSONL.parse(await res.text());
			const state = Object.assign({}, ...lines.filter(l => l.assign).map(l => l.assign));
			if (!state.landed_at) return url;
		}
	}
	return null;
}

/** True once the note reached the mastermind's inbox; false when no run is
    open right now. The verdict itself is saved either way — an Improve note
    is never lost, only its DELIVERY can wait for a run to be open again. */
async function relay_to_mastermind(msg) {
	const url = await open_mastermind_run();
	if (!url) return false;
	return append_line(url, { chat: { at: stamp(), from: "owner", via: "inbox-zero", msg } });
}

/**
 * AI dashboard, version 3 — a WALL OF IDEA CARDS, not a transcript. The dev
 * bar's own "the mastermind log" (`dev/DevBar/says.js`) is where the owner
 * reads every word, live, as it is said — this page is the other question:
 * "what is going on, at a glance, ranked by what actually matters right now."
 *
 * Both read the SAME file — `ai/board.jsonl`, outside every version dir, as
 * `timeline.js`'s own `LOG_URL` names it — through the SAME model
 * (`./timeline.js`), so the two views can never disagree about what a card
 * IS — only about how much of it to show.
 *
 * A card's FACE here is deliberately small: an icon ONLY when its own line
 * names one (never a guessed default), a short title (about five words —
 * the mastermind keeps them that way), the time it was last touched, and a
 * coloured LEFT EDGE for its status — no dot, no tinted ground (the owner:
 * pale colour on light grey clashed; white cards, edge only, read cleanly).
 * A card with children (`parent: "<this card's id>"` on the child's own
 * line) also shows its top three, by the same importance, under the title.
 * Click a card and its own url (`route(id)` below) opens the whole thing:
 * full text, links, a live demo if it names one, every earlier update in
 * time order, and every child as a card of its own — routing deeper the
 * same way. Back/forward and a reload all land on the same card.
 *
 * Ordered and sized by IMPORTANCE (`weight()`) — needs-you first, then
 * however much a topic is actually being talked about, then how recent it
 * is; said in one line above the wall, with a "newest first" toggle
 * (`Page.Store`) for whoever wants the plain chronological read instead.
 * The owner's own verbatim words never appear as a card of their own here
 * (that is prompt-log detail, the dev bar's job) — they only feed the weight.
 *
 * ⚠ First version, not the whole spec: `doc/decisions.md` names what is
 * still follow-up (the `core/Page` two-column `columns()` layout, so the
 * wall stays visible beside an open detail instead of the detail replacing
 * it full-page; the owner's own newest line morphing in place from a
 * "heard" card into its answer) — read there before building either.
 */
export default new Page({
	meta: import.meta,
	title: "AI v3",
	icon: "dashboard_customize",
	description: "What is going on, ranked by what matters — click a card for the whole thing.",

	/* ⚠ The same guard `/framework/ai/`'s own page has carried since
	   `board-from-events` (2026-09-22), and for the same measured reason:
	   `Router.activate()` runs the whole chain root-to-leaf, so a deep link to
	   `/v/3/grid/` or to one card activates THIS page too, cold, on the same
	   pass — and without the check this built a second, hidden copy of the
	   entire board (its fetches, its EventSource, its timers) underneath the
	   real one, and its own `history.replaceState` then overwrote the deeper
	   page's url with `/v/3/days/`. Measured 2026-09-22: every
	   `/v/3/<view>/` url landed on the days view with two view words marked
	   at once. */
	content() { defer_board(this); },
	activated() { defer_board(this); },

	/* Two routes under this board, and `board_route()` below owns the first:
	   a VIEW (`/v/3/grid/`) and, under a view, a CARD.

	   One card's own url — `/framework/ai/v/3/<id>/`, the shape every link
	   written before 2026-09-22 still uses. Always opens the SAME two-column
	   rail+detail `content()` builds for the bare `/v/3/` url — arriving on a
	   card's own url is a cold load with no prior rail to keep, so a fresh
	   build (this one, its own `Page`, its own `content()` call) costs nothing
	   a reader would notice; it is intra-page clicks, inside `master_detail()`
	   below, that must NOT go through this at all (see its own note on
	   `history.pushState`). */
	route(id) {
		const view = board_route(this, id);
		if (view) return view;
		if (id.includes(".")) return;   // a real file (favicon.ico &c), not a card
		const root_page = this, base = this.url;
		return new Page({
			title: id, icon: "arrow_back", url: base + id + "/",
			content() {
				this.board_build = () => top_level(this, id, null, base);
				defer_board(this);
			},
			activated() { defer_board(this); },
		});
	},
});

/**
 * EVERY VIEW IS A URL (board-declutter, 2026-09-22) — the owner's own words:
 * "the timeline, prompts, grid, now, and days, don't even have a route... a
 * live reload would navigate me away from this page", and then "that's
 * literally what routes are for."
 *
 * So these five words are five real addresses under whichever board root you
 * are on — `/framework/ai/days/` and `/framework/ai/v/3/days/` are both real,
 * because BOTH pages call this from their own `route()`. A view word on screen
 * is a plain `<a href>`, so clicking one is an ordinary navigation: the back
 * button works, a paste of the url opens that view, and a live reload puts you
 * back exactly where you were.
 *
 * The order of truth is THE URL FIRST, always. The saved preference
 * (`prefs.get({view})`) is consulted only when the url names no view at all,
 * and even then `top_level()` immediately rewrites the url so it does — see
 * its own note on `history.replaceState`.
 *
 * Under a view sits a CARD (`/framework/ai/timeline/<id>/`): the same card
 * detail the bare `/v/3/<id>/` route above opens, addressed from inside the
 * view it was opened in, so a reload keeps both the view AND the open card.
 */
export const VIEW_WORDS = ["days", "now", "grid", "timeline", "prompts"];

/**
 * THE ONE FLAG THAT HIDES A VIEW (board-declutter, 2026-09-22 — the owner: "I
 * don't like the grid. It doesn't make any sense. It's just this huge thing.
 * Maybe we just hide the grid for now").
 *
 * A name in here loses its word on the chrome line, and its url stops being a
 * view: `/framework/ai/grid/` still RESOLVES — an old link, a bookmark, a
 * screenshot url — but it lands on the default view and rewrites itself there,
 * the same one-truth rule the bare board url already follows. Nothing is
 * deleted: `wall()` and every rule under `.v3-cards` are untouched, and taking
 * "grid" out of this array brings the whole view back with its url intact.
 */
export const HIDDEN_VIEWS = ["grid"];
export const DEFAULT_VIEW = "days";
const shown_views = () => VIEW_WORDS.filter(v => !HIDDEN_VIEWS.includes(v));

/**
 * THE BOARD ROOT DRAWS ITSELF EXACTLY ONCE, AND ONLY WHEN IT IS WHAT SHOWS.
 *
 * `Router.activate()` runs the whole chain root-to-leaf, so a deep link to
 * `/framework/ai/grid/` activates the root page too, cold, on the same pass.
 * Without the url check below, the root built a SECOND, hidden copy of the
 * entire board underneath the real one — every fetch, an EventSource, the
 * timers — and its own `history.replaceState` then overwrote the deeper page's
 * url with the default view's (measured 2026-09-22: all five `/v/3/<view>/`
 * urls landed on `days` with two view words marked at once).
 *
 * The other half is the one `board_route()` calls on the way back: going UP
 * the chain activates nothing (`Page.deactivate()`'s own note), so a root that
 * was built cold and empty would stay empty forever once the reader clicked
 * back to it from a view. The view page tells the root to draw on its way out.
 */
/**
 * ⚠ ONE TICK LATER, ALWAYS — and this is the whole reason a view word went
 * blank when the owner clicked it (board-declutter, 2026-09-22).
 *
 * `Router.go()` LOADS FIRST AND PUSHES THE URL SECOND (`core/Router/Router.js`:
 * "Load first, push second, so a failed navigation leaves no history entry").
 * So while a page's own `content()` runs on a real in-app click,
 * `location.pathname` is still the url you are LEAVING — `draw_board()`'s check
 * sees a mismatch, skips, and the reader gets a page with nothing on it but its
 * own title. Every cold load passed, because there the url is already right,
 * which is exactly why this shipped.
 *
 * `setTimeout(…, 0)` and not `requestAnimationFrame`: `go()` resumes and calls
 * `pushState` in a MICROTASK after `activate()` returns, so a macrotask is the
 * first moment the url is certainly final — and unlike a frame callback, a
 * macrotask still runs in a hidden tab.
 */
export function defer_board(page) { setTimeout(() => draw_board(page), 0); }

export function draw_board(page) {
	if (page.board_drawn) return;
	if (location.pathname !== page.url) return watch_board(page);
	page.board_drawn = true;
	page.board_watch?.disconnect();
	const build = page.board_build ?? (() => top_level(page, null));
	// Inside `content()` the captor is already this page's own view; from
	// `deactivated()` or the observer there is no captor at all, so go through
	// `append()`.
	if (page.view) page.view.append(build);
	else build();
}

/**
 * ⚠ THE LAST WAY A BOARD GOES BLANK, and the only one a handoff cannot reach.
 *
 * `render()` caches `this.view`, so a page whose `content()` ran while a DEEPER
 * url was showing keeps that empty view for the rest of the session. Walking
 * back UP to it activates nothing (`Router.activate()` only touches what
 * changed), so it is never asked to draw again — and the reader clicks `AI` in
 * the rail and gets a page holding one word. Every page this file builds hands
 * back to its parent from `deactivated()`, but a DECLARED child does not:
 * `/framework/ai/2026-09-22/` has its own `page.js`, outside this board's reach,
 * and it went blank exactly this way (reproduced headless, 2026-09-22).
 *
 * So the page watches its own element instead of trusting anyone to tell it.
 * The arrangement contract stamps `.active-page` on whichever page is being
 * shown, so that one class change IS the signal, whatever navigated. One
 * observer, attributes only, disconnected the moment the board draws.
 */
function watch_board(page) {
	if (page.board_watch || !page.view) return;
	// ⚠ `defer_board`, not `draw_board`: the class is stamped inside
	// `Router.activate()`, and a MutationObserver callback is a MICROtask, so it
	// runs before `go()` resumes and pushes the url — the same one tick early
	// that started all of this. Measured: the observer fired three times on the
	// right element with the right class and `draw_board()` still read the old
	// pathname every time.
	page.board_watch = new MutationObserver(() => defer_board(page));
	page.board_watch.observe(page.view.el, { attributes: true, attributeFilter: ["class"] });
}

export function board_route(root, name) {
	if (!VIEW_WORDS.includes(name)) return;
	const base = root.url;
	// A HIDDEN view's url still resolves, and lands on the default one. Passing
	// `null` as the view is what does it: `top_level()` then resolves the view
	// itself, refuses any hidden one, and rewrites the url to what it settled
	// on — the same one-truth rewrite the bare board url already gets.
	const named = HIDDEN_VIEWS.includes(name) ? null : name;
	const view_page = new Page({
		title: named ?? DEFAULT_VIEW, icon: "dashboard_customize", url: base + name + "/",
		content() {
			this.board_build = () => top_level(this, null, named, base);
			defer_board(this);
		},
		// Coming back to this view from a card under it.
		activated() { defer_board(this); },
		route(id) {
			if (id.includes(".")) return;
			return new Page({
				title: id, icon: "arrow_back", url: this.url + id + "/",
				content() {
					this.board_build = () => top_level(this, id, named, base);
					defer_board(this);
				},
				activated() { defer_board(this); },
			});
		},
	});
	return view_page;
}

/* Shared by the bare `/v/3/` Page and every `route(id)` Page — same toolbar,
   same view, same data; only which card starts selected differs. Kept as one
   function so the two can never draw two different heads. */
export function top_level(page, initial_id, url_view, root) {
	/* `root` is the board's own address — `/framework/ai/` or
	   `/framework/ai/v/3/` — and every url this board ever writes is built
	   from it, never from a hardcoded path, so the same code serves both
	   boards. `url_view` is the view the URL already named (null on the bare
	   root); `initial_id` is the card the URL already named. */
	root = root || page.url;
	const view_url = v => root + v + "/";
	const card_url = id => root + "timeline/" + id + "/";

	// ⚠ `?log=`/`?verdicts=` — the SAME device this function's own `?view=`
	// already uses (below): a query param nothing but a screenshot/test url
	// ever sets, so a real visit still reads the real files (`LOG_URL`/
	// `VERDICTS_URL`, unchanged). A proof run points both at a SCRATCH
	// board/verdicts pair living in this task's own dir instead — never
	// `board.jsonl`/`verdicts.jsonl` — chosen over a `window.$…` global (the
	// `$VERDICT_AUTHOR`/`$BLOCKRELOAD` shape) because a query param survives
	// `mcp__site__shot`'s own plain url, no init-script hook needed
	// (`v3-timeline`, 2026-09-19 — proving the timeline needed real-looking
	// gap structure a live board can't be trusted to hold still for).
	const qs = new URLSearchParams(location.search);
	const log = new Weighted({ url: qs.get("log") || LOG_URL });
	const verdicts = new Verdicts({ url: qs.get("verdicts") || VERDICTS_URL });
	const sort = new Page.Store({ id: "v3-sort" });
	const prefs = new Page.Store({ id: "v3-view" });
	let $board, $wall, $count, $footer, $live_btn, $head, $more_btn, $agents_host;
	const view_btns = new Map();   // val -> the view word's own link, built once by views_row() — paint_view_tabs() reads it on every redraw
	let show_approved = prefs.get({ show_approved: false }).show_approved ?? false;
	// LIVE — live-select, 2026-09-21: this is now the ONE switch for
	// selection, not an auto-follow mode with its own separate per-visit
	// state (the owner: "it's almost like selection and deselection... Live
	// on = nothing is selected"). On, `master_detail()`'s own `update()`
	// always keeps the newest card showing; selecting any card (a click, a
	// card's own url) turns it off and locks the view there; turning it back
	// on is the deselect gesture — clears the selection, scrolls to top,
	// shows the newest again (`set_live()`/`master_detail()`'s own
	// `deselect()`, below). Persisted the same way every other view
	// preference here is.
	let live = prefs.get({ live: true }).live ?? true;

	// `set_live()` is the ONE place that ever changes `live` (every click
	// handler and popstate branch below calls this, never touches the
	// variable directly), so the button's own on/off look and the saved
	// preference can never drift apart. `paint_live_btn()` flips both the
	// plain `on` marker class and the framework's own `.prim` utility
	// (climb the ladder — `css` skill: "nothing → a utility class" — before
	// writing a bespoke filled-button rule, `framework.css` already has one:
	// `button.prim` is a solid fill with white text, the exact "primary
	// background" the owner asked for).
	function paint_live_btn() {
		if (!$live_btn) return;
		$live_btn.el.classList.toggle("on", live);
		$live_btn.el.classList.toggle("prim", live);
	}
	// live-select, 2026-09-21 — Live is selection now, not a mode: turning it
	// BACK on is the deselect gesture (the owner: "it's almost like the live
	// mode is deselecting"), so this is the one place that tells the open
	// `master_detail()` instance (`md`, below) to clear its selection and
	// scroll back to top — `md` is null on `now`/`grid`, where there is no
	// selection to clear, so the optional-chain is a plain no-op there.
	function set_live(v) {
		if (live === v) return;
		live = v;
		prefs.patch({ live });
		paint_live_btn();
		if (v) md?.deselect();
	}
	// AUTHOR FILTER (item 7) — scoped to the TIMELINE view's own axis only
	// (`master_detail()`'s `by_recency()` reads this) — see this task's own
	// log for why `now`/`grid` were left alone: `now` is about one
	// conversation thread and `grid` already excludes the owner and ranks by
	// importance, neither of which "who wrote it" cleanly slots into without
	// a larger change than one filter control justifies tonight.
	let author_filter = prefs.get({ author_filter: "all" }).author_filter ?? "all";

	// HEAD-MOBILE (2026-09-21, `ai/2026-09-21/head-mobile/`) — 255px of head row
	// at 400px wide, before a single card. Nothing here is DELETED — the four
	// "ways out" links and the card-width slider are DESK FURNITURE: four text
	// links are the least useful the moment they're not the thing you're
	// looking for, and the slider changes a grid that is one column wide on any
	// phone anyway. Below the narrow-head breakpoint (`v3.css`, 40em, the same
	// width this page already treats as "phone" for the split view) both groups
	// fold behind one "More" toggle instead of vanishing — `set_more()` is the
	// only place that flips `more_open`, so the button's own look and the class
	// on `$head` that CSS keys off of can never drift apart, the same contract
	// `set_live()` keeps just above. The two disabled tabs (gallery, dashboard)
	// need no toggle at all: v3.css hides `.v3-view-btn:disabled` outright below
	// the same width, because a disabled button has nothing to be "reachable"
	// TO — it already does nothing at any width.
	let more_open = false;
	function set_more(v) {
		more_open = v;
		if ($head) $head.el.classList.toggle("v3-more-open", more_open);
		if ($more_btn) {
			$more_btn.el.setAttribute("aria-expanded", String(more_open));
			$more_btn.el.textContent = more_open ? "Less ▴" : "More ▾";
		}
	}

	/* THE URL DECIDES THE VIEW, ALWAYS (the owner, 2026-09-22: "that's
	   literally what routes are for"). Three sources, in this fixed order:
	     1. the PATH — `/framework/ai/grid/` — which is `url_view`;
	     2. the old `?view=grid` param, still accepted so every link and
	        screenshot url written before today keeps working;
	     3. the saved preference, and only when the url named nothing.
	   Anything that is not one of the five words falls back to `days`. */
	const view_param = qs.get("view");
	let view = url_view
		|| (VIEW_WORDS.includes(view_param) ? view_param : null)
		|| (prefs.get({ view: DEFAULT_VIEW }).view ?? DEFAULT_VIEW);
	// A hidden view falls back like a misspelt one — which is what turns
	// `/framework/ai/grid/`, `?view=grid` and an old saved preference reading
	// "grid" into the default view instead of a word that is no longer there.
	if (!VIEW_WORDS.includes(view) || HIDDEN_VIEWS.includes(view)) view = DEFAULT_VIEW;

	// A CARD'S OWN URL ALWAYS SHOWS THAT CARD (approve-loop, 2026-09-20) — found
	// live: landing on `/v/3/<id>/` while the SAVED view preference read "grid"
	// or "now" silently redrew the same wall/now-view instead of that card's
	// detail — the url changed, but nothing on screen did, because only the
	// "timeline" view's own `master_detail()` knows how to open one card at
	// all (`wall()`/`now_view()` both ignore `initial_id` completely). Proven:
	// `/v/3/?view=grid`, click a real card tile, land on its own url, and the
	// grid wall is still what's on screen. The owner reads a card's own detail
	// to form an opinion (the brief's own words), so a link to ONE card must
	// always open it — this is very likely the real reason Approve/Improve
	// never looked predictable: most clicks from the owner's normal browsing
	// view landed nowhere. `prefs` itself is untouched, so leaving this card
	// still returns to whatever view the owner had chosen before.
	if (initial_id) view = "timeline";

	/* ONE TRUTH, and it is the url. If we got here on an address that does NOT
	   name the view — the bare `/framework/ai/`, or an old `?view=grid` link —
	   rewrite it right now so it does. `replaceState`, never `pushState`: this
	   is the same visit, not a new one, so the back button still goes wherever
	   the reader came from. A REDIRECT was the alternative and is wrong:
	   `/framework/ai/` is the AI section's own root, the rail's nav target and
	   the version picker's V1 entry, so it has to keep existing.
	   ⚠ Every other query param is carried over untouched — `?log=`,
	     `?verdicts=` and `?servex=` are how a proof run points this board at
	     scratch files, and dropping them would break every such run. */
	if (!url_view) {
		const keep = new URLSearchParams(location.search);
		keep.delete("view");
		const q = keep.toString();
		history.replaceState(null, "", (initial_id ? card_url(initial_id) : view_url(view)) + (q ? "?" + q : ""));
	}

	const VIEW_TITLES = {
		days: "what happened, newest day first", now: "the newest thing, live",
		grid: "the importance wall", timeline: "rail + detail, newest first",
		prompts: "what you said, and what was made of it",
	};

	// ⚠ The `timeline` and `now` views' own instances survive across a LIVE
	// data update (a new `card`/`chunk` line) — only `update()` is called
	// then, never a rebuild, because a rebuild is exactly the
	// inbox/reading-position-loses-its-place bug the owner's own brief opens
	// with. Switching views (or first arriving at one) is the only time
	// either is (re)built from nothing.
	let md = null, nv = null, dv = null, pv = null;
	const redraw = () => {
		paint_count();
		paint_view_tabs();
		// USAGE FOOTER (item 5, 2026-09-19) — "across both columns", the
		// owner's own words for the timeline's own two-column layout, so it
		// is shown ONLY there; built once, below, and just hidden/shown per
		// view from here (`[hidden]` — the base reset — removes it from
		// `.v3-board`'s own grid row sizing when off, so the other views'
		// natural page-scroll height is never affected by its presence).
		if ($footer) $footer.el.hidden = view !== "timeline";
		// DAYS (2026-09-22) — its own rows come from day.jsonl/task.jsonl, not
		// `log` (board.jsonl), so a board `card`/`chunk` line arriving while
		// this view is open must NOT rebuild it — that would blow away every
		// open `<details>` fold and re-fetch every day.jsonl for nothing.
		// `dv.update()` is a deliberate no-op; only a real view SWITCH (out of
		// and back into "days") reads the days list fresh.
		if (view === "days") {
			md = null; nv = null; pv = null;
			if (dv) return dv.update();
			return $wall.empty(() => { dv = days_view(page); });
		}
		if (view === "now") {
			md = null; dv = null; pv = null;
			if (nv) return nv.update();
			return $wall.empty(() => { nv = now_view($wall, log, page, view_url("timeline")); });
		}
		// PROMPTS (prompt-lifecycle, 2026-09-22) — its rows come from Servex's
		// own prompt log, not `board.jsonl`, so a board line arriving while it
		// is open must not rebuild it (the same rule `days` follows above); it
		// keeps itself live off `/api/stream` and `update()` is a no-op.
		if (view === "prompts") {
			md = null; nv = null; dv = null;
			if (pv) return pv.update();
			return $wall.empty(() => { pv = prompts_view(); });
		}
		if (view !== "timeline") {
			md = null; nv = null; dv = null; pv = null;
			return $wall.empty(() => wall($wall, log, page, sort, verdicts, () => show_approved));
		}
		nv = null; dv = null; pv = null;
		if (md) return md.update();
		$wall.empty(() => { md = master_detail($wall, log, page, prefs, initial_id, verdicts, () => show_approved, () => live, () => author_filter, set_live, card_url, view_url("timeline")); });
	};

	// TAB HIGHLIGHT FOLLOWS `view` (2026-09-21). Since 2026-09-22 a view word
	// is a real link and a click rebuilds the whole head at the new url, so
	// the marked word is right from the first paint — this stays because
	// `view` can still change without a rebuild (a future in-page switch), and
	// a highlight that silently disagrees with what is on screen is exactly
	// the bug this was written to fix.
	function paint_view_tabs() {
		view_btns.forEach(($btn, val) => $btn.el.classList.toggle("on", val === view));
	}

	/**
	 * THE COUNT IS THE POINT (the owner's own brief) — how many cards still
	 * need a verdict, always visible beside the view switch. The toggle
	 * beside it is the "fall off... or get filtered out" half made real: an
	 * approved card leaves the list above, and this one plain control is
	 * how it comes back — nothing approved is ever actually gone.
	 */
	function paint_count() {
		if (!$count) return;
		const reviewable = log.cards.filter(eligible);
		const approved = reviewable.filter(c => is_approved(c.id, verdicts));
		const left = reviewable.length - approved.length;
		$count.empty(() => {
			span.c("v3-count-left", `${left} left`);
			if (approved.length) button.c("v3-count-toggle").attr("type", "button")
				.text(show_approved ? "hide approved" : `${approved.length} approved`)
				.click(() => { show_approved = !show_approved; prefs.patch({ show_approved }); redraw(); });
		});
	}

	/* THE VIEW WORDS, and they are the only chrome left on the line
	   (board-declutter, 2026-09-22). Each one is a real `<a href>` now, not a
	   button — clicking it is an ordinary navigation to that view's own url,
	   so the back button works and a reload lands you back on the same view
	   (`board_route()` above). `gallery` and `dashboard` are GONE rather than
	   folded: they were permanently disabled buttons, so there was nothing to
	   keep reachable. */
	function views_row() {
		div.c("v3-views flex", () => {
			shown_views().forEach(val => {
				view_btns.set(val, a.c("v3-view-btn" + (val === view ? " on" : "")).text(val)
					.href(view_url(val)).attr("title", VIEW_TITLES[val]));
			});
			/* TALK (2026-09-22, `ai/2026-09-22/talk/`) — the sixth word on this
			   line, and the only one that is not a view of this board: it is a
			   PAGE of its own at `/framework/ai/talk/`, where pressing the mic
			   fills one card with your words as you say them. So it is NOT in
			   `VIEW_WORDS` (that list is what `board_route()` claims as a view,
			   and claiming `talk` there would shadow the real page), and its
			   href is the absolute address rather than `view_url()` — this same
			   head is drawn under `/framework/ai/v/3/` too, where a relative
			   view url would point at a page that does not exist. */
			a.c("v3-view-btn v3-view-talk").text("🎤 talk").href("/framework/ai/talk/")
				.attr("title", "Press the mic and talk — your words fill one card, live, and nothing on it jumps");
		});
	}

	/**
	 * MORE — everything that is not a view word (board-declutter, 2026-09-22).
	 * The owner's own list of what was too much: "Todays' board? Everything?
	 * Process? Start here? V3? 103 left? … LIVE, everyone, card width". None of
	 * it is deleted — all of it lives here, one click away, opening in place
	 * under the one chrome line. Four destinations, the version picker, and
	 * the three controls that used to sit permanently on screen.
	 *
	 * Today's link is computed, never hardcoded, and starts pointing at the
	 * log (always real) — it only swaps to `/framework/ai/<today>/` once
	 * `Socket.ls()` confirms that dir actually exists, so a visit before the
	 * day's first task never lands on a 404.
	 */
	function more_panel() {
		let $today;
		div.c("v3-more", () => {
			div.c("v3-ways-out", () => {
				$today = a.c("v3-ways-out-link").href("/framework/ai/log/").text("Today's board");
				span.c("v3-ways-out-sep muted", "·");
				a.c("v3-ways-out-link").href("/framework/ai/log/").text("Everything");
				span.c("v3-ways-out-sep muted", "·");
				a.c("v3-ways-out-link").href("/framework/ai/process/").text("Process");
				span.c("v3-ways-out-sep muted", "·");
				a.c("v3-ways-out-link").href("/framework/ai/2026-09-20/start-here/").text("Start here");
			});

			picker(root);

			// THE COUNT — still the point, still one press away (`paint_count()`).
			$count = div.c("v3-count flex v-center");

			// LIVE — see the `let live` declaration above for what it gates,
			// and `set_live()`/`paint_live_btn()` for how its look and its
			// saved state stay in sync.
			$live_btn = button.c("v3-live-btn" + (live ? " on prim" : "")).text("Live")
				.attr("type", "button")
				.attr("title", "Show me the newest, nothing pinned open. On: the newest card is always what's shown, and stays that way as new ones arrive. Selecting any card turns this off and locks your view on it; click Live again to deselect and jump back to the newest.")
				.click(() => set_live(!live));

			// AUTHOR FILTER — see the `let author_filter` declaration above
			// for its scope (the timeline view's own axis).
			const AUTHOR_OPTS = [["all", "everyone"], ["owner", "you"], ["assistant", "assistant"], ["mastermind", "mastermind"], ["minion", "minions"]];
			const $author = select.c("v3-author-filter auto").attr("title", "Filter the timeline by who wrote the card")
				.append(() => AUTHOR_OPTS.forEach(([val, label]) => option().attr("value", val).text(label)));
			$author.el.value = author_filter;
			$author.on("change", function () { author_filter = this.el.value; prefs.patch({ author_filter }); redraw(); });

			div.c("v3-track", () => {
				span("card width");
				input().attr("type", "range").attr("min", "18").attr("max", "34").attr("step", "1")
					.attr("value", String(prefs.get({ track: 24 }).track ?? 24))
					.on("input", function () {
						const em = this.el.value;
						$board.style({ "--v3-track": em + "em" });
						prefs.patch({ track: Number(em) });
					});
			});
		});
		const today = today_str();
		Socket.singleton().ls("/framework/ai/").then(listing => {
			if ((listing?.response ?? []).some(e => e.type === "dir" && e.name === today)) $today.href(`/framework/ai/${today}/`);
		}).catch(() => {});
	}

	div.c("v3 bleed", () => {
		// FULL BLEED (2026-09-19, `ai/2026-09-19/v3-timeline/`) — the owner's own
		// words: "the V3 page fills everything right of the site sidebar: zero
		// page padding". `.v3-board` drops the `pad` utility class it used to
		// carry (the outer `--pad` ring around the WHOLE board, head and wall
		// alike) — dropping it in CSS instead would lose, because a utility
		// class lives in a LATER layer than this file's own `theme` layer and
		// always wins regardless of specificity (the exact trap `dashboard-
		// next`'s own CSS audit already found and named). `.v3-head` gets its
		// own small padding below so the title/toolbar still breathes; the two
		// SPLIT COLUMNS get the framework's own default `--pad` each, so the
		// board itself touches the sidebar/viewport edges while its readable
		// content still has room (`css` skill: "a page region takes `.pad`").
		$board = div.c("v3-board grid gap", () => {
			/* ONE QUIET LINE OF CHROME (board-declutter, 2026-09-22) — the
			   owner counted three rows above the first card and called all of
			   it "bullshit": the AI head, the view switch, and the agents
			   strip. This is the one line that replaces them: the title, the
			   five view words, whichever agents are actually working, and
			   `More` at the right end holding everything else. Nothing was
			   thrown away except the two permanently-disabled view words. */
			// ⚠ NO `flex wrap v-center` utility classes here (board-declutter,
			// 2026-09-22) — v3.css declares this row's own display instead, for
			// the same documented reason `.v3-ways-out` and `.v3-track` already
			// do: `framework.css`'s `.flex > * { margin: 0 }` lives in `@layer
			// util`, a LATER layer than this file's own `theme`, so it beats any
			// rule here at any specificity — and it silently killed the one
			// `margin-inline-start: auto` that puts `More` at the end of the
			// line (measured: the button sat at x=710 in a 1039px row).
			$head = div.c("v3-head", () => {
				// The title is the way home (the owner, 2026-09-21: "I want you
				// to make the AI title on the V3 page link back to framework AI").
				h1.c("v3-title", () => a.c("v3-title-link").href("/framework/ai/").text("AI"));
				views_row();
				// AGENTS STRIP (board-from-events, 2026-09-22, phase-2 item 5) —
				// every Servex-hosted agent that is actually WORKING, one chip
				// each, on the same line; the idle ones collapse into a single
				// count at the end of it (`agents.js`). Built once, like
				// `$footer` below — never rebuilt on a view switch or a redraw.
				$agents_host = div.c("v3-agents");
				$agents_host.el.hidden = true;   // agents_strip() shows it once Servex actually answers
				$more_btn = button.c("v3-more-btn").attr("type", "button")
					.attr("aria-expanded", "false")
					.attr("title", "More: the ways out of this board, the version picker, Live, the author filter, the card-width slider and the count of what is left to review — folded away only to save room, always here")
					.text("More ▾")
					.click(() => set_more(!more_open));
				// Its own line INSIDE the same flex row (`flex: 1 1 100%`,
				// v3.css), shown only while `more_open` — so the chrome is one
				// line until you ask for the rest, at every width.
				more_panel();
			});
			$wall = div.c("v3-wall");
			// USAGE FOOTER (item 5) — "the usage progress bars from the old
			// default timeline", the owner's own words: reused whole
			// (`ext/AITask/usage.js`'s own `usage_rail()`, the exact
			// component the old dashboard's own rail already showed), never
			// redrawn — this only fetches the same `usage.json` snapshot
			// every other reader of it fetches and hands it over. Built once
			// here (not per-view) since it needs no board/verdicts data at
			// all; `redraw()` above only toggles whether it is shown.
			$footer = div.c("v3-footer", async $f => {
				const usage = await fetch("/framework/ai/usage.json").then(r => r.ok ? r.json() : null).catch(() => null);
				$f.append(() => usage ? usage_rail(usage) : p.c("muted", "No usage.json yet."));
			});
			$footer.el.hidden = view !== "timeline";   // correct from the FIRST paint, before redraw() ever runs
		});
	});
	$board.style({ "--v3-track": (prefs.get({ track: 24 }).track ?? 24) + "em" });

	// A landed minion/task-mastermind's own last words become a board card the
	// same way any other `card` line would — merged straight into `log` (never
	// written to `board.jsonl`, this task's own fence and `decision` line) —
	// so every view that already reads `log.cards` shows it with no code of
	// its own for "an agent finished".
	agents_strip($agents_host, card => { log.card(card); redraw(); });

	// EVERY CARD THE FAST ASSISTANT MAKES OF YOUR WORDS lands on the normal
	// timeline and grid too (prompt-lifecycle, 2026-09-22) — merged straight
	// into `log`, never written to `board.jsonl`, exactly as a landed agent's
	// card is one line above. Two sources, one destination, and no view here
	// needs a single line of code for either.
	// ⚠ Subscribed only AFTER `log.live()` has finished its first read, because
	// `Timeline.reset()` empties `cards` on every load of `board.jsonl` — a
	// prompt card merged in before that read simply vanished, silently, and the
	// grid showed none of them (measured here, 2026-09-22). The agents strip
	// never hit this because its cards can only arrive much later, when an
	// agent actually lands.
	Promise.all([log.live(redraw), verdicts.live(redraw)]).then(() => {
		prompt_board_cards(card => { log.card(card); redraw(); });
		redraw();
	});
}

/**
 * DAYS (2026-09-22, `ai/2026-09-22/days-view/`) — the owner's own words: "our
 * new ai dashboard system still sucks... i never have a nice clean report of
 * what happened." Every other view here reads `board.jsonl` — activity, not
 * outcome. This one reads only the line a task writes when it actually LANDS:
 * newest day first, one row per finished task, the day's own `day.jsonl` for
 * the list (cheap — one small fetch per day) and that task's own `task.jsonl`
 * only once its row is opened (this task's own `decision` log explains why:
 * about 700 task dirs exist across the archive, so reading every one's
 * `task.jsonl` up front is not viable on a page load — the day log's own
 * "landed — <one line>" message, a real sentence a task chose for itself at
 * landing, stands in as the row's headline until then).
 */
const DAYS_PAGE = 7;

function days_view(page) {
	const $days = div.c("v3-days flow");
	load_days($days);
	return { update() {} };   // board.jsonl updates never touch this view — see redraw()'s own note
}

async function load_days($days) {
	const dates = await list_days();
	if (!dates.length) return $days.append(() => p.c("muted", "No days logged yet."));
	let shown = DAYS_PAGE;
	const draw = () => $days.empty(() => {
		dates.slice(0, shown).forEach(day_block);
		if (dates.length > shown) button.c("v3-count-toggle").attr("type", "button")
			.text(`Show ${Math.min(DAYS_PAGE, dates.length - shown)} more days`)
			.click(() => { shown += DAYS_PAGE; draw(); });
	});
	draw();
}

async function list_days() {
	const listing = await Socket.singleton().ls("/framework/ai/").catch(() => null);
	return (listing?.response ?? [])
		.filter(e => e.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
		.map(e => e.name).sort().reverse();   // newest first — an ISO date sorts correctly as a plain string
}

/* One day's own log — `{at, task, msg}` per line, never merged, never cached:
   this file is history the moment the day rolls over. */
async function day_log(date) {
	const res = await fetch(`/framework/ai/${date}/day.jsonl`).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return [];
	return JSONL.parse(await res.text()).filter(e => e.log).map(e => e.log);
}

function day_block(date) {
	div.c("v3-day", () => {
		h2.c("v3-day-head", date === today_str() ? `Today — ${date}` : date);
		const $rows = div.c("v3-day-rows flex v gap-25");
		load_day_rows($rows, date);
	});
}

async function load_day_rows($rows, date) {
	const lines = await day_log(date);
	const landed = lines.filter(l => /^landed\b/.test(l.msg ?? ""))
		.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
	const opened = new Set(lines.filter(l => /^task opened\b/.test(l.msg ?? "")).map(l => l.task));
	// UNLANDED TASKS OF TODAY ONLY — an older day's own opened-but-never-landed
	// task is a dead run, not "still working"; only today's own in-flight work
	// gets the quiet line the brief asks for.
	const working = date === today_str() ? [...opened].filter(t => !landed.some(l => l.task === t)) : [];
	$rows.append(() => {
		if (!landed.length && !working.length) return p.c("muted", "Nothing landed.");
		working.forEach(slug => day_working(date, slug));
		landed.forEach(l => day_row(date, l));
	});
}

/** One finished task, collapsed to the one-line headline it wrote for itself
    at landing (`day.jsonl`); opening it reads that task's own `task.jsonl`
    ONCE — the full `outcome` (rendered as markdown, so its own bold headline
    and inline links show too), the `links` list, and the task page. */
function day_row(date, l) {
	const slug = l.task, sentence = (l.msg ?? "").replace(/^landed[\s—-]+/, "");
	let loaded = false;
	details.c("v3-day-row", $r => {
		summary.c("v3-day-summary", () => {
			b(slug);
			if (sentence && sentence !== slug) span(" — " + sentence);
		});
		const $body = div.c("v3-day-body");
		$r.on("toggle", async () => {
			if (loaded || !$r.el.open) return;
			loaded = true;
			$body.append(() => p.c("muted", "Loading…"));
			const t = await new TaskJSONL({ url: `/framework/ai/${date}/${slug}/task.jsonl` }).load();
			$body.empty(() => {
				if (t.loaded && t.outcome) md(t.outcome);
				else p.c("muted", "No landing report on file.");
				if (t.links?.length) div.c("flex wrap gap-25", () =>
					t.links.forEach(link => a(link.label ?? link.url).href(link.url)));
				a("Task page →").href(`/framework/ai/${date}/${slug}/`);
			});
		});
	});
}

/** A task that opened today and has not landed yet — one quiet line, its own
    live status (`current()`, the same field a running task's card already
    reads) fetched once this row exists, never blocking the rest of the day. */
function day_working(date, slug) {
	const $w = div.c("v3-day-working muted").text(`working — ${slug}`);
	new TaskJSONL({ url: `/framework/ai/${date}/${slug}/task.jsonl` }).load().then(t => {
		if (t.loaded) $w.text(`working — ${current(t) ?? slug}`);
	});
}

/**
 * THE DEFAULT VIEW — an inbox on the left (large preview cards, newest
 * first), the selected one's full detail on the right, a drag handle
 * between them, 50/50 at load. The owner's own words: "a preview becomes
 * redundant once selected, so build the UI at a scale where the preview
 * card IS the top-level view and can be large; selecting it shows the
 * detail look" — so the left column reuses the SAME face `tile()` draws for
 * the grid view (icon, title, first sentence, author, time, a status edge),
 * just full-width instead of gridded, and the right column shows what a
 * preview does NOT — full text, links, demo/code, children, history — never
 * repeating the gist already on screen to its left.
 *
 * Selecting a card is NOT a page navigation. `select()` below only swaps the
 * right column's content and calls `history.pushState` itself — the inbox
 * is never rebuilt, so it never loses its scroll position, which is the
 * whole point ("the rail stays put"). `route(id)` (in the Page config
 * above) is the ordinary page-navigation path for a COLD load of a card's
 * own url — a fresh build there costs nothing, because there is no prior
 * inbox scroll state on a cold load to protect in the first place.
 *
 * Returns `{ update() }` — `top_level()`'s own `redraw` calls `update()` on
 * every LIVE data batch instead of rebuilding this from nothing, for the
 * same reason: a rebuild on every new `card`/`chunk` line would be the
 * scroll-losing bug all over again, just triggered by the board instead of
 * by the owner's own click.
 */
// An hour's own START, ms since epoch — two times share an hour line when
// this is equal for both. `hour_label` is that same hour read as a word
// ("4 PM") for the inline divider `paint_divider()` draws above the first
// card of a new hour (`.v3-axis-hour`, below) — including the newest card, so
// "what hour is this" is still always answered without a strip of its own.
const hour_start = t => { const d = new Date(t); d.setMinutes(0, 0, 0); return d.getTime(); };
const hour_label = t => new Date(t).toLocaleTimeString([], { hour: "numeric" });

function master_detail($wall, log, page, prefs, initial_id, verdicts, get_show_approved, get_live, get_author_filter, set_live, card_url, timeline_url) {
	/* Newest first, top-level only — AND an owner card that has its own
	   answer (a card carrying `re: <that owner card's id>`) merges into that
	   answer's row instead of standing beside it as a second item: `row_of()`
	   below never renders it, and `detail()` reads it back through
	   `heard_of()` as the "you said: …" block one click down from the
	   answer that replaced it. An owner card with no answer YET still gets
	   its own row — the transcription card the owner's brief asks for.
	   INBOX ZERO (`ai/2026-09-19/inbox-zero/`): an APPROVED card also drops
	   out of this list, unless the head row's "N approved" toggle is on —
	   the owner's own card is never hidden this way, since a verdict judges
	   what the mastermind said, not what the owner said.
	   ITEM 7's AUTHOR FILTER (2026-09-19) applies last, after the owner-merge
	   and approved-toggle rules above have already decided what a row even
	   IS — "everyone" (the default) is a no-op; any other choice narrows the
	   same list, never widens it back out. */
	const by_recency = () => {
		const all = log.cards.filter(c => !c.parent);
		const answered = new Set(all.filter(c => c.re).map(c => c.re));
		const kept = all.filter(c => !(author_of(c) === "owner" && answered.has(c.id)));
		const shown = get_show_approved() ? kept : kept.filter(c => author_of(c) === "owner" || !is_approved(c.id, verdicts));
		const filter = get_author_filter?.() ?? "all";
		return (filter === "all" ? shown : shown.filter(c => author_kind(author_of(c)) === filter))
			.sort((a, b) => Date.parse(b.updated_at ?? b.at ?? 0) - Date.parse(a.updated_at ?? a.at ?? 0));
	};

	let cards = by_recency();
	if (!cards.length) {
		const any = log.cards.some(c => !c.parent && author_of(c) !== "owner");
		$wall.append(() => p.c("muted", any ? "Nothing left to review — the count above brings approved cards back."
			: "Nothing yet — the board is empty."));
		return { update() {} };
	}

	// live-select, 2026-09-21 — LIVE IS THE ONLY SWITCH NOW (the owner: "Live
	// on = nothing is selected... selecting a card turns Live off... turning
	// Live back on is deselecting"). The old `following` flag used to track a
	// separate, per-visit "have I scrolled or clicked yet" state on top of the
	// `live` preference — that second layer is gone: `get_live()` alone now
	// decides whether the newest card keeps showing itself (`update()`,
	// below), and every place that used to call `stop_following()` now just
	// turns Live off directly, in one line, wherever a real SELECTION happens
	// (a click, arriving on a card's own url, Back/Forward landing on one). A
	// plain scroll no longer touches Live at all — see the `decision` line in
	// this task's log for why.
	let selected_id = cards.some(c => c.id === initial_id) ? initial_id : cards[0].id;
	if (initial_id && get_live()) set_live(false);

	let $split_v, $left, $right, $right_body, $back_top, $axis_list, $toast;
	let unseen_count = 0;   // Fix 3 — cards that arrived while a card was selected and the rail was scrolled away
	const rows = new Map();    // id -> $row (the card button) — selection/text-patch, unchanged from the plain inbox
	const axis = new Map();    // id -> { $wrap, $divider, $time } — the TIMELINE's own decoration around that same row
	let return_id = null;      // where Spacebar's jump-to-newest jumps BACK to — set the moment it jumps forward

	$split_v = div.c("v3-split", () => {
		// live-select, 2026-09-21 — the old sticky strip held the current-
		// hour/clock line and the pinned `needs-you` strip; both are gone (the
		// owner: "that box is sticky, I don't like it, it looks kind of
		// broken"). The hour is still readable — `.v3-axis-hour` (below) draws
		// an hour divider inline, right above the first card of a new hour,
		// including the newest one, so nothing about "what hour is this" was
		// actually lost. What replaces the strip is ONE small control, hidden
		// until there is something for it to do: `paint_back_top()` shows it
		// once the rail is scrolled (`$left`'s own scroll listener, below).
		$left = div.c("v3-inbox", () => {
			$back_top = button.c("v3-back-top").attr("type", "button").attr("title", "Back to top")
				.click(() => { $left.el.scrollTo({ top: 0, behavior: "smooth" }); unseen_count = 0; paint_back_top(); });
			$back_top.el.hidden = true;
			// THE VERDICT TOAST (approve-loop, 2026-09-20, the owner: "the
			// card leaves the list, which is easy to read as it vanished...
			// make the result visible and the undo obvious") — a sibling of
			// the sticky header, not inside a per-card render, so it
			// survives `advance()` moving the reader on to the next card the
			// instant a verdict lands; `show_toast()`/`hide_toast()`, below,
			// are the only two places that touch it. Hidden until the first
			// verdict this visit.
			// ⚠ NO `flex v-center gap` here — those are @layer util classes, and util
			// beats theme, so `display: flex` from the markup would out-rank
			// `.v3-toast[hidden] { display: none }` and draw an empty white card.
			// v3.css owns this element's display instead. Measured 2026-09-21.
			$toast = div.c("v3-toast card");
			$toast.el.hidden = true;
			$axis_list = div.c("v3-axis-list");
		});
		// ⚠ `.v3-mobile-back` is CSS-hidden except under the <40em media query
		// (v3.css) — below that width the split becomes two STACKED panes and
		// this is the only way back to the inbox, since selecting there is a
		// same-page swap, not a navigation a browser Back would undo.
		$right = div.c("v3-right-col", () => {
			button.c("v3-mobile-back").attr("type", "button")
				.append(() => { span("‹"); span("inbox"); })
				.click(() => $split_v.rc("v3-mobile-detail"));
			$right_body = div.c("v3-right-body");
		});
	});

	// live-select, 2026-09-21 — a plain scroll no longer touches Live (the
	// owner did not repeat that request this time, and under the new model
	// Live only ever means "nothing is selected" — scrolling the rail selects
	// nothing). It only shows/hides and repaints the back-to-top control;
	// `24` is the same "past the top" threshold `v3-axis-fix` chose, kept so
	// the button does not flicker on ordinary rubber-banding at rest.
	$left.el.addEventListener("scroll", () => paint_back_top(), { passive: true });

	// A click anywhere in the open card's own detail — Approve, Improve,
	// typing a note — is a real SELECTION of the card already open, so it
	// turns Live off the same way clicking a row does. Found live
	// (`ai/2026-09-19/inbox-zero/`): with Live still on, a card elsewhere on
	// the board getting touched by the mastermind mid-read yanked the panel
	// over to it, wiping out an Improve note the owner had half typed —
	// capture phase, so this fires before a button's own click handler ever
	// runs.
	$right.el.addEventListener("click", () => { if (get_live()) set_live(false); }, { capture: true });

	// Selected: `.card.selected` (framework.css) or `.v3-tile-compact.selected`
	// (v3.css, for the small rows Fix 1b adds below) — an inset ink ring on a
	// big tile, a tinted background on a compact row.
	function mark_row(id, $row) { $row.el.classList.toggle("selected", id === selected_id); }

	// Fix 3 — the back-to-top control (built once, above) shown once the rail
	// is scrolled past the same threshold that used to end "follow the
	// newest", and carrying a small count of cards that arrived while it was
	// hidden AND a card was selected (Live off) — the smallest honest version
	// of "does it flash or notify" the owner was unsure about. Reset to 0 the
	// moment the owner actually scrolls back up (the button's own click
	// handler, above) or deselects (`deselect()`, below).
	function paint_back_top() {
		if (!$back_top) return;
		const scrolled = $left.el.scrollTop > 24;
		$back_top.el.hidden = !scrolled;
		$back_top.empty(() => {
			span("↑ Back to top");
			if (unseen_count > 0) span.c("v3-back-top-count", String(unseen_count));
		});
	}

	// FIX 1B — TWO SIZES (the owner: "we need big items with icons, and then
	// like maybe smaller items"). `weight()` already decides what matters most
	// (`code` skill: reuse, don't re-rank) — its two biggest bonuses are
	// exactly `status === "needs-you"` and "is the current focus card", so
	// those are read directly here rather than computing a full weight sort
	// for every row on every sync: a card is BIG for the same reason it would
	// have topped `weight()`'s own ranking, just without the extra work of
	// actually ranking the whole rail by it. This is also what replaces the
	// old pinned strip's one real job — a `needs-you` card was never buried,
	// because it still can't be: it renders bigger, right there in the
	// column, instead of living a second time in a box above it. See this
	// task's own `decision` log for the alternative considered and rejected.
	const is_big_card = (c, focus_id) => c.status === "needs-you" || c.id === focus_id;

	// TIMELINE (2026-09-19, `ai/2026-09-19/v3-timeline/`) — the card's own time
	// used to live in this footer; it now lives OUTSIDE the card, on the
	// axis's own time line above it (`axis_item()`, below) — "the card face
	// loses its time" is the owner's own words for this.
	//
	// FIX 1B, 2026-09-21 — the owner: "put the icon on the same line as the
	// heading... in the details page that's how it lines up." A BIG row keeps
	// the `.card`/`.v3-tile` ground (icon+title on one `.v3-tile-head` row,
	// same shape `detail()`'s own head uses, then the one-sentence preview,
	// then the author) — the grid view's `.v3-tile-big` CSS already exists
	// for this, reused verbatim. An ORDINARY row drops the card ground
	// entirely and becomes the one-liner the sticky strip's own
	// `.v3-pinned-row` already proved (icon, bold title, author, one line,
	// ellipsis) — `.v3-tile-compact` (v3.css) is that same shape kept, wearing
	// its module's own name now that "pinned" is gone. No sentence on an
	// ordinary row (item 3: "drop the truncated detail text") — a big row's
	// sentence is the only place `first_sentence()` still renders here.
	function row_classes(c, big) {
		const mine = author_of(c) === "owner";
		if (!big) return "v3-tile-compact v3-inbox-card";
		return "card v3-tile v3-tile-big v3-inbox-card" + (mine ? " v3-tile-owner" : "");
	}
	function paint_row($row, c, big) {
		$row.el.className = row_classes(c, big);
		$row.style({ "--card-edge": edge_of(c.status) });
		const mine = author_of(c) === "owner";
		$row.empty(() => {
			if (big) {
				div.c("v3-tile-head flex v-center gap", () => {
					if (c.icon) icon(c.icon);
					// The owner's own title is only ever the first 90 characters
					// of this SAME text (`say.mjs`'s own `--heard`/
					// `Assistant.start()`) — showing it above the sentence
					// prints the owner's words twice, so only a non-owner card
					// gets a title line here.
					if (!mine) div.c("v3-tile-title", short_title(c));
				});
				const sentence = first_sentence(c);
				if (sentence) div.c("v3-tile-sentence", sentence);
				div.c("v3-tile-foot flex v-center", () => span.c("v3-tile-author", author_label(author_of(c))));
			} else {
				if (c.icon) icon(c.icon);
				div.c("v3-tile-title", short_title(c));
				span.c("v3-tile-author muted", author_label(author_of(c)));
			}
		});
	}
	function row_of(c, big) {
		const $row = button.c(row_classes(c, big)).attr("type", "button").click(() => select(c.id, true));
		paint_row($row, c, big);
		return $row;
	}

	/**
	 * TIMELINE (2026-09-19, `ai/2026-09-19/v3-timeline/`) — one card's own
	 * DECORATION: the divider drawn above it (an hour line, a collapsed-gap
	 * break, or nothing) and its own time label, now living OUTSIDE the card
	 * (`row_of()`'s own note). `idx` is this card's position in `cards`
	 * (newest-first); `prev_t` is the time immediately above it on the axis —
	 * "now" itself for the very first card, so the gap from THIS MOMENT to
	 * the newest thing that happened is measured the exact same way a gap
	 * between two older cards is.
	 *
	 * Distance shows time, adaptively (the owner's own words): the margin
	 * above a card grows 0.5em per minute since the one above it, clamped to
	 * 6em so a quiet stretch reads as "a while" without spending the whole
	 * screen on it — UNLESS the gap is over 45 minutes, which collapses to
	 * one dashed BREAK row instead of a very tall margin, so a two-hour gap
	 * and an overnight one both read as "one short row", not a scroll.
	 */
	function decor_of(c, idx, prev_t) {
		const t = Date.parse(c.updated_at ?? c.at ?? 0) || 0;
		const gap_min = Math.max(0, (prev_t - t) / 60000);
		const is_break = gap_min > 45;
		/* ⚠ RESCALED 2026-09-21, measured: the rate was 0.5em/min capped at 6em,
		   written when every row was a ~90px card. Now an ordinary row is a 16px
		   one-liner, so a quiet 12 minutes drew 93px of nothing above a 16px
		   row — six times the row itself — and only THREE rows fit a 1000px
		   screen. That is the owner's "the vertical flow there is huge", and it
		   was never sloppiness: it is this feature, at a scale the compact rail
		   invalidated. 0.2em/min capped at 2em keeps time legible as distance
		   (a long pause still reads as a long pause) at about a third the cost.
		   The alternative, if this reads as too flat: keep 0.5em/min and cap at
		   3em — same shape, gentler cut, but a 10-minute gap is still twice a
		   row's own height. */
		const margin_em = is_break ? 1.5 : Math.min(2, Math.max(0.5, gap_min * 0.2));
		const show_hour = hour_start(t) !== hour_start(prev_t);
		return { t, prev_t, is_break, margin_em, show_hour };
	}

	/* The divider ABOVE one card — an hour line (`4 PM`, bold, full column
	   width — "the smaller of the two mechanisms": a plain positioned
	   element, not `ui/background/`'s own layer, since these lines are
	   data-driven off real gaps, not a repeating pattern a CSS background
	   could paint) or a collapsed-gap break ("4:32 PM … 6:47 PM", dashed);
	   nothing when the card is simply close enough to the one above it that
	   neither applies. */
	function paint_divider($divider, decor) {
		$divider.empty(() => {
			if (decor.is_break) return void div.c("v3-axis-break", `${clock(decor.prev_t)} … ${clock(decor.t)}`);
			if (decor.show_hour) return void div.c("v3-axis-hour", hour_label(decor.t));
		});
	}

	/* One card's own row PLUS its axis decoration, built together so
	   `row_of()`'s own `button.c(...)` call captures into THIS wrapper
	   (`code` skill #1 — a captor left over from whatever ran last is the
	   trap `$grip`'s own note names) instead of whatever the page built
	   before it. */
	function axis_item(c, big) {
		let $divider, $time, $row;
		const $wrap = div.c("v3-axis-item");
		$wrap.append(() => {
			$divider = div.c("v3-axis-divider");
			$time = small.c("v3-axis-time muted");
			$row = row_of(c, big);
		});
		return { $wrap, $divider, $time, $row };
	}

	/* The brief highlight a resurfaced row gets (item 6) — a class added then
	   removed a moment later, `v3.css`'s own transition doing the actual
	   fade; nothing here decides how it LOOKS, only how long it lasts and
	   that a row already mid-flash (a second resurface before the first
	   fade finished) restarts cleanly instead of stacking two timers. */
	const resurface_timers = new Map();
	function flash_resurface($wrap) {
		$wrap.el.classList.remove("v3-axis-resurfaced");
		void $wrap.el.offsetWidth;   // force a reflow so re-adding the class restarts the CSS transition
		$wrap.el.classList.add("v3-axis-resurfaced");
		clearTimeout(resurface_timers.get($wrap));
		resurface_timers.set($wrap, setTimeout(() => $wrap.el.classList.remove("v3-axis-resurfaced"), 1600));
	}

	/* Full rebuild ONLY on first draw; every later call patches — new ids get
	   a row PREPENDED (the inbox is newest-first, so a genuinely new card
	   always belongs at the top), a changed id's existing row is repainted in
	   place (never reordered, so the owner's own scroll position is never
	   invalidated by an update elsewhere in the list), and a row simply gets
	   its "selected" class toggled. `paint_row()` (above) rebuilds a row's own
	   INNER content every time — it is a handful of small text nodes, not a
	   DOM move, and it is what lets a card's bigness (`is_big_card()`) change
	   live if its status or the focus card does. Every row's own DECORATION
	   (margin, divider, time label) is repainted on every call — because a
	   card arriving ABOVE an existing one changes what that existing one's
	   own gap is measured FROM, even though the existing row itself never
	   moves. */
	function sync_inbox() {
		const now_ms = Date.now();
		const focus_id = newest_focus_id(log);
		const seen = new Set();
		let prev_el = null;   // the DOM node that should sit right before this one — RESURFACING (item 6), below
		cards.forEach((c, i) => {
			seen.add(c.id);
			const big = is_big_card(c, focus_id);
			const prev_t = i === 0 ? now_ms : (Date.parse(cards[i - 1].updated_at ?? cards[i - 1].at ?? 0) || 0);
			const decor = decor_of(c, i, prev_t);
			let had = rows.get(c.id);
			const is_new = !had;
			if (is_new) {
				const { $wrap, $divider, $time, $row } = axis_item(c, big);
				rows.set(c.id, $row);
				axis.set(c.id, { $wrap, $divider, $time });
				// Placed correctly below, in the reconciliation step — a brand
				// new id has no "prior position" to leave, so it never counts
				// as a RESURFACE (that flash is for a card that MOVED, not one
				// that just arrived).
				had = $row;
			} else {
				paint_row(had, c, big);
			}
			mark_row(c.id, had);
			const a = axis.get(c.id);
			a.$wrap.style({ "margin-block-start": decor.margin_em + "em" });
			paint_divider(a.$divider, decor);
			a.$time.text(clock(decor.t));

			/**
			 * RESURFACING (item 6, 2026-09-19: "a card updated or referenced
			 * again ... moves to its new time on the axis — it already
			 * re-sorts by last update; make the move visible with a brief
			 * highlight"). `by_recency()` already puts this card at its new,
			 * correct index `i` — what was MISSING is actually moving its row
			 * there: the plain-inbox rule above ("a known id's row never
			 * moves") is right for a simple text edit, but wrong the instant
			 * a card's OWN time changes enough to reorder it, which is
			 * exactly what a resurface is. This checks whether the row
			 * already sits right after `prev_el` (the row placed just before
			 * it) — a keyed-list reconciliation, one `insertBefore` only for
			 * a row that is actually out of place, never for the ones that
			 * are already correct, so a quiet page touches the DOM zero times
			 * here. An EXISTING row that had to move is the resurface signal
			 * itself — a brand new row moving to its first position is not.
			 */
			const wrap = a.$wrap.el;
			if (wrap.previousElementSibling !== prev_el) {
				$axis_list.el.insertBefore(wrap, prev_el ? prev_el.nextSibling : $axis_list.el.firstChild);
				if (!is_new) flash_resurface(a.$wrap);
			}
			prev_el = wrap;
		});
		// A card that vanished (approved and hidden, or the file was reset) loses its row.
		[...rows.keys()].filter(id => !seen.has(id)).forEach(id => {
			rows.get(id)?.el.remove(); rows.delete(id);
			axis.get(id)?.$wrap.el.remove(); axis.delete(id);
		});
		paint_back_top();
	}

	/* THE JUMP KEY (item 3, the owner's own words: "StarCraft's jump to last
	   alert") — Spacebar (guarded in `on_key` below to fire only when nothing
	   is focused). First press: jump to the newest card AND remember where
	   "back" means; a second press, once already parked on the newest card,
	   returns there. A brand new card arriving while parked at the newest
	   simply becomes the new target — `cards[0]` always means "whatever is
	   newest right now". live-select, 2026-09-21: the on-screen "New item ↓"
	   button this used to share with the old sticky strip is gone (Fix 1
	   deletes the strip; Fix 2 means Live already keeps the newest showing by
	   itself when nothing is selected) — kept as the keyboard-only shortcut it
	   always partly was, since nothing in the brief asked to remove it and a
	   quiet feature that still works is not a "thing that does not work".*/
	function jump_or_return() {
		const newest = cards[0];
		if (!newest) return;
		if (selected_id !== newest.id) { return_id = selected_id; select(newest.id, true); }
		else if (return_id && cards.some(c => c.id === return_id)) { const back = return_id; return_id = null; select(back, true); }
	}

	function draw_right() {
		const c = cards.find(x => x.id === selected_id);
		$right_body.empty(() => c
			? detail(c, log, page, verdicts, { skip_back: true, on_verdict: (say, note) => advance(c.id, say, note) })
			: p.c("muted", cards.length ? "Not found." : "Nothing left to review — the count above brings approved cards back."));
	}

	/* The UNDECIDED QUEUE — eligible cards (`eligible()`, top of this file)
	   that have not been approved, in the CURRENT rail order. This is what
	   Approve/Improve's own "move on" and the keyboard actually step through
	   — narrower than `cards` (the rail itself keeps showing every card the
	   board has always shown, working/needs-you/no-status included; nothing
	   is hidden by ineligibility, only skipped when stepping). */
	function queue() { return cards.filter(c => eligible(c) && !is_approved(c.id, verdicts)); }

	/**
	 * Called right after a verdict is posted on the card currently open —
	 * this is the "one at a time" half of the brief: move on to the next
	 * UNDECIDED, ELIGIBLE item WITHOUT the owner hunting for it. `idx` is
	 * read from the queue as it stood the instant before this verdict —
	 * never from `verdicts` after the fact, because the live socket echo
	 * that would actually remove an approved card from `is_approved()`
	 * has not arrived yet at this exact moment (`append_line` only resolves
	 * once the WRITE lands, not once the READ side has replayed it back) —
	 * reading the queue fresh here would still count the card just decided
	 * and hand back the very card the owner just left. Excluding
	 * `decided_id` by hand sidesteps that race entirely, for an Approve
	 * (gone for good) and an Improve (still eligible, but the owner is done
	 * with it for now) alike. */
	function advance(decided_id, say, note) {
		// Read the decided card's own title BEFORE it can disappear from
		// `cards` (an Approve drops it from `by_recency()` below) — the toast
		// needs to say WHAT just happened, not just that something did.
		const decided_title = short_title(cards.find(c => c.id === decided_id) ?? {});
		const before = queue().filter(c => c.id !== decided_id);
		const idx = queue().findIndex(c => c.id === decided_id);
		const next = before[idx] ?? before[idx - 1] ?? before[0] ?? null;
		cards = by_recency();
		sync_inbox();
		// A plain "reopen" (the card's own undo/"approve instead" buttons)
		// already shows its own state change right there on the card — the
		// toast is only for Approve/Improve, the two verdicts that make the
		// card LEAVE what the owner was just looking at.
		if (say === "approve" || say === "improve") show_toast(decided_id, say, note, decided_title);
		// Re-check against the freshly reloaded rail — the live echo may have
		// landed by now (or something else on the board changed) — falling
		// back to the fresh queue's own first item keeps this correct either way.
		const next_id = next && cards.some(c => c.id === next.id) ? next.id : queue()[0]?.id ?? null;
		if (next_id) select(next_id, true); else { selected_id = null; draw_right(); }
	}

	/**
	 * THE VERDICT TOAST (approve-loop, 2026-09-20) — right after Approve or
	 * Improve fires and `advance()` has already moved the reader on to the
	 * next card, this is what proves the press actually did something: which
	 * card, what was decided, and a real Undo (the exact same `reopen` verdict
	 * `verdict_controls`'s own "undo" button writes) right there without
	 * hunting the rail for the card that just left it. Auto-dismisses after a
	 * few seconds so it never becomes one more thing to close by hand; a
	 * second verdict while one toast is still showing simply replaces it
	 * (`clearTimeout` first) rather than stacking.
	 */
	let toast_timer = null;
	function hide_toast() { clearTimeout(toast_timer); toast_timer = null; $toast.el.hidden = true; }
	function show_toast(id, say, note, title) {
		clearTimeout(toast_timer);
		$toast.el.hidden = false;
		$toast.empty(() => {
			div.c("v3-toast-msg flex v-center gap", () => {
				if (say === "approve") { icon("check_circle"); span(`Approved “${title}” — it left your inbox.`); }
				else { icon("flag"); span(`Sent to improve: “${note}”.`); }
			});
			button.c("v3-toast-undo").attr("type", "button").text("Undo").click(async () => {
				hide_toast();
				const by = window.$VERDICT_AUTHOR || "owner";
				await write_verdict(id, "reopen", "");
				// ⚠ Mirror the append into the LOCAL `verdicts` model by hand,
				// same shape the real line carries — `write_verdict`'s promise
				// resolves once the WRITE lands, not once this client's own
				// `verdicts.live()` echo has replayed it back (the same race
				// `advance()`'s own note above describes), so re-selecting
				// this card right away re-rendered it as still approved,
				// found live proving this fix. The real echo lands moments
				// later and says the exact same thing, so this never drifts.
				verdicts.verdict({ id, say: "reopen", at: stamp(), by });
				cards = by_recency();
				sync_inbox();
				select(id, true);
			});
		});
		toast_timer = setTimeout(hide_toast, 7000);
	}

	// FIX 2 — SELECTING A CARD IS WHAT TURNS LIVE OFF (the owner: "selecting
	// a card turns Live off... the URL becomes that card's own url"). One
	// line does both jobs that used to be split across `stop_following()`
	// and a separate button-paint call.
	function select(id, push) {
		selected_id = id;
		if (get_live()) set_live(false);
		rows.forEach((($row, rid) => mark_row(rid, $row)));
		draw_right();
		$split_v.ac("v3-mobile-detail");   // a no-op above the <40em breakpoint
		// `card_url()` is built from the board root this page was opened on
		// (board-declutter, 2026-09-22) — `/framework/ai/timeline/<id>/` or
		// `/framework/ai/v/3/timeline/<id>/`, so the view stays in the url
		// with the card and a reload lands on both.
		if (push) history.pushState(null, "", card_url(id));
	}

	function on_pop() {
		if (!document.contains($wall.el)) { window.removeEventListener("popstate", on_pop); return; }
		// The last path segment is the card id on any of the three shapes this
		// board has ever written: `<root>timeline/<id>/`, the older
		// `/v/3/<id>/`, or a bare root (no card — the deselect gesture below).
		const m = location.pathname.replace(/\/+$/, "").match(/\/([^/]+)$/);
		const id = m && cards.some(c => c.id === m[1]) ? m[1] : null;
		// Landing on a real card's own url (Back/Forward) is a selection, the
		// same as a click — turns Live off. Landing back on the BARE board url
		// (Back past the first card, say) is the deselect gesture Fix 2 gives
		// the Live button itself, reused here so the browser's own Back
		// button and the on-screen control never disagree about what
		// "nothing selected" looks like.
		if (id) {
			selected_id = id;
			if (get_live()) set_live(false);
			rows.forEach((($row, rid) => mark_row(rid, $row)));
			draw_right();
		} else if (!get_live()) {
			set_live(true);
		}
	}
	window.addEventListener("popstate", on_pop);

	/* One at a time, by keyboard — the owner's own words, "as I click through
	   things" — j/ArrowDown and k/ArrowUp step through the UNDECIDED QUEUE
	   (`queue()`, above — eligible, unapproved cards only), not the whole
	   rail: the rail still shows everything, but stepping is for clearing
	   the actual pile, so it skips a `working` status update or the owner's
	   own echoed sentence the same way Approve/Improve's own "move on" does.
	   If the card currently open is not itself in the queue (the owner
	   clicked something ineligible to look at it), the first press jumps
	   INTO the queue instead of stepping relative to a position it does not
	   have. Ignored while typing in a note box or anywhere text entry is
	   focused. */
	// ⚠ RECONCILED WITH ONE MEANING PER KEY (2026-09-19, `v3-timeline` —
	// inbox-zero's own j/k/arrows and this task's own Spacebar both reached
	// for "move" and needed one scheme, not two fighting over the same keys):
	// j/k/ArrowUp/ArrowDown keep inbox-zero's exact meaning, UNCHANGED — step
	// through the UNDECIDED VERDICT QUEUE, "as I click through things to get
	// to zero." Spacebar is the ONLY new key this task adds, and it means
	// something else on purpose — jump to the NEWEST thing on the whole axis,
	// eligible or not (StarCraft's "jump to last alert") — because the two
	// questions are different ("what haven't I judged yet" vs "what just
	// happened"), and giving them separate keys means neither ever surprises
	// the other.
	function on_key(e) {
		if (!document.contains($wall.el)) { window.removeEventListener("keydown", on_key); return; }
		const tag = document.activeElement?.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
		if (e.code === "Space" || e.key === " ") { e.preventDefault(); jump_or_return(); return; }
		const dir = (e.key === "ArrowDown" || e.key === "j") ? 1 : (e.key === "ArrowUp" || e.key === "k") ? -1 : 0;
		if (!dir) return;
		const pool = queue();
		const idx = pool.findIndex(c => c.id === selected_id);
		const next = idx === -1 ? pool[0] : pool[idx + dir];
		if (next) { e.preventDefault(); select(next.id, true); }
	}
	window.addEventListener("keydown", on_key);

	// ── the drag handle — ext/grip, the "smaller" of the two mechanisms the
	// owner named (`core/Page`'s own `columns()` is the whole column-routing
	// system this task is deliberately not taking on yet). `grip` is built
	// for an EDGE-docked rail, writing a width relative to ITS OWN PARENT's
	// bounding rect — mounted here as a full-bleed sibling of both columns
	// (`inset: 0`, so its rect === the split container's own, a FIXED edge
	// regardless of where the drag handle is currently drawn), its `write()`
	// therefore reads as the exact left-column width in px, not a delta off
	// wherever the handle last sat. The visible handle is repositioned with
	// an inline `left`, which beats any stylesheet rule regardless of layer.
	//
	// ⚠ `grip({...})` is a FACTORY — it auto-appends itself into whatever the
	// CURRENT CAPTOR is the instant it is called, the same as `div.c(...)`
	// does. Calling it as a bare statement out here (the captor left over
	// from whatever ran last) put a View object where text was expected and
	// the literal "() => $grip" PRINTED ON THE PAGE (measured, 2026-09-19) —
	// `$split_v.append(fn)` is what RE-OPENS `$split_v` as the captor for the
	// callback's duration, the same device `code`#1 names for "filled in a
	// callback"; the callback ends in a statement, not an expression, so its
	// own return value (`undefined`) is not ALSO appended (`code`#7's other
	// trap, right next to this one).
	const MIN = 220;
	const $split = $left.el.parentElement;
	const saved_split = prefs.get({ split: null }).split;
	let $grip;

	function apply_split(px) {
		$left.style({ flex: `0 0 ${px}px` });
		$grip.style({ left: px + "px" });
	}

	$split_v.append(() => {
		$grip = grip({
			write(px) {
				const total = $split.getBoundingClientRect().width;
				const w = Math.min(Math.max(px, MIN), Math.max(MIN, total - MIN));
				apply_split(w);
				return w;
			},
			done(w) { prefs.patch({ split: w }); },
			from: "start",   // the LEFT column's own width, not the right one's
			mirror: false,   // the strip sits at $grip's own left — where apply_split() puts it
		});
		$grip.style({ position: "absolute", inset: "0 auto 0 0" });
	});

	// First layout tick: half the split container, or the remembered value.
	// ⚠ EVEN, not just half — found live proving item 1 ("two columns share
	// the width evenly"): the split container's own `gap` (between the two
	// columns) has to come OFF the total before halving it, or the right
	// column silently ends up one `--gap` NARROWER than the left one (the
	// left gets exactly half the full width; whatever the gap eats comes
	// entirely out of the right side). Measured live: 832px vs 811.84px
	// before this fix, equal within 1px after it.
	// ⚠ SKIPPED entirely below the <40em breakpoint (the CSS's own mobile
	// query, matched here the same way) — found live at 400px: `apply_split`
	// sets an INLINE `flex: 0 0 <px>` on `.v3-inbox`, and an inline style
	// beats every CSS rule regardless of specificity, so it was silently
	// overriding the mobile stylesheet's own `.v3-inbox { flex: 1 1 auto }`
	// (one pane filling the whole column) with a stale desktop half-height
	// instead — the inbox cut off partway down with a blank band below it.
	// One pane at a time down there needs no JS-computed split at all.
	requestAnimationFrame(() => {
		if (window.matchMedia("(width < 40em)").matches) return;
		const total = $split.getBoundingClientRect().width;
		const split_gap = parseFloat(getComputedStyle($split).gap) || 0;
		apply_split(saved_split ?? (Math.round((total - split_gap) / 2) || 400));
	});

	sync_inbox();
	draw_right();

	return {
		/**
		 * FIX 2 (the owner: "Live on = nothing is selected... as new cards
		 * arrive the newest one keeps being the one shown... if I've selected
		 * one of the items, the view should never jump"). `get_live()` alone
		 * decides this now — no separate "have I scrolled or clicked THIS
		 * VISIT" flag on top of it (that was the old `following`): Live on
		 * means the newest card is always what is shown, full stop; Live off
		 * means whatever is selected stays exactly where it is, and this only
		 * counts how many NEW cards showed up while nobody was watching
		 * (Fix 3's own badge, via `unseen_count`).
		 */
		update() {
			const prev_ids = new Set(cards.map(c => c.id));
			cards = by_recency();
			if (!cards.length) { selected_id = null; sync_inbox(); draw_right(); return; }
			// The card the owner had open can vanish the instant its OWN
			// answer lands (the heard→answer merge, above) — follow it to the
			// row that replaced it, rather than falling through to
			// detail()'s "Not found.".
			if (!cards.some(c => c.id === selected_id)) {
				selected_id = cards.find(c => heard_of(c, log)?.id === selected_id)?.id ?? cards[0]?.id ?? selected_id;
				draw_right();
			}
			const newest = cards[0];
			if (get_live()) {
				if (newest && newest.id !== selected_id) { selected_id = newest.id; draw_right(); }
			} else {
				const arrived = cards.filter(c => !prev_ids.has(c.id)).length;
				if (arrived) unseen_count += arrived;
			}
			sync_inbox();
		},

		/**
		 * FIX 2 — THE DESELECT GESTURE (the owner: "it's almost like the live
		 * mode is deselecting... it doesn't necessarily have to automatically
		 * scroll to top, but maybe it should... it just kind of refreshes the
		 * view"). Called from `set_live(true)` (top_level, above) and from
		 * `on_pop()` landing back on the bare board url — the button and the
		 * browser's own Back both mean the same thing. Scrolling to top is the
		 * one REVERSIBLE choice here (a `decision` line in this task's log
		 * names the alternative): the owner's own "maybe it should" is taken
		 * as yes, because a half-scrolled deselect reads as a bug, not a
		 * feature, the same words the brief uses for it.
		 */
		deselect() {
			selected_id = cards[0]?.id ?? null;
			return_id = null;
			unseen_count = 0;
			history.replaceState(null, "", timeline_url);
			$left.el.scrollTo({ top: 0, behavior: "smooth" });
			rows.forEach((($row, rid) => mark_row(rid, $row)));
			draw_right();
			sync_inbox();
		},
	};
}

/**
 * THE NOW VIEW — first and default: the newest thing the owner said, in
 * full, verbatim, styled as theirs (a transcription look — the owner's own
 * words, "my exact words appear the second I send... then get refined into
 * a summary as it is processed") — and directly under it, every card that
 * answers it: an explicit `re:` to its id, or anything touched since it
 * arrived (the mastermind does not always tag `re:`, so recency is the
 * fallback net an answer still falls through). Meant to be read with the
 * dev bar closed — nothing here is ever clamped, and a reply still being
 * typed out grows by appending TEXT NODES (never a re-render), the same
 * device `dev/DevBar/says.js` uses for the identical reason.
 *
 * Stays open across a live update, the same contract `master_detail()`
 * keeps: a rebuild here on every board tick would be the same scroll-
 * losing, mid-read-yanking bug all over again. `update()` only moves on to
 * a NEW owner card when one lands AND the owner is not mid-read
 * (`following`); otherwise a "new ↓" chip offers it.
 *
 * FRONT-DOOR-TODAY (2026-09-21, `ai/2026-09-21/front-door-today/`) — measured
 * live: the newest OWNER card on the whole board was from 2026-09-19, while
 * 26 of today's cards were all `mastermind` (the fast assistant that turns
 * the owner's own words into a card was not running, so nothing the owner
 * said today became one). Now is built around exactly one heading — "you,
 * <time>" — so a reader landing here saw that two-day-old heading as if it
 * were current. Not fixed by re-ranking Now's own content (that changes what
 * Now IS — a conversation thread, not a feed — which the brief says not to
 * redo); instead Now now NOTICES when its own heading is stale and says so,
 * with one obvious way to what actually is current. `is_stale()`/
 * `paint_stale()`, below.
 */
function now_view($wall, log, page, timeline_url) {
	const STREAM_IDLE_MS = 3000;
	let heard_id = null, following = true, chunks_seen = 0;
	let $box, $stale, $heard, $chip, $answers;
	let stale_painted = null;
	const entries = new Map();   // answer id -> {$card, $title, $body, $time, c, caret, timer}

	const newest_owner = () => {
		const owners = log.cards.filter(c => author_of(c) === "owner");
		return owners.length ? owners.reduce((a, b) => Date.parse(b.at ?? 0) >= Date.parse(a.at ?? 0) ? b : a) : null;
	};

	// STALE — the day-only comparison the brief's own guess names: "the
	// thread's newest card is not from today". Measured against `today`, not
	// against the board's newest card's day, so a quiet day (nobody has
	// posted anything yet) never reads as stale — there is nothing newer to
	// point at yet, so the two-day-old heading is simply the truth right now.
	const day_of = at => { const d = new Date(at); return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(); };
	const is_today = at => !!at && day_of(at) === day_of(Date.now());
	const day_word = at => new Date(at).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
	const newest_board_at = () => log.cards.reduce((a, c) => Math.max(a, Date.parse(c.updated_at ?? c.at ?? 0) || 0), 0);
	const is_stale = owner => is_today(newest_board_at()) && !is_today(owner?.at);

	function paint_stale(owner) {
		if (!$stale) return;
		const stale = is_stale(owner);
		if (stale === stale_painted) return;
		stale_painted = stale;
		$stale.el.hidden = !stale;
		if (!stale) return;
		$stale.empty(() => {
			div.c("v3-now-stale-body flex v-center gap", () => {
				icon("history");
				span.c("v3-now-stale-text",
					`This thread is from ${day_word(owner.at)} — today's newest activity is in the timeline.`);
			});
			// A real link, not a button (board-declutter, 2026-09-22): the
			// timeline is a url now, so landing on it is an ordinary
			// navigation and the back button brings you straight back here.
			// `.btn` because it is an anchor now: framework.css's control
			// grammar only gives a LINK the button box when it wears that word.
			a.c("v3-now-stale-btn btn prim").href(timeline_url).text("Show today");
		});
	}

	// An answer: an explicit `re:` to this owner card, OR anything touched at
	// or after the owner's own arrival — the fallback net, because the reply
	// card `Assistant.start()` writes is born in the SAME second as the
	// owner's own card (both stamped from one `now()` call, second
	// precision only) — `>=`, not `>`, is what actually catches it the
	// instant it exists.
	const answers_for = owner => !owner ? [] : log.cards.filter(c =>
		c.id !== owner.id && author_of(c) !== "owner" &&
		(c.re === owner.id || Date.parse(c.updated_at ?? c.at ?? 0) >= Date.parse(owner.at ?? 0))
	).sort((a, b) => Date.parse(a.at ?? 0) - Date.parse(b.at ?? 0));

	function draw_heard(owner) {
		$heard.empty(() => {
			if (!owner) { p.c("muted", "Nothing heard yet."); return; }
			div.c("v3-heard-head flex v-center gap", () => { icon("mic"); span.c("muted", "you, " + clock(owner.at)); });
			div.c("v3-heard-text", owner.text || owner.title || "");
		});
	}

	function answer_row(c) {
		let $title, $body, $time;
		const $card = div.c("v3-now-card flex v gap", () => {
			div.c("flex v-center gap", () => {
				if (c.icon) icon(c.icon);
				span.c("v3-tile-author", author_label(author_of(c)));
				$time = small.c("v3-tile-time", clock(c.updated_at ?? c.at));
				if (c.status) span.c("v3-status", status_word(c.status));
			});
			if (c.title) $title = div.c("v3-tile-title", c.title);
			$body = div.c("v3-now-card-body", (c.text ?? "").trim());
		});
		return { $card, $title, $body, $time, c, caret: null, timer: null };
	}

	/* A card not currently mid-stream simply gets a clean rebuild on change —
	   nobody is watching its text nodes grow (that is only ever true of the
	   entry `chunk_in()` below is actively appending to), so there is
	   nothing a rebuild could yank out from under a reader. */
	function sync_answers(owner) {
		const list = answers_for(owner);
		const seen = new Set();
		list.forEach(c => {
			const key = c.id ?? c;
			seen.add(key);
			const had = entries.get(key);
			if (!had) { const e = answer_row(c); entries.set(key, e); $answers.append(e.$card); return; }
			if (had.c === c) return;
			had.c = c;
			if (had.caret) { had.$time?.text(clock(c.updated_at ?? c.at)); return; }   // still streaming — leave the growing body alone
			const fresh = answer_row(c);
			had.$card.el.replaceWith(fresh.$card.el);
			entries.set(key, fresh);
		});
		[...entries.keys()].filter(id => !seen.has(id)).forEach(id => { entries.get(id)?.$card.el.remove(); entries.delete(id); });
	}

	/* ── streaming: a chunk grows a visible answer's body in place, text
	   nodes only — `dev/DevBar/says.js`'s own device, same reason: nothing
	   being read should ever move. A chunk for an id not currently shown
	   (its `card` line has not landed yet) is simply skipped — that card's
	   own eventual `card` line already carries the whole text. ──────────── */
	function start_stream(e) {
		if (!e.caret) { const $c = span.c("v3-now-caret", "▍"); e.$body?.append($c); e.caret = $c; }
	}
	function stop_stream(e) {
		if (e.timer) clearTimeout(e.timer);
		e.timer = null;
		e.caret?.el.remove();
		e.caret = null;
	}
	/* The idle timeout can fire with no further board tick to trigger
	   `sync_answers()` — this is what still picks up the title/status the
	   real, finishing `card` line carried, even when nothing else redraws. */
	function refresh_entry(e) {
		const key = e.c.id ?? e.c;
		if (entries.get(key) !== e) return;   // already replaced by a newer sync
		const fresh = answer_row(e.c);
		e.$card.el.replaceWith(fresh.$card.el);
		entries.set(key, fresh);
	}
	function chunk_in(chunk) {
		const e = entries.get(chunk.id);
		if (!e?.$body) return;
		start_stream(e);
		e.$body.el.insertBefore(document.createTextNode(chunk.text), e.caret.el);
		if (e.timer) clearTimeout(e.timer);
		e.timer = setTimeout(() => { stop_stream(e); refresh_entry(e); }, STREAM_IDLE_MS);
	}
	function process_chunks() {
		if (log.chunks.length <= chunks_seen) return;
		log.chunks.slice(chunks_seen).forEach(chunk_in);
		chunks_seen = log.chunks.length;
	}

	function show(owner) {
		heard_id = owner?.id ?? null;
		entries.forEach(e => e.timer && clearTimeout(e.timer));
		entries.clear();
		$answers.empty();
		paint_stale(owner);
		draw_heard(owner);
		sync_answers(owner);
		process_chunks();   // backfill: chunks for this owner's reply may already be in log.chunks
		following = true;
		$chip.el.hidden = true;
	}

	div.c("v3-now flex v gap", $b => {
		$box = $b;
		$stale = div.c("v3-now-stale card");
		$stale.el.hidden = true;
		$heard = div.c("v3-heard");
		$chip = button.c("v3-now-chip", "new ↓").attr("type", "button").click(() => show(newest_owner()));
		$chip.el.hidden = true;
		$answers = div.c("v3-now-answers flex v gap");
		composer();
	});

	function on_scroll() {
		if (!document.contains($box.el)) { window.removeEventListener("scroll", on_scroll); return; }
		following = false;
	}
	window.addEventListener("scroll", on_scroll, { passive: true });

	show(newest_owner());

	return {
		update() {
			const owner = newest_owner();
			paint_stale(owner);
			if (owner?.id !== heard_id) {
				following ? show(owner) : ($chip.el.hidden = false);
				return;
			}
			sync_answers(owner);
			process_chunks();
		},
	};
}

/* Raw hit counts AND per-id history, over Timeline's own merge-by-id `cards`
   — `super.card()` still does the merge everyone reads; this only ADDS the
   bookkeeping the wall needs that the shared model has no reason to carry
   for the dev bar's own reading of the same file. */
class Weighted extends Timeline {
	hits = new Map();
	history = new Map();
	card(value) {
		if (value.id != null) {
			this.hits.set(value.id, (this.hits.get(value.id) ?? 0) + 1);
			(this.history.get(value.id) ?? this.history.set(value.id, []).get(value.id)).push(value);
		}
		super.card(value);
	}
	reset() { this.hits = new Map(); this.history = new Map(); return super.reset(); }
}

/**
 * How much a card matters, right now — the simplest heuristic that actually
 * ranks a real board: needs-you always leads (the owner's yes is never
 * buried); then FOCUS (`focus: true` on a line, `say.mjs --focus` — "card
 * size should follow current focus"): the NEWEST focused card gets a large
 * bonus that decays over ~10 minutes, so it is the biggest card on the wall
 * right after it is said and settles back down on its own — an OLDER
 * focused card gets none the moment a newer one exists, `newest_focus_id()`
 * below is always exactly one id or none; then `hits` (how many lines this
 * id has had — a card that keeps getting updated is a topic that keeps
 * coming up); then how many of the OWNER's own lines mention this card's id
 * or the first word of its title (the owner bringing something up again is
 * the strongest "this matters" signal there is); then recency, decaying
 * over two hours so an old `done` card settles toward the bottom without
 * vanishing outright.
 */
function weight(c, log, focus_id) {
	const hits = log.hits.get(c.id) ?? 1;
	const first_word = (c.title ?? "").trim().split(/\s+/)[0]?.toLowerCase();
	const mentions = log.cards.filter(o => author_of(o) === "owner" && (
		o.text?.includes(c.id) || (first_word && o.text?.toLowerCase().includes(first_word))
	)).length;
	const at = Date.parse(c.updated_at ?? c.at ?? 0) || 0;
	const recency = Math.max(0, 1 - (Date.now() - at) / (2 * 60 * 60 * 1000));
	const focus_bonus = c.id === focus_id ? Math.max(0, 1 - (Date.now() - at) / (10 * 60 * 1000)) * 2000 : 0;
	return (c.status === "needs-you" ? 1000 : 0) + focus_bonus + hits * 3 + mentions * 8 + recency * 12;
}

/** The one card currently "in focus" — the newest `focus: true` line, if any
    is recent enough to still matter (the decay in `weight()` already fades
    its bonus to nothing by 10 minutes; this just names which id to try). */
function newest_focus_id(log) {
	const focused = log.cards.filter(c => c.focus);
	if (!focused.length) return null;
	return focused.reduce((a, b) =>
		Date.parse(b.updated_at ?? b.at ?? 0) > Date.parse(a.updated_at ?? a.at ?? 0) ? b : a).id;
}

const short_title = c => c.title ?? c.say ?? "(untitled)";
const children_of = (id, log) => log.cards.filter(c => c.parent === id);

// `.card`'s own status edge (framework.css, `--card-edge`) — set inline,
// per card, rather than a `v3-needs-you`/`v3-working`/`v3-done` class: the
// word already reserves the 3px and reads the colour straight off the
// element, so a class that just names the same three tokens again is one
// more thing to keep in sync with nothing to show for it.
const EDGE = { "needs-you": "var(--prim)", working: "var(--warn)", done: "var(--ok)" };
const edge_of = status => EDGE[status];

/** The owner's OWN card that this one answers — `re` names it. Read back by
    `detail()`'s "you said: …" block, one click down from the answer that
    replaced the owner's own row in the inbox (`master_detail()`'s own
    `by_recency()`, above, is what merges them). */
function heard_of(c, log) {
	return c.re ? log.cards.find(o => o.id === c.re) ?? null : null;
}

/** `text` up to its first full stop — the one extra line a card's face gets,
    "better visibility into what each thing is" without a whole paragraph. */
/**
 * ⚠ STRIPS MARKDOWN, because the body renders it and this does not (found live,
 * 2026-09-21): the moment card bodies started going through `md()`, every rail
 * preview began showing its source — "## In flight — 1 **[safe-rollout](/framework
 * /ai/…)** ·" where a sentence belonged. The body and the preview read the SAME
 * `c.text`, so anything the body learns to render, this has to learn to remove.
 *
 * Deliberately a small hand-rolled strip rather than `marked` + textContent: this
 * runs for every card in the rail on every redraw, and it only has to make one
 * line legible, not be a correct parser. Headings, list bullets, emphasis, inline
 * code and link syntax cover everything the board actually writes; a link keeps
 * its label and loses its url, which is the right half to keep in a preview.
 */
function strip_md(s) {
	return s
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")            // # heading
		.replace(/^\s{0,3}[-*+]\s+/gm, "")             // - bullet
		.replace(/^\s{0,3}\d+\.\s+/gm, "")             // 1. bullet
		.replace(/^\s{0,3}>\s?/gm, "")                 // > quote
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")     // [label](url) -> label
		.replace(/`{1,3}([^`]*)`{1,3}/g, "$1")         // `code`
		.replace(/(\*\*|__)(.*?)\1/g, "$2")            // **bold**
		.replace(/(\*|_)(.*?)\1/g, "$2")               // *italic*
		.replace(/^\s*[-*_]{3,}\s*$/gm, "")            // --- rule
		.trim();
}

function first_sentence(c) {
	const text = strip_md((c.text ?? "").trim());
	if (!text) return "";
	// The first NON-EMPTY line, not `split("\n")[0]` — stripping a leading
	// heading leaves the blank line that followed it, and the old form then
	// returned "" for any card that opened with one.
	const line = text.split("\n").map(l => l.trim()).find(Boolean) ?? "";
	const stop = line.indexOf(". ");
	return stop === -1 ? line : line.slice(0, stop + 1);
}

function ranked_of(cards, log) {
	const focus_id = newest_focus_id(log);
	return cards.map(c => ({ c, w: weight(c, log, focus_id) })).sort((a, b) => b.w - a.w).map(r => r.c);
}

function wall($wall, log, page, sort, verdicts, get_show_approved) {
	// The owner's own words are the log's business, not an idea card of their
	// own — they already fed every card's `weight` above. Nested cards show
	// only on their PARENT's own face/page, never loose on the wall too.
	// INBOX ZERO: an approved card leaves this list too, unless the head
	// row's "N approved" toggle is on (`ai/2026-09-19/inbox-zero/`).
	const every_card = log.cards.filter(c => author_of(c) !== "owner" && !c.parent);
	const top_level = get_show_approved() ? every_card : every_card.filter(c => !is_approved(c.id, verdicts));
	if (!every_card.length) return p.c("muted", "Nothing yet — the board is empty.");
	if (!top_level.length) return p.c("muted", "Nothing left to review — the count above brings approved cards back.");

	const newest = sort.get({ order: "weight" }).order === "newest";
	div.c("v3-sort flex v-center gap", () => {
		span.c("v3-sort-note muted", newest ? "sorted newest first"
			: "sorted by importance: needs you, then most discussed, then newest");
		button.c("v3-sort-toggle").text(newest ? "sort by importance" : "sort by newest").click(() => {
			sort.patch({ order: newest ? "weight" : "newest" });
			$wall.empty(() => wall($wall, log, page, sort, verdicts, get_show_approved));
		});
	});

	const ordered = newest
		? [...top_level].sort((a, b) => Date.parse(b.updated_at ?? b.at ?? 0) - Date.parse(a.updated_at ?? a.at ?? 0))
		: ranked_of(top_level, log);
	const top = newest ? new Set() : new Set(ordered.slice(0, 2).map(c => c.id));

	div.c("v3-cards grid gap", () => ordered.forEach(c => tile(c, top.has(c.id), log, page)));
}

function tile(c, big, log, page) {
	const kids = children_of(c.id, log);
	const sentence = first_sentence(c);
	a.c("card v3-tile" + (big ? " v3-tile-big" : ""))
		.style({ "--card-edge": edge_of(c.status) })
		.href(page.url + c.id + "/")
		.append(() => {
			if (c.icon) div.c("v3-tile-head flex v-center", () => icon(c.icon));
			div.c("v3-tile-title", short_title(c));
			if (sentence) div.c("v3-tile-sentence", sentence);
			if (kids.length) preview(kids, log);
			div.c("v3-tile-foot flex v-center", () => {
				span.c("v3-tile-author", author_label(author_of(c)));
				small.c("v3-tile-time", clock(c.updated_at ?? c.at));
			});
		});
}

/** Top three children by weight, one line each, "+N more" past that — the
    glance the owner asked a parent card to give without opening it. */
function preview(kids, log) {
	const ordered = ranked_of(kids, log);
	div.c("v3-preview flex v", () => {
		ordered.slice(0, 3).forEach(k => div.c("v3-preview-row flex v-center", () => {
			span.c("v3-preview-dot" + (k.status ? " v3-dot-" + k.status : ""));
			span.c("v3-preview-title", short_title(k));
		}));
		if (ordered.length > 3) div.c("v3-preview-more muted", `+${ordered.length - 3} more`);
	});
}

/** The right column's content — the DETAIL look: full text, links, demo/code,
    children, history. Never repeats a preview's own gist (no first-sentence
    line here) — `master_detail()` passes `{ skip_back: true }` because there
    is no "back" in a two-column layout, the inbox never left; the grid
    view's own click-through (`tile()` → `route(id)`, a real navigation) is
    the one caller that still wants the link, so it stays the default. */
function detail(c, log, page, verdicts, { skip_back = false, on_verdict } = {}) {
	// ⚠ Not a regex trim of `c.id` off `page.url` — an id can carry a regex
	// special character (`.`, `+`) and break the match silently. `page.url` is
	// always exactly `.../v/3/<id>/`, so dropping the last two segments (the
	// id, and the trailing empty string `split` gives an already-slash-ended
	// url) is exact, every time.
	const up = page.url.split("/").slice(0, -2).join("/") + "/";
	const mine = author_of(c) === "owner";
	const heard = heard_of(c, log);

	div.c("v3-detail card").style({ "--card-edge": edge_of(c.status) }).append(() => {
		if (!skip_back) a.c("v3-back flex v-center").href(up).append(() => { span("‹"); span("back to the wall"); });

		// The owner's own words this card answers — merged out of its own
		// row in the inbox (`master_detail()`'s `by_recency()`, above), read
		// back here so nothing is lost: one click down instead of a second
		// item beside this one.
		if (heard) div.c("v3-heard", () => {
			div.c("v3-heard-head flex v-center gap", () => { icon("mic"); span.c("muted", "you said, " + clock(heard.at)); });
			div.c("v3-heard-text", heard.text || heard.title || "");
		});

		div.c("v3-detail-head flex v-center", () => {
			if (c.icon) icon(c.icon);
			// Same rule as the inbox row (`row_of()`, above): the owner's own
			// title is only ever the first 90 characters of the text right
			// below it — showing both prints the owner's words twice.
			if (!mine) div.c("v3-detail-title", short_title(c));
			if (c.status) span.c("v3-status", status_word(c.status));
		});
		span.c("v3-time muted", author_label(author_of(c)) + " · " + clock(c.updated_at ?? c.at));

		/* FULL MARKDOWN, not one `p()` per line (the owner, 2026-09-21, having
		   put a whole answer in a card: "the markdown's not rendering properly
		   — or did you use the correct markdown helper?"). They had not: `p()`
		   reads backticks and nothing else, so inline code came out right while
		   headings, bold, lists and links all rendered as literal characters.
		   `md()` (`ext/markdown`) is the site's own renderer and a `div` is a
		   block tag, so it gets the full `marked.parse()` rather than the
		   inline-only path. ⚠ `md()` is `html_unsafe` by design — its own note
		   says the trust boundary is commit access and that markdown arriving
		   from a user needs revisiting. Board text is written by the assistant,
		   the mastermind and minions on a loopback-only dev server, so it sits
		   inside that boundary today; if this board ever serves a second person,
		   that is the line to re-read. */
		if (String(c.text ?? "").trim()) div.c("v3-detail-text").md(String(c.text));
		if (c.demo && DEMOS[c.demo]) demo(DEMOS[c.demo], c.caption ?? "");
		if (c.code) pre.c("v3-code", c.code);
		if (c.links?.length) div.c("v3-links flex wrap", () => c.links.forEach(l => a(l.label ?? l.url).href(l.url)));

		// RESURFACING'S OTHER HALF (item 6) — `see: "<card-id>"` embeds a
		// one-line preview of another card: icon, title, status, a link to
		// its own route. ⚠ Deliberately `BOARD` (`timeline.js`'s own stable
		// route prefix — the exact one `select()`'s own `history.pushState`
		// already uses), NOT the `up` variable computed above: `up` assumes
		// `page.url` ends in `.../v/3/<id>/`, true only for a COLD load of a
		// card's own route — inside `master_detail()` (where this embed
		// actually renders), `page` is always the bare `/v/3/` Page and
		// `page.url` never carries an id at all, so `up` would silently
		// strip a real path segment instead of a nonexistent one (found live
		// proving this: it produced `/v/…` instead of `/v/3/…`). Silently
		// skipped when the id names nothing on this board (a typo, or a card
		// from before this feature existed) — never a broken link.
		if (c.see) {
			const seen_card = log.cards.find(x => x.id === c.see);
			if (seen_card) a.c("v3-see flex v-center gap").href(BOARD + seen_card.id + "/").append(() => {
				if (seen_card.icon) icon(seen_card.icon);
				span.c("v3-see-title", short_title(seen_card));
				if (seen_card.status) span.c("v3-status", status_word(seen_card.status));
			});
		}

		// PROMPT CARDS (item 4, 2026-09-19: "every question I have for the
		// owner sits in a card they have to read and answer somewhere else —
		// this closes that loop"). `c.ask` is `say.mjs --ask`'s own shape
		// (`["yes","no"]` or `[{label,note}]`); `ask_controls()` (`./ask.js`)
		// is the reusable button/answer render `card-replies` already built
		// and proved against the real mastermind (13ms ack, 9.6s ring) — see
		// this task's own decision log for why that RPC beats a bare append.
		// Gated on `edit()` like every other write control here; NOT gated on
		// `mine` — an ask card is the system asking the OWNER something, so
		// it is never the owner's own card in practice, but nothing here
		// assumes that. Already-answered (`c.answer` set — the same merge
		// `CardAnswer.js` writes) shows the plain answer line instead of
		// buttons, so reloading the page or a live update never re-offers a
		// question that is already settled.
		if (Array.isArray(c.ask) && c.ask.length && edit()) {
			div.c("v3-ask-block").append(() => {
				if (c.answer) small.c("muted", `you answered: ${c.answer}`);
				else ask_controls(c, () => {});
			});
		}

		const kids = children_of(c.id, log);
		if (kids.length) div.c("v3-children", () => {
			div.c("v3-history-head muted", `${kids.length} inside`);
			div.c("v3-cards grid gap", () => ranked_of(kids, log).forEach(k => tile(k, false, log, page)));
		});

		const past = (log.history.get(c.id) ?? []).slice(0, -1);
		if (past.length) div.c("v3-history flex v", () => {
			div.c("v3-history-head muted", `${past.length} earlier update${past.length === 1 ? "" : "s"}`);
			past.forEach(h => div.c("v3-history-row muted", `${clock(h.at)} — ${h.title ?? h.say ?? h.text ?? ""}`));
		});

		// INBOX ZERO (`ai/2026-09-19/inbox-zero/`) — never on the owner's own
		// card: a verdict judges what the mastermind SAID, not what the owner
		// asked for. Off entirely when there is no dev socket to write through
		// (`edit()`), the same rule every editor control on the site follows.
		// An INELIGIBLE card (`eligible()`, top of this file) still gets its
		// whole story shown exactly as always — only the controls are
		// replaced with one plain sentence saying why there is nothing to
		// judge yet, so the absence reads as intentional, not broken.
		if (!mine && edit()) {
			if (can_judge(c)) verdict_controls(c, verdicts, on_verdict);
			else div.c("v3-verdict muted", ineligible_reason(c));
		}
	});
}

/** Why a card carries no Approve/Improve — one plain sentence, never a bare
    blank where a control used to be. */
function ineligible_reason(c) {
	if (c.status === "working") return "Still in progress — nothing finished yet to judge.";
	if (c.status === "needs-you") return "This is asking for your decision directly, not a verdict on finished work.";
	if (!c.status) return "No status yet, so nothing finished to judge — check back once it reports done.";
	return "Not eligible for a verdict.";
}

/**
 * Approve / Improve, right on the card's own detail — the inbox's whole
 * reason to exist. A press appends ONE line to `verdicts.jsonl` and changes
 * nothing on screen by itself (the day-audit page's own rule, copied here):
 * the line comes back over the live socket, `paint_count()` and
 * `by_recency()`/`wall()`'s own filters re-read it, and what is on screen is
 * always what is actually on disk. `on_verdict` — `master_detail()`'s own
 * `advance()` — is what actually moves the owner on to the next card; it
 * runs right away rather than waiting on that round trip, so "next" feels
 * instant even though the file write is still an honest network call.
 */
function verdict_controls(c, verdicts, on_verdict) {
	const $box = div.c("v3-verdict");
	draw();

	function draw() {
		const state = verdict_of(c.id, verdicts);
		$box.empty(() => {
			if (state?.say === "approve") {
				div.c("flex wrap v-center gap", () => {
					small.c("v3-verdict-state", () => { icon("check_circle"); span(" approved · " + clock(state.at)); });
					button("undo").attr("type", "button").click(() => send("reopen", ""));
				});
				return;
			}
			if (state?.say === "improve") {
				div.c("flex wrap v-center gap", () => {
					small.c("v3-verdict-state", () => { icon("flag"); span(" improve requested · " + clock(state.at)); });
					button("approve instead").attr("type", "button").click(() => send("approve", ""));
					button("change").attr("type", "button").click(note_box);
				});
				if (state.note) small.c("v3-verdict-note muted", `“${state.note}”`);
				return;
			}
			// SAY WHAT THE BUTTON WILL DO (approve-loop, 2026-09-20, the
			// owner: "I saw one approve button, but it wasn't really clear
			// what would happen if I click it") — one plain sentence, plus a
			// `title` on each button for the same answer on hover, so a
			// first-time reader never has to guess.
			div.c("v3-verdict-hint muted",
				"Approve marks this done and clears it from your inbox (undo brings it right back). Improve sends a one-sentence note to the mastermind and keeps this here.");
			div.c("flex wrap v-center gap", () => {
				button.c("prim").attr("type", "button")
					.attr("title", "Marks this done and removes it from your inbox. You can undo it right after.")
					.text("Approve").click(() => send("approve", ""));
				button("Improve").attr("type", "button")
					.attr("title", "Write one sentence saying what to change — it goes to the mastermind's inbox and this card stays here until it's fixed.")
					.click(note_box);
			});
		});
	}

	// Improve with no sentence tells nobody anything (the brief's own words) —
	// this is the one place a note is actually REQUIRED, not optional the way
	// day-audit's own note box leaves it.
	function note_box() {
		$box.empty(() => {
			const $t = textarea().attr("rows", "2").attr("placeholder", "What is wrong with it? One sentence is enough.");
			let $warn;
			div.c("flex wrap v-center gap", () => {
				button.c("prim").attr("type", "button").text("Send: improve").click(() => {
					const note = $t.el.value.trim();
					if (!note) {
						if (!$warn) $warn = small.c("v3-verdict-note muted", "Say what to improve first — the mastermind needs a sentence to act on.");
						return;
					}
					send("improve", note);
				});
				button("cancel").attr("type", "button").click(draw);
			});
		});
	}

	async function send(say, note) {
		// ⚠ NOT a bare "owner" literal — that was the actual bug a coordinator
		// review caught (2026-09-19): this button is real production UI (`edit()`
		// already gates it to a dev socket), but a hardcoded author has no way to
		// tell a genuine owner press from a script driving the same button
		// headless to prove it works, so every proof this task ran wrote fabricated
		// owner critiques into a permanent, append-only file. `window.$VERDICT_AUTHOR`
		// is the same shape as `window.$BLOCKRELOAD` (`v/new.js`) — a page-global
		// escape hatch nothing but a test script ever sets — so a real click in a
		// real browser still writes "owner" (the default), and driving this same
		// control through `ui-test`/Playwright can set it to the driver's own name
		// first and get an honest record instead. `write_verdict()` (module-level,
		// above `Verdicts`) is the one place that builds this line now — the
		// toast's own Undo (approve-loop, 2026-09-20) writes through the exact
		// same function, so there is only ever one way a verdict gets written.
		const ok = await write_verdict(c.id, say, note);
		if (!ok) { $box.empty(() => small.c("muted", "The dev server would not take that — is it running?")); return; }
		if (say === "improve" && note) {
			const delivered = await relay_to_mastermind(`Improve on "${short_title(c)}" (${c.id}): ${note}`);
			if (!delivered) console.warn("inbox-zero: no open mastermind run right now — the note is saved on the card but was not relayed.");
		}
		on_verdict?.(say, note);
	}
}
