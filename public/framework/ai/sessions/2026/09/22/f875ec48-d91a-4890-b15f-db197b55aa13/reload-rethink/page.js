import { Page, md, div, p, b, span, details, summary } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid.
   2 SIZE       prose at the default measure; the two bars claim `wide`.
   3 OWN LAYOUT the answer in one paragraph, the two bars that prove it, the four
                things a change can now do, then every detail behind a fold.
   4 REGIONS    none.  5 PREVIEW  core's default card. */

// One bar of the before/after picture. Width is the share of 215, so the two
// bars are honestly to scale against each other and nothing has to be read.
function bar(label, n, colour, note){
	div.c("flex v", () => {
		div.c("flex v-center gap", () => {
			span.c("muted", label);
			b(`${n}`);
			span.c("muted", "reloads");
		});
		// ⚠ `div.style(…)` throws — a bare factory chains `.c()` and nothing else, so
		// the element has to exist as a View first. (code skill, §7.)
		div().style({ background: "var(--wash)", "border-radius": "var(--radius)", height: "1.6em", overflow: "hidden" })
			.append(() => { div().style({ background: colour, width: `${(n / 215) * 100}%`, height: "100%" }); });
		span.c("muted", note);
	});
}

export default new Page({
	meta: import.meta,
	title: "Reload rethink",
	description: "A tab now reloads only when something it RUNS changed. On one measured day that turned 215 reloads into 12.",
	icon: "sync_problem",

	content(){

		p("You left a tab open on the AI board and it kept reloading under you, losing your scroll position, while agents worked on files you were not even looking at. ", b("It was reloading for the wrong reason."), " On 2026-09-22 that tab reloaded 215 times — and 203 of those, ", b("94% of them"), ", were one file: `directory.json`, the list of what is on disk. The board had ", b("read"), " that file. Nothing it was ", b("running"), " had changed at all.");

		p("A file a page reads is ", b("content"), ". A file a page runs is ", b("code"), ". Only the second one can need a reload — after a content change the program in your browser is byte-for-byte the same, so re-reading the file is the whole fix. The socket now tells the page instead of reloading it, and the page re-reads the file in place. A new task directory appears on the board without the page moving.");

		div.c("flex v gap wide", () => {
			bar("Before — the day as measured", 215, "var(--warn)", "203 of them were directory.json being rebuilt because an agent created a file somewhere under public/.");
			bar("After — the same day's changes", 12, "var(--prim)", "the ones where a module the tab had actually loaded and run really did change.");
		}).style({ "margin-block": "var(--gap)" });

		p.c("muted", "Proved on this day board, headless: creating a task directory now moves it from \"Proposed — 2 not started\" to \"3\" in 653ms with a navigation count of 0. It used to be a full page reload.");

		md("## What a changed file does now\n\nFour outcomes, cheapest first. The tab decides, not the server — it is the only one that knows what it loaded.\n\n" +
			"| the tab | the file | what happens |\n|---|---|---|\n" +
			"| never loaded it | anything | **nothing** — most changes, most of the time |\n" +
			"| loaded it as a stylesheet | `.css` | **hot-swap** — the new CSS paints, no reload |\n" +
			"| **read** it | `.json` `.jsonl` `.md` `.txt` `.csv` | **a `data` event** — the page re-reads the file itself |\n" +
			"| **runs** it | `.js` | **a reload** — and it keeps your place |\n").ac("wide");

		md("## So do we even need live reload?\n\n**Yes — for exactly one case, and that case cannot be removed without a build step.** A changed JavaScript module is already running in your browser, with its closures and its event listeners live, and a browser cannot re-import a module over the old one. Re-importing with a cache-busting `?t=` gives you a *second* copy running beside the first, which is worse than a reload. Faking that properly is hot module replacement, and it is most of what a bundler's dev server is for; this site has no build step on purpose.\n\nSo: **keep live reload, and stop calling it for things that are not code.** Everything else was already solved and simply was not being used.");

		md("## And the hold no longer holds *your* page\n\nYou saw this one yourself: your dev bar said **\"held by board-declutter, 220 seconds\"** and your own save did not reload your own tab. That was backwards — a hold exists so an agent's half-written batch does not flash *you*, never to stop you seeing your own work.\n\n**A hold is a fence now, not a switch.** An agent says what it is writing (`--paths \"public/framework/ai/v/3/**\"`) and only those files are held; everything else keeps reloading normally, for everyone. Proved with that exact hold on: a tab on `/framework/ai2/` reloaded **540ms** after its file changed, while a change under `ai/v/3/` reached **no tab at all** until the hold came off. An agent that names no fence gets the boards only, and a warning with its name on it.\n\nThe readout says **what** is held now — \"board-declutter holds ai/v/3/\\*\\*, 220s\" — which reads as *and nothing else of yours*, the fact that was missing.");

		md("## Two more things, now that it reloads less\n\n**It keeps your place.** Before reloading, the tab writes down your scroll, your open `<details>` and the text you were typing, and puts them back. Proved on this day board: scrolled 1,500px into a 5,444px page, touched a running module, and it landed at **1,500px — 0px out**.\n\n**And there is a pause switch that is yours.** The dev bar's **block** checkbox (Ctrl + \\\\) holds reloads in *that tab only*, is remembered for the life of the tab, and shows a count — \"3 held\" — of what it refused; clicking the count takes them in one reload. That is the *reader's* switch. The **hold** beside it is the *writer's* — what an agent takes before a batch of writes.");

		this.detail();
	},

	/* Everything below is one click down, on purpose — the answer above is the page.
	   CLAUDE.md: detail nests, it is never deleted and never sits on the first screen. */
	detail(){
		div.c("wide flow", () => {
			this.fold("The fence, in full — how a scoped hold works", () =>
				md("**The language.** `--paths` takes comma- or space-separated globs, written the way an agent thinks about its own fence — repo-relative, `public/framework/ai/v/3/**`. On the wire a path is a url-path, `/framework/ai/v/3/v3.css`; `hold.mjs`'s `normalise()` is what makes those the same thing. `**` matches anything including `/`; `*` stops at a `/`; a pattern with **no wildcard at all is a directory prefix**, because that is plainly what someone typing `--paths public/framework/ai/v/3` means. The rules live in exactly one function, `matches()` — two implementations that disagreed would hold the wrong files and nothing would throw.\n\n**⚠ Quote the globs.** Unquoted, bash expands `**` before node ever sees it. The fence still works (it arrives as a list of real files) but it is not what you wrote, and bash's `**` is not the same as this one's.\n\n**The partition.** `LiveReload.flush()` used to open with `if (held) return;`. It now splits its queue on every pass: a path inside some live holder's fence stays queued, everything else goes out at once. A holder narrowing its fence, or one of three dropping out, re-flushes immediately rather than waiting for the next unrelated write.\n\n**Renewing cannot widen you.** The `hold-guard` hook renews a lapsed hold by calling `add(who, what, ttl)` with no paths, so `add()` keeps the fence the holder already had. A hold quietly getting *bigger* while nobody is looking is the same class of bug as the global hold was.\n\n**The default is deliberately narrow.** No `--paths` means `public/framework/ai/**` — the boards, where agents really do write in bulk — and a warning naming the holder. It does not cover the rest of the site, so your own editing is never affected by an agent that forgot."));

			this.fold("The scroll trap, and the switch in full", () =>
				md("**`window.scrollY` is always 0 on this site.** The document never scrolls — a `.pages` box inside the app shell does, and pages nest so there are several of them; the first one a selector finds is the app shell's, 900px tall and not scrollable at all. Stashing `scrollY` would have restored nothing while looking like it worked, so `stash()` walks every element for a real `scrollTop` instead of naming one. `?view=` and any `#hash` need nothing — the url survives a reload by itself.\n\n**Why the pause switch has to show a count.** A switch that silently swallows reloads reads as \"the site has stopped updating\" ten minutes later, and there is no way to tell those apart from the page. The count says how many were refused; clicking it takes them.\n\n**Why it is remembered per tab.** `window.$BLOCKRELOAD` alone was the whole switch before, which meant the very first reload it failed to stop also erased it — a block that \"wasn't working\" was usually a block that had already been wiped. It lives in `sessionStorage` now, which is exactly a tab's lifetime, and `Socket` restores it at boot before anything can reload the page.\n\n**It is not the hold.** `Server/hold.mjs` is the *writer's*: an agent takes it before a batch of writes so every tab on every server gets one reload instead of twenty. The block switch is the *reader's*: one tab, yours, and no agent can take it or drop it."));

			this.fold("The census — how 215 was counted", () =>
				md("Nothing captures the dev server's stdout, so today's reloads were reconstructed from what survives on disk: the modify time of every file under `public/` (a write is a `change` event) and the birth time of every file and directory (a create is a `rename` event, which is what rebuilds `directory.json`). The reconstruction replays the server's own rules exactly — `Server/watch.js`'s ignore list, `LiveReload`'s 300ms debounce, `Directory.js`'s 100ms one.\n\n" +
					"| measured on 2026-09-22 | |\n|---|---|\n" +
					"| files written under `public/` | 201 |\n" +
					"| …of those, `.jsonl` (streamed, never a reload) | 36 |\n" +
					"| …of those, queued for a broadcast | 165 |\n" +
					"| broadcast batches after the 300ms debounce | 147 |\n" +
					"| files and directories **created** | 241 |\n" +
					"| `directory.json` rebuilds those collapsed into | 203 |\n" +
					"| task directories created in `ai/2026-09-22/` | 25 |\n\n" +
					"**The gap between 25 and 203 is the whole finding.** Twenty-five task directories were created today, but `directory.json` rebuilt 203 times, because `Directory.js` rebuilds on *every* file appearing anywhere under `public/` — a directory, a `requirements.md`, a `task.jsonl`, a screenshot. Each rebuild broadcast both manifest paths; every AI-board tab had fetched one; a fetched path counted as not-swappable; not-swappable meant reload.\n\n" +
					"The three causes, with counts: **203** `directory.json` rebuilt · **6** a `core/` or `ext/` module the tab imported really changed · **4** the AI board's own `page.js` and `v/3/` files. Twelve of 215 had a cause a reload could fix.\n\n" +
					"So that the next person does not have to reconstruct it: `LiveReload.flush()` now logs one line per broadcast — `[reload] 3 paths /a.js /b.css /c.js → 2 sockets told` — capped at three paths so a `git checkout` batch of hundreds cannot bury it. `told` is sockets actually sent to, not sockets connected: a socket that wrote the file itself is muted and hears nothing."));

			this.fold("Worktrees never reach you — proved with a real one", () =>
				md("`Server/worktree-up.mjs <name>` puts a second checkout at `C:/Code/lew42/worktrees/<name>`, **outside this repo**, with its own server on its own port. The watcher each server runs is `fs.watch` on `path.resolve(\"public\")` — relative to the directory that server was started in — so a file changed inside a worktree is not inside the main server's watched tree at all.\n\nProved rather than argued: two raw websockets, one to each server, counting `changed` frames. A control touch in the main tree, to show that wire was live, then a real edit inside the worktree.\n\n**Zero** paths from inside the worktree ever appeared on the main server's wire — and this was not a silent wire, which is the failure mode that would have made the test worthless: during the same four seconds the main server broadcast four paths from *another agent working live* (`ux/Dictate/Dictate.js` and both `directory.json` files). The worktree's own server saw its own change immediately."));

			this.fold("The alternative that was not picked", () =>
				md("**Rebuild `directory.json` less often, on the server side.** `Directory.js` could rebuild only when a directory appears rather than on every file, or only for paths under `ai/`, and that would have cut the 203 down a long way with a much smaller change.\n\nIt was not picked because it fixes one symptom and leaves the rule wrong. `directory.json` would still be *data* that reloads a tab, just less often; `usage.json`, `board.jsonl`, a fetched `.md` and every future data file would all still reload pages that merely read them; and the debounce would have to be re-tuned every time the write pattern changed. Teaching the tab the difference between a file it reads and a file it runs fixes the class, once, and leaves the server free to rebuild as eagerly as it likes. The server-side debounce is still available on top of this if rebuild cost ever becomes the problem — it is a performance question now, not a correctness one."));

			this.fold("What still cannot be restored across a reload", () =>
				md("A fold whose body is **built on first click** — `ext/AITask`'s `fold()` works this way — cannot be reopened from the DOM alone. Re-adding its `open` class after a reload would show an open, empty box, which is worse than a shut one, and an opt-in attribute would have exactly the same problem. Native `<details>` is safe, because its content is always in the DOM, so that is what is restored.\n\nA module with lazily-built state has to remember it itself. That is a real limit and it is written beside the code in `dev/Socket/Socket.js` rather than left to be rediscovered. It also matters much less than it would have: the boards that carry those folds now mostly do not reload at all."));

			this.fold("Two dev-bar readouts that were built and never switched on", () =>
				md("`dev/DevBar/hold.js` — the \"held by <who>, 12s\" readout built for [reload-hold](/framework/ai/2026-09-19/reload-hold/) — was never called from anywhere. Nothing in the repo imported it, so in the three days since it was written it had never once appeared on screen. It is wired into the dev bar's head line now, beside the block switch.\n\n`public/framework/ai/health/devbar.js` has the same problem: its own header says it belongs \"beside `hold()` in `DevBar.js`'s own head-line row\", and that call was never added either. One line would light it. Left for whoever owns `ai/health/` rather than quietly changed here.\n\nThe lesson worth keeping: a function whose only caller would be one line in someone else's file is not finished until that line exists. Neither of these would ever have thrown."));

			this.fold("A trap this run hit: the reload hold is global, and a sibling can starve you", () =>
				md("`Server/hold.mjs`'s lock file is read by **every** server watching this tree, so while any agent holds it, no broadcast reaches any tab anywhere. The first run of this task's own proofs failed four ways — no reload, no data event, no count — purely because another minion was mid-batch. There was no error and nothing in the output said so; the proofs simply observed a silent wire and reported what they saw.\n\nThe proof scripts now wait for the hold to clear before each phase and say who they are waiting for. Anything that measures the reload wire has to do the same, or it will eventually record a confident, wrong zero."));
		});
	},

	// A fold that is a real <details>, so the reload-state restore above can put it
	// back — which is the whole point being demonstrated.
	fold(title, fn){
		return details.c("card", () => { summary(title); div.c("flow", fn); });
	},
});
