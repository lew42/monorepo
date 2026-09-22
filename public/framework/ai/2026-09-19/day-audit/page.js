import { Page, div, p, h2, h3, span, small, strong, button, a, textarea, details, summary, table, thead, tbody, tr, th, td } from "/app.js";
import { icon } from "/framework/core/View/View.js";
import { JSONL } from "/framework/ext/JSONL/JSONL.js";
import { edit } from "/framework/ext/Ask/edit.js";
import Socket from "/framework/dev/Socket/Socket.js";

/**
 * What you asked for on 2026-09-19, beside what was actually done about it.
 *
 * TWO FILES, both append-only, both read the same way the AI board reads its own:
 *
 *   audit.jsonl      one `{"card": {...}}` line per request you made today — your
 *                    own words, what was done, and a verdict judged against YOUR
 *                    sentence rather than against the task's own landing report.
 *   approvals.jsonl  one more `{"card": {"id": <the same id>, "approval": …}}` line
 *                    every time you press Approve or Needs work. NOTHING is ever
 *                    rewritten: the newest line naming an id wins, exactly the rule
 *                    `ai/v/3/timeline.js` already uses for the board. That is why an
 *                    approval survives a reload, and why the next agent can read your
 *                    decisions by parsing one small file.
 *
 * THE WRITE PATH is the dev server's own `rpc:append`
 * (`Server/plugins/SocketServer/Append.js`): one line, appended with "a", so two
 * writers interleave between lines and never inside one. The six lines below are a
 * copy of `ext/Ask/reply.js`'s `append()`/`stamp()` rather than an import of it —
 * that module also pulls in Dictate and the markdown renderer, and on 2026-09-19 an
 * import chain exactly like that (a shared `compose.js`) blanked the whole live site
 * for 80 seconds. A page that has to keep working while the site is being edited
 * carries its own six lines.
 *
 * Off localhost there is no dev socket, so `edit()` is false and the buttons simply
 * do not render — the page still reads perfectly, it just cannot be answered.
 */

/* The board's own merge-by-id, copied because `ai/v/3/timeline.js` is another
   realm's page module and imports flow DOWN, never sideways. Every merge REPLACES
   the slot with a new object rather than mutating it, the same reason the board
   does: a renderer asks "is this the object I drew last time" to decide whether to
   touch the DOM at all. */
class Cards extends JSONL {
	static verbs = [...JSONL.verbs, "card"];
	cards = [];
	card(value) {
		const i = value.id != null ? this.cards.findIndex(c => c.id === value.id) : -1;
		if (i === -1) this.cards.push(value); else this.cards[i] = { ...this.cards[i], ...value };
	}
	reset() { this.cards = []; return super.reset(); }
}

const APPROVALS = "/framework/ai/2026-09-19/day-audit/approvals.jsonl";

/** An ISO stamp carrying THIS machine's offset — `toISOString()` would move it to UTC. */
function stamp() {
	const d = new Date(), off = -d.getTimezoneOffset(), pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())
		+ "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds())
		+ (off < 0 ? "-" : "+") + pad(off / 60) + ":" + pad(off % 60);
}

/** One whole line into a .jsonl under public/, through the dev socket. True when it took. */
async function append(url, line) {
	const answer = await Promise.race([
		Socket.singleton().async_rpc("append", url, [JSON.stringify(line)]),
		new Promise(done => setTimeout(done, 4000, null)),
	]);
	if (answer?.response === "append successful") return true;
	console.error("day-audit: the dev server refused the append", answer);
	return false;
}

const VERDICT = {
	done: { word: "done as asked", color: "var(--ok, #2e7d32)" },
	differs: { word: "done, but differs", color: "var(--warn, #b26a00)" },
	partly: { word: "partly", color: "var(--warn, #b26a00)" },
	not: { word: "not done", color: "var(--bad, #b3261e)" },
};

const clock = at => at ? new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

