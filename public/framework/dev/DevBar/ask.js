import { div, span, button, icon } from "../../core/View/View.js";
import { TaskJSONL } from "../../ext/JSONL/JSONL.js";
import { available, thread } from "../../ext/Ask/Ask.js";
import { chat } from "../../ext/Ask/chat.js";
import { settings, set } from "./settings.js";
import { section } from "./parts.js";

/* This page's AI threads, and a chat on whichever one is open.
 *
 * A thread is a dir at `<page>ai/<slug>/` holding a `task.jsonl` — so the record
 * lives beside the page it is about, the dir listing IS the index, and a reload
 * replays the exchange instead of losing it (`chat_session_id` continues the
 * session, the `chat` lines redraw it). Design record: readme.md.
 *
 * ⚠ The first dev -> ext import in the repo. The constraint is that CORE never
 *   imports an ext; dev sits downstream of both and opts in the way app.js does. */
export default function ask(app){
	const url = app?.router?.active?.url ?? location.pathname;

	section("ai", () => {
		if (!available()) return span.c("dev-val off", "localhost only — no bridge here");

		// ⚠ Filled inside a CALLBACK: the await drops the captor, so anything built
		//   after it textually would land in <body> instead of in here.
		div.c("dev-ai flex v", async $ai => {
			const found = await threads(url);
			$ai.append(() => panel(url, found));
		});
	});
}

/* What the owner has selected, handed to the turn as context. Read straight off the DOM,
   so nothing here imports ext/Panel or ext/layout and a page that has neither still gets
   the text half: a workspace marks its selected panel `.focus`, a layout demo's selection
   is `.layout-selected` (`layout.selected()`, ext/layout/panel.js), and a selected run of
   text is `.panel-text-on` (`panel-focus` / `panel-text` are the same facts as events).

   ⚠ The text is REMEMBERED, not read on send: clicking into the chat box collapses the
   very selection you were about to ask about. */
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

/* ⚠ The SPA fallback answers every miss with index.html — content-type is the 404. */
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

// The dir listing IS the index — nothing declares a thread and nothing crawls.
async function threads(url){
	const dir = url.replace(/^\//, "") + "ai";
	const listing = walk((await json("/directory.json"))?.files ?? [], dir.split("/").filter(Boolean));

	return (listing?.children ?? [])
		.filter(kid => kid.type === "dir" && kid.children?.some(file => file.name === "task.jsonl"))
		.map(kid => ({ slug: kid.name, task: `${dir}/${kid.name}` }));
}

const walk = (files, [head, ...rest]) => {
	const hit = files.find(file => file.name === head);
	return !hit ? null : rest.length ? walk(hit.children ?? [], rest) : hit;
};

const slugify = name => (name ?? "").trim().toLowerCase()
	.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

function panel(url, found){
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
		$open.empty(() => chat({ task, resume: m.chat_session_id, history: m.chats,
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

	if (last) pick(...last);
	else $open.append(() => span.c("dev-val off",
		pills.length ? "Pick a thread, or + for a new one." : "No threads on this page yet."));
}

export { ask, selection };
