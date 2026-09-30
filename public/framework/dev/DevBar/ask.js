import { div, span, button, icon } from "../../core/View/View.js";
import { TaskJSONL } from "../../ext/JSONL/JSONL.js";
import { threads } from "../../ext/drawer/tabs/sessions.js";
import { available, thread } from "../../ext/Ask/Ask.js";
import { chat } from "../../ext/Ask/chat.js";
import mount_chat from "../../ux/Dictate/chat.js";
import { settings, set } from "./settings.js";
import { section } from "./parts.js";

/**
 * THE DEV BAR'S CHAT MODE, v2 (minion-polish, item 7, 2026-09-30 — the brief:
 * "mounts `chat()` instead of its own chat, keeps the old one reachable as a
 * v1"). `askV1`, below, is the OLD tab: a per-PAGE thread picker (a dir under
 * `<page>ai/<slug>/`, its own `task.jsonl`) built on `ext/Ask/chat.js`'s own
 * composer — a THIRD chat surface, separate from the mobile ✦ sheet and the
 * ☰ drawer's AI tab, on its own private session with no mic. This is the SAME
 * `mount_chat` (`ux/Dictate/chat.js`) those two already build: the one global
 * voice session, in `sessionStorage`, picked up wherever it is opened
 * (CLAUDE.md law 6 — "one of everything"). The named-thread picker (multiple
 * saved conversations per page) is a real feature `askV1` had and this does
 * not try to rebuild — "less is more, fastest working version first": one
 * global chat here matches every other surface, and a reader who wants a
 * named, resumable thread already has one on the ☰ drawer's own Sessions tab.
 * Swap `ask` for `askV1` in `tools.js`'s own import to bring the old tab back.
 */
export default function ask(app){
	const url = app?.router?.active?.url ?? location.pathname;
	section("ai", () => {
		div.c("dev-ai flex v", () => {
			mount_chat(div.c("dev-ai-panel").el, { path: url, placeholder: "Ask about this page…" });
		});
	});
}

/* What the owner has selected, handed to the turn as context. Read straight off the DOM,
   so nothing here imports ext/Panel or ext/layout and a page that has neither still gets
   the text half: a workspace marks its selected panel `.focus`, a layout demo's selection
   is `.layout-selected` (`layout.selected()`, ext/layout/panel.js), and a selected run of
   text is `.panel-text-on` (`panel-focus` / `panel-text` are the same facts as events).

   ⚠ The text is REMEMBERED, not read on send: clicking into the chat box collapses the
   very selection you were about to ask about. Used by `askV1` only — `ask()`'s new
   `mount_chat` above has no `context` hook yet (a gap this task leaves named, not closed:
   `readme.md`). */
let picked = "";
document.addEventListener("selectionchange", () => {
	const text = String(window.getSelection() ?? "").trim();
	if (text) picked = text;
});

const where = el => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : "")
	+ [...el.classList].map(c => `.${c}`).join("");

function selection(){
	const el = document.querySelector(".panel.focus, .panel-text-on, .layout-selected");
	return [el && `element ${where(el)}\n${el.outerHTML.slice(0, 500)}`,
		picked && `text "${picked.slice(0, 300)}"`].filter(Boolean).join("\n\n") || null;
}

// A thread is a dir under `<page>ai/` holding a task.jsonl. The one walk that finds them is
// the drawer's (ext/drawer/tabs/sessions.js threads()), imported, not repeated.

const slugify = name => (name ?? "").trim().toLowerCase()
	.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

/**
 * v1 — kept reachable, unchanged: the per-page named-thread picker plus
 * `ext/Ask/chat.js`'s own composer. This was `ask()`'s whole body before this
 * task (round v2 above replaces it as the default). Swap it back in by
 * pointing `tools.js`'s own `import ask from "./ask.js"` at `{ askV1 as
 * default }` instead.
 */
export function askV1(app){
	const url = app?.router?.active?.url ?? location.pathname;

	section("ai", () => {
		if (!available()) return span.c("dev-val off", "localhost only — no bridge here");

		// ⚠ Filled inside a CALLBACK: the await drops the captor, so anything built
		//   after it textually would land in <body> instead of in here.
		div.c("dev-ai flex v", async $ai => {
			const found = await threads(url);
			$ai.append(() => panel(app, url, found));
		});
	});
}

function panel(app, url, found){
	const pills = [];
	let $lit;

	const pick = ($pill, task) => {
		$lit?.rc("on");
		$lit = $pill.ac("on");
		set({ threads: { ...settings.threads, [url]: task } });
		show(task);
	};

	// ⚠ `empty()` is called AFTER the await, from inside a callback, for the captor.
	const show = async task => {
		const m = await new TaskJSONL({ url: `/${task}/task.jsonl` }).load();
		$open.empty(() => chat({ app, task, resume: m.chat_session_id, history: m.chats,
			context: selection, placeholder: "Ask about this page…" }));
	};

	const pill = t => button.c("dev-link dev-thread", t.slug).click(function(){ pick(this, t.task); });

	/* A native prompt, deliberately: naming a thread is two words once in a while,
	   and an inline form is a whole control surface for it. */
	const add = async () => {
		const slug = slugify(window.prompt("Name this thread — one or two words"));
		if (!slug) return;

		const task = `${url.replace(/^\//, "")}ai/${slug}`;
		let $new;

		try {
			await thread(task);
			$threads.append(() => { $new = pill({ slug, task }); });
			$threads.append($add);   // appending an already-placed view MOVES it — + stays last
			pick($new, task);
		} catch (e){
			$open.empty(() => span.c("dev-val warn", e.message));
		}
	};

	let $add;

	const $threads = div.c("dev-threads flex wrap", () => {
		found.forEach(t => pills.push([pill(t), t.task]));
		$add = button.c("dev-link dev-thread dev-thread-new", () => icon("add"))
			.attr("title", "Open a thread on this page").click(add);
	});

	const $open = div.c("dev-ai-open");

	// The one you were last in, remembered per page — otherwise every visit starts
	// with a click that only re-selects where you already were.
	const last = pills.find(([, task]) => task === settings.threads?.[url]);

	/* No thread open still gets a chat — an unrecorded one, with no `task`. It is
	   what makes this tab usable the moment you open it: its **pick an element**
	   button works straight away, and `+` is what turns the exchange into a record. */
	if (last) pick(...last);
	else $open.append(() => {
		span.c("dev-val off", pills.length
			? "No thread open — ask away, or pick one above to record the exchange."
			: "No thread here yet — ask away; + records the exchange.");
		chat({ app, context: selection, placeholder: "Ask about this page…" });
	});
}

export { ask, selection };