export default new Page({
	meta: import.meta,
	title: "Audit of today",
	icon: "fact_check",
	description: "Every request you made on 2026-09-19 beside what was really done about it, with Approve and Needs work on each one.",

	content() {
		const audit = new Cards({ url: import.meta.resolve("./audit.jsonl") });
		const approvals = new Cards({ url: import.meta.resolve("./approvals.jsonl") });

		// ⚠ No DOM after an await. Every box on the page is built NOW, in reading
		//   order, and only FILLED IN once the two files have arrived.
		let $top, $eye, $all;
		div.c("flow").append(() => {
			$top = div.c("flow", () => p.c("muted", "Reading the day…"));
			h2("Needs your eye");
			$eye = div.c("flex v gap");
			h2("Every request");
			p.c("muted", "Grouped by verdict, worst first. Open one to see your own words beside what was reported.");
			$all = div.c("flex v gap");
			h2("Where this data lives, and what to split");
			data_section();
			h2("The Live toggle, and how new cards really arrive");
			live_section();
		});

		/* An approvals line arriving over the socket must NOT rebuild the page — that
		   would throw away your scroll and close anything you had open. Each item
		   registers its own two-button row here, and a tick redraws only those.
		   ⚠ A LIST per id, not one entry: the five flagged items are drawn TWICE (up
		   top and again in their group), and a plain Map would leave the first copy
		   showing stale buttons forever. */
		const rows = [];
		const repaint_rows = () => rows.forEach(redraw => redraw());

		audit.load()
			.then(() => { paint(); return approvals.live(repaint_rows); })
			.then(repaint_rows)
			.catch(e => console.error("day-audit: could not read the logs", e));

		function approval_of(id) { return approvals.cards.find(c => c.id === id) || {}; }

		function paint() {
			const items = audit.cards.slice().sort((a, b) => (a.at < b.at ? -1 : 1));
			if (!items.length) return;
			const n = v => items.filter(i => i.verdict === v).length;

			$top.empty(() => {
				p(`You asked for ${items.length} things today. ${n("done")} were done the way you said them. `
					+ `${items.length - n("done")} were not — ${n("partly")} partly, ${n("differs")} done but different from what you said, `
					+ `and ${n("not")} not started at all.`);
				p("A verdict here is judged against YOUR sentence, not against the report the task wrote about itself. "
					+ "Five of them are worth your eye right now; everything else is one click down.");

				div.c("grid auto gap").append(() => {
					["done", "partly", "differs", "not"].forEach(v => {
						div.c("card").style({ "--card-edge": VERDICT[v].color }).append(() => {
							h3(String(n(v)));
							small(VERDICT[v].word);
						});
					});
				});
			});

			const flagged = items.filter(i => i.flag).sort((a, b) => a.flag - b.flag).slice(0, 5);
			$eye.empty(() => flagged.forEach(c => item_card(c)));

			$all.empty(() => {
				["not", "partly", "differs", "done"].forEach(v => {
					const group = items.filter(i => i.verdict === v);
					if (!group.length) return;
					details.c("card").append(() => {
						summary(`${VERDICT[v].word} — ${group.length}`);
						div.c("flex v gap").append(() => group.forEach(c => item_card(c)));
					});
				});
			});
		}

		/* One request. The face says: what you asked, the verdict, and why in plain
		   words. Your own words, the mastermind's own conclusion and the links sit
		   one click down, so the list stays scannable. */
		function item_card(c) {
			const v = VERDICT[c.verdict];
			div.c("card").style({ "--card-edge": v.color }).append(() => {
				div.c("flex wrap v-center gap").append(() => {
					strong(c.title);
					span.c("flex-1");
					small.c("muted", `${v.word} · ${clock(c.at)} · ${c.topic}`);
				});
				p(c.why);
				if (c.needs) p.c("muted", () => { icon("pending_actions"); span(" " + c.needs); });

				details().append(() => {
					summary.c("muted", "your words, what was reported, and where to look");
					if (c.said) div.c("card size-small").append(() => {
						small.c("muted", `you, at ${clock(c.said_at)}`);
						p(c.said);
					});
					if (c.done) p(() => { strong("reported: "); span(c.done); });
					p.c("muted", `the record calls this "${c.reported}" — ${c.tasks.length ? "task: " + c.tasks.join(", ") : "no task of its own"}`);
					if (c.links?.length) div.c("flex wrap gap").append(() => c.links.forEach(l => a(l.label || l.url).href(l.url)));
				});

				if (edit()) approve_row(c);
				else small.c("muted", "The dev socket is off, so the buttons are hidden — this page is read-only right now.");
			});
		}

		/* Approve / Needs work. A press appends ONE line and changes nothing on screen
		   by itself: the line comes back over the socket, merges onto this item by its
		   id, and `draw()` re-reads it from the file — so what you see is always what
		   is actually on disk, never an optimistic guess. */
		function approve_row(c) {
			const $row = div.c("flex wrap v-center gap");
			rows.push(draw);
			draw();

			function draw() {
				const state = approval_of(c.id);
				$row.empty(() => {
					if (state.approval) {
						const good = state.approval === "approved";
						small(() => {
							icon(good ? "check_circle" : "error");
							span(` ${good ? "approved" : "needs work"} · ${clock(state.approved_at)}`);
						});
						if (state.note) small.c("muted", `“${state.note}”`);
						button("change").click(() => note_box(state.approval));
						return;
					}
					button("Approve").click(() => send("approved", ""));
					button("Needs work").click(() => note_box("needs-work"));
				});
			}

			function note_box(which) {
				$row.empty(() => {
					const $t = textarea().attr("rows", "2")
						.attr("placeholder", which === "approved" ? "Anything to add? (optional)" : "What is wrong with it? (optional)");
					div.c("flex wrap gap").append(() => {
						button(which === "approved" ? "Send: approved" : "Send: needs work")
							.click(() => send(which, $t.el.value.trim()));
						button(which === "approved" ? "switch to needs work" : "switch to approve")
							.click(() => note_box(which === "approved" ? "needs-work" : "approved"));
						button("cancel").click(draw);
					});
				});
			}

			async function send(approval, note) {
				const line = { card: { id: c.id, approval, approved_at: stamp(), author: "owner" } };
				if (note) line.card.note = note;
				const ok = await append(APPROVALS, line);
				// A refused append leaves the file alone, so nothing would change and it
				// would look as if the click did nothing. Say so instead.
				if (!ok) $row.empty(() => small.c("muted", "The dev server would not take that — is it running?"));
			}
		}
	},
});

