import { div, span, button, small, a, h4 } from "/framework/core/View/View.js";
import { TaskJSONL } from "/framework/ext/JSONL/JSONL.js";
import { thread, available } from "/framework/ext/Ask/Ask.js";
import { PageLog } from "/framework/core/Page/Log.js";

/* THE SESSIONS TAB — every thread on this page. A thread is the dev bar Ask's own
   store: a dir `<page>ai/<slug>/` holding a `task.jsonl`, whose `chat` lines are the
   exchange and whose `chat_session_id` resumes it (dev/DevBar/ask.js). One click
   hands the thread to the AI tab, and the next send there resumes that session.
   On a card, the card's sub-cards are listed under the threads.

   `threads()` is the one thread walk: dev/DevBar/ask.js imports it from here. */

// ⚠ The SPA fallback answers every miss with index.html — the content-type is the 404.
const json = url => fetch(url)
	.then(res => res.ok && !res.headers.get("content-type")?.includes("html") ? res.json() : null)
	.catch(() => null);

const walk = (files, [head, ...rest]) => {
	const hit = files.find(file => file.name === head);
	return !hit ? null : rest.length ? walk(hit.children ?? [], rest) : hit;
};

/** This page's threads, newest file listing order: [{slug, task}]. The dir listing IS the index. */
export async function threads(url){
	const dir = url.replace(/^\//, "") + "ai";

	// Each folder's own file list (files.jsonl, Page.listing()) names its sub-folders; each thread's names its task.jsonl.
	// The page's own list first: a page with no ai/ folder costs one fetch, not a 404.
	const own = await PageLog.listing("/" + dir.replace(/ai$/, ""));
	if (own && !own.folder("ai")) return [];
	const listing = own && await PageLog.listing("/" + dir + "/");
	if (listing){
		const kids = [...listing.dirs, ...listing.pages.keys()];
		const logs = await Promise.all(kids.map(kid => PageLog.listing(`/${dir}/${kid}/`)));
		return kids.filter((kid, i) => logs[i]?.files.includes("task.jsonl")).map(slug => ({ slug, task: `${dir}/${slug}` }));
	}

	// No file list there yet: the whole site's directory.json.
	const tree = walk((await json("/directory.json"))?.files ?? [], dir.split("/").filter(Boolean));
	return (tree?.children ?? [])
		.filter(kid => kid.type === "dir" && kid.children?.some(file => file.name === "task.jsonl"))
		.map(kid => ({ slug: kid.name, task: `${dir}/${kid.name}` }));
}

/** One thread, read: its exchange and the session that resumes it. */
export async function load(t){
	const m = await new TaskJSONL({ url: `/${t.task}/task.jsonl` }).load();
	return { ...t, resume: m.chat_session_id, history: m.chats ?? [] };
}

const slugify = name => (name ?? "").trim().toLowerCase()
	.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

export default function sessions({ page, card, tabs }){
	// Hand a thread to the AI tab — the next send there resumes it.
	const go = t => { tabs.thread = t; tabs.open("ai"); };

	div.c("drawer-sessions flex v", $s => {
		small.c("muted", "Threads on " + page);

		div.c("drawer-rows flex v", async $rows => {
			const found = await Promise.all((await threads(page)).map(load));
			$rows.append(() => {
				if (!found.length) small.c("drawer-wait muted", "No threads on this page yet.");
				found.forEach(t => button.c("drawer-row").attr("type", "button")
					.ac(tabs.thread?.task === t.task && "on").click(() => go(t)).append(() => {
						span.c("drawer-row-title", t.slug);
						small.c("drawer-row-meta muted", `${t.history.length} turns${t.resume ? " · resumable" : ""}`);
						const last = t.history.at(-1)?.text;
						if (last) small.c("drawer-row-last muted", String(last).slice(0, 120));
					}));
			});
		});

		div.c("drawer-acts flex wrap", () => {
			button.c("btn", "New conversation").attr("type", "button")
				.click(() => go(null));

			// A native prompt, as the dev bar does: naming a thread is two words once in a while.
			if (available()) button.c("btn", "New thread").attr("type", "button").click(async () => {
				const slug = slugify(window.prompt("Name this thread — one or two words"));
				if (!slug) return;
				const task = `${page.replace(/^\//, "")}ai/${slug}`;
				try { await thread(task); go({ slug, task, history: [] }); }
				catch (e){ window.alert(e.message); }
			});
		});

		// ON A CARD: its sub-cards are threads too — each opens as its own page.
		const subs = card?.subs?.() ?? [];
		if (subs.length) {
			h4.c("drawer-sub-title", "Sub-cards");
			div.c("drawer-rows flex v", () => {
				subs.forEach(sub => {
					const it = card.shell?.ai2?.cards?.card?.(card.id + "/" + sub);
					a.c("drawer-row", it?.title ?? sub).href(card.url + sub + "/");
				});
			});
		}
	});
}