/* ── Deliverable 3: the measurement, and one recommendation with its number ──── */
function data_section() {
	p("Every AI page reads plain append-only text files — one JSON object per line. "
		+ "Nothing is a database, and nothing is ever rewritten in place.");

	div().style("overflow-x", "auto").append(() => {
		table().append(() => {
			thead(() => tr(() => ["file", "size today", "grows by", "who writes it", "how the page loads it"].forEach(h => th(h))));
			tbody(() => [
				["ai/v/3/board.jsonl", "155 KB · 270 lines", "~60 KB an hour while you dictate", "the assistant, the mastermind, every minion", "fetched once, then streamed line by line over the socket"],
				["2026-09-17/mastermind-…/task.jsonl", "393 KB · 804 lines", "~130 KB a day, and it never closes", "the mastermind", "fetched once by its task page"],
				["2026-09-19/day.jsonl", "13 KB · 45 lines", "one line per task event", "every task, on opening and landing", "fetched once by the day dashboard"],
				["2026-09-19/<task>/task.jsonl", "304 KB across 26 files (largest 32 KB)", "bounded — a task ends", "that one task", "fetched once, then streamed"],
				["ai/usage.jsonl", "79 KB · 579 lines", "one small line per usage check", "whoever checks usage", "fetched once"],
			].forEach(row => tr(() => row.forEach(cell => td(cell)))));
		});
	});

	p(() => {
		strong("Today's folder is 6 MB, and that is not the logs. ");
		span("5.1 MB of it is screenshots (.png). The text logs across the whole day come to 324 KB.");
	});

	details.c("card").append(() => {
		summary("The measurement: how long parsing actually takes");
		p("The real board was parsed and merged by id at 1×, 10×, 100× and 400× its size, in the same "
			+ "way the page does it:");
		div().style("overflow-x", "auto").append(() => table().append(() => {
			thead(() => tr(() => ["size", "lines", "parse + merge"].forEach(h => th(h))));
			tbody(() => [["155 KB (today)", "270", "0.4 ms"], ["1.5 MB", "2,700", "3.3 ms"], ["15.5 MB", "27,000", "27.8 ms"], ["62 MB", "108,000", "110 ms"]]
				.forEach(r => tr(() => r.forEach(c => td(c)))));
		}));
		p("So parsing is not the thing that will ever hurt. A person starts to feel a pause at about "
			+ "100 ms of blocked work, and this only reaches that at 62 MB — roughly four months of "
			+ "days like today, in one file.");
	});

	div.c("card").style({ "--card-edge": "var(--prim)" }).append(() => {
		h3("The recommendation");
		p(() => {
			strong("Split the board into one file per day, and have the page load today and yesterday. ");
			span("The number to hold on to is 5 MB per file. Below that nobody can feel the difference; "
				+ "at 5 MB the download itself, not the parsing, becomes the first thing you would notice.");
		});
		p("At today's rate — 155 KB in two and a half hours of heavy dictation, so about half a megabyte "
			+ "on a full day — a per-day board never gets close to 5 MB, and a single un-split board would "
			+ "take roughly ten working days to reach it. You said you do not mind loading a whole day even "
			+ "at many megabytes, and the measurement agrees with you: loading a whole day is free.");
		p(() => {
			strong("The one file genuinely growing without a bound is the mastermind's own ledger. ");
			span("It is 393 KB over three days because a \"run\" has no end — it is not per-day at all. "
				+ "Either give it the same per-day split, or close a run each day. That matters more than the board.");
		});
		p(() => {
			strong("The catch, said plainly: ");
			span("a card written today and updated tomorrow has its two lines in two different files, and the "
				+ "merge is only complete if both are loaded. That is exactly why the default is today plus "
				+ "yesterday, not today alone.");
		});
		p(() => {
			strong("The alternative I did not take: ");
			span("one state.json per day, rewritten in place. It is simpler to read, but it throws away the "
				+ "history of how a card changed, and two writers saving at the same moment overwrite each "
				+ "other — which append-only cannot do. Since parsing was never the cost, there is nothing "
				+ "to gain in exchange.");
		});
	});
}

/* ── Deliverable 4: where the Live toggle stands, and the stream-vs-reload answer ─ */
function live_section() {
	div.c("card").style({ "--card-edge": "var(--bad, #b3261e)" }).append(() => {
		h3("The Live toggle does not exist yet, and nobody was sent to build it");
		p("You asked for it at 17:10 — a toggle near the top that makes the view follow new items "
			+ "automatically. It is written down in full: item 7 of "
			+ "ai/2026-09-19/v3-timeline/requirements.md, which also holds the timeline grid, the "
			+ "pinned strip for things needing you, and the head row becoming the toolbar you asked for twice.");
		p(() => {
			strong("That brief has no task log at all. ");
			span("Every task that an agent actually starts writes a task.jsonl the moment it begins. "
				+ "This one has requirements.md and nothing else, which means the brief was written and "
				+ "never handed to anybody.");
		});
		a("the brief that was never dispatched").href("/framework/ai/2026-09-19/v3-timeline/");
	});

	div.c("card").style({ "--card-edge": "var(--ok, #2e7d32)" }).append(() => {
		h3("New cards arrive over the socket. There is no reload involved.");
		p("You were not sure which it was. It is the socket, and the proof is one line of the dev server:");
		p(() => small.c("code", "LiveReload.js, line 138:  if (file.endsWith(\".jsonl\")) return Tail.changed(file);"));
		p("In plain words: when any .jsonl file changes, the server does NOT put the page on the reload "
			+ "queue like it does for every other file. It sends only the new bytes down the open socket, "
			+ "and the page appends them to what it already has. Nothing is re-downloaded and nothing "
			+ "re-renders from scratch.");

		details().append(() => {
			summary("the proof, run headless on a private server");
			p("A headless browser opened a page on a private dev server, and a marker value was set in "
				+ "the page's memory — a value that can only survive if the page is never re-created. "
				+ "Then one line was appended to a .jsonl the page had open, and then, as a control, one "
				+ "ordinary file was written.");
			div().style("overflow-x", "auto").append(() => table().append(() => {
				thead(() => tr(() => ["what changed", "page navigated?", "marker survived?"].forEach(h => th(h))));
				tbody(() => [
					[".jsonl — one appended line", "no", "yes — same page, never reloaded"],
					["a .css file written", "yes", "no — the page was reloaded, as it should be"],
				].forEach(r => tr(() => r.forEach(c => td(c)))));
			}));
			p("So the mechanism is already exactly what you described: an append-only stream the browser "
				+ "receives a line at a time. What is missing is only the toggle that decides whether the "
				+ "VIEW follows the newest arrival, which is the item above.");
		});
	});

	div.c("card").append(() => {
		h3("The same mechanism is what makes the buttons on this page persist");
		p("Pressing Approve appends one line to approvals.jsonl. The server takes the line, the socket "
			+ "hands it straight back to this page, and the page merges it onto the matching item by its "
			+ "id — the identical rule the AI board already uses to update a card in place. Reload and it "
			+ "is still there, because it was on disk before it was on screen; another agent can read your "
			+ "decisions by parsing one small file.");
		p(() => {
			strong("To put these buttons on every board card, nothing new has to be invented. ");
			span("The board already merges by id, and the card-replies task landed at 17:34 with the other "
				+ "half: a card carrying ask: [\"yes\",\"no\"] draws real buttons and a press reaches a live "
				+ "Claude session in about ten seconds.");
		});
		a("card-replies — try the buttons").href("/framework/ai/2026-09-19/card-replies/");
	});
}
