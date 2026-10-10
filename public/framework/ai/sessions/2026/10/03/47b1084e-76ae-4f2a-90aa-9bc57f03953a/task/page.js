import { Page, View, div, h2, h3, p, a, span, small, ul, li, button } from "/app.js";
import { prompt_modes } from "/framework/ext/Refine/prompt-card.js";
import { mentions } from "/framework/ext/Mention/Mention.js";

View.stylesheet(import.meta, "prompt-review.css");

/**
 * PROMPT REVIEW — every real prompt the owner said in one session (2026-10-02,
 * `361c4d18`), refined by cheap models, on one page: a List (time, title,
 * bullets, tag chips), an Overview (the same rows grouped by tag), and a
 * Detail per prompt (the full Structured/Clean/Raw reading). Built from the
 * owner's own brief at `requirements.md`, step 4.
 *
 * THE DATA lives on the SESSION's own page, not this task's — `page_add`
 * wrote 42 `type: "Prompt"` items to `SESSION_JSONL` below, one per real
 * prompt, each carrying `raw`, `clean`, `structure`, `title`, `bullets`,
 * `tags`, `flags`, `strikes`, `misheard` and `model` (`ext/Refine/engine.js`'s
 * and `structure.js`'s own shapes — see `prompt-card.js`'s own doc comment).
 * That page already held 45 OTHER `Prompt` items before this task touched
 * it — a finer-grained, separate live-dictation capture of the same session
 * that doesn't line up with these 42 (checked: zero of them share raw text
 * with any of the 42; see this task's own `task.jsonl` for the full decision)
 * — so this page filters to exactly the ones carrying `structure` (only the
 * 42 this task wrote have it), rather than trying to tell the two sets apart
 * by id or guessing a merge.
 *
 * `load_prompts()` is a plain fetch + a small replay of `page.jsonl`'s own
 * `{at:"content", add:{...}}` / `{at:"content/<id>", ...}` lines — the same
 * two verbs `Servex/agents/page_tools.js`'s own `replay()` understands,
 * mirrored here in about ten lines rather than imported, because that file
 * only runs in Servex (node); nothing here is the live, two-way
 * `core/Item/Store` wiring (`Store.attach`/`host.set`) that class is built
 * for — this page only ever READS the file. ⚠ Kept this small and re-callable
 * on purpose (not cached inside a class instance with its own lifecycle)
 * because the owner's longer goal is the SAME page live — "voice → clean
 * text → structured cards appearing while the owner talks" — and a plain
 * `fetch → array of items` function can be called again as new lines land,
 * or swapped for a tailing one later, with nothing else on this page needing
 * to change shape. Nothing here assumes a prompt's `clean`/`structure` is
 * fully finished before it can be shown — `lead()` and `row()` below fall
 * back to "(untitled)"/no bullets if those fields are still missing, the
 * same "never blank" rule `prompt-card.js`'s own fallbacks already follow.
 */
const SESSION_URL = "/framework/ai/2026/10/02/session-361c4d18/";
const SESSION_JSONL = SESSION_URL + "page.jsonl";

let _prompts = null;
async function load_prompts(){
	if (_prompts) return _prompts;
	const res = await fetch(SESSION_JSONL).catch(() => null);
	if (!res?.ok || (res.headers.get("content-type") ?? "").includes("html")) return (_prompts = []);

	const items = new Map(), order = [];
	for (const line of (await res.text()).split("\n")){
		if (!line.trim()) continue;
		let obj; try { obj = JSON.parse(line); } catch { continue; }
		const { at, ...rest } = obj;
		if (at === "content" && rest.add){
			const { after, ...data } = rest.add;
			items.set(data.id, { ...items.get(data.id), ...data });
			if (!order.includes(data.id)) order.push(data.id);
		} else if (typeof at === "string" && at.startsWith("content/")){
			const id = at.slice("content/".length);
			if (items.has(id)) items.set(id, { ...items.get(id), ...rest });
		}
	}
	return (_prompts = order.map(id => items.get(id)).filter(it => it?.type === "Prompt" && Array.isArray(it.structure))
		.sort((a, b) => (a.index ?? 0) - (b.index ?? 0)));
}

const clock = at => at ? new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";
const quote_of = (raw, n = 220) => {
	const t = (raw ?? "").trim();
	return t.length > n ? t.slice(0, n).trim() + "…" : t;
};

/** THE ONE SHAPE every refined prompt renders in (the owner, 2026-10-02, mid-task): the raw
    words as a small quote, the gist as a big heading — the actual title, never a label like
    "Prompt" — then 2-4 bullets. `heading` is the tag function to use (`h3` in a list row,
    `h2` leading the full detail), so the one shape serves both without two copies of it. */
function lead(item, heading){
	small.c("prompt-review-quote").text(item.raw ? `"${quote_of(item.raw)}"` : "…");
	heading.c("prompt-review-heading").text(item.title || "(untitled)");
	if (item.bullets?.length) ul.c("prompt-review-bullets", () =>
		item.bullets.slice(0, 4).forEach(b => li.c("prompt-review-bullet").text(typeof b === "string" ? b : b.text ?? "")));
}

/** Tag chips as real `#Page`/`@agent`/`/path` references (CLAUDE.md: "use them instead of
    prose names") — built as plain text first, then `mentions()` (`ext/Mention`, law 6) turns
    the ones it recognises into icon links in place; an unrecognised tag just stays plain text. */
function tag_chips(tags){
	if (!tags?.length) return;
	const $t = div.c("prompt-review-tags", () => tags.forEach(t => span.c("prompt-review-tag").text(t)));
	mentions($t.el);
}

/** ONE ROW — the List's own face, and the only way in from Overview too. The whole row is the
    link through to that prompt's full detail (requirements.md: "preview → full view by a
    plain link"); `root` is the top-level page so every row works the same from either view. */
function row(root, item){
	a.c("prompt-review-row card").href(root.url + "p" + item.index + "/").append(() => {
		small.c("prompt-review-row-when muted").text(clock(item.at));
		lead(item, h3);
		tag_chips(item.tags);
	});
}

/** The two real views, as plain links (CLAUDE.md: "route everything" — a reload or the back
    button must land in the same place). `current` is which one is "on"; `null` on the detail
    page, where neither tab applies. */
function views_row(root, current){
	div.c("prompt-review-views", () => {
		a.c("prompt-review-view-btn" + (current === "list" ? " on" : "")).href(root.url).text("List");
		a.c("prompt-review-view-btn" + (current === "overview" ? " on" : "")).href(root.url + "overview/").text("Overview");
	});
}

export default new Page({
	meta: import.meta,
	title: "Prompt review: Fri 2 Oct",
	icon: "forum",
	description: "Every real prompt from 2 Oct's session, refined by cheap models — raw words, the gist, and the full structured/clean/raw reading, one click away.",

	content(){ build_list(this); },

	route(id){
		if (id === "overview") return overview_page(this);
		const m = /^p(\d+)$/.exec(id);
		if (m) return detail_page(this, Number(m[1]));
	},
});

/* LIST — the default view: time, title, bullets, tag chips, newest-said-last (the order the
   owner actually said them in, `index` ascending). Filter by tag is a toggle, not a url (same
   call `ai/v/3`'s own author filter makes, and for the same reason — a view REFINEMENT, saved
   as a preference, not a place worth linking to on its own). */
function build_list(root){
	let $tagbar, $rows;
	div.c("prompt-review pad wide", () => {
		div.c("prompt-review-head", () => {
			// No own `h1` here — `core/Page`'s own `render()` already draws one from
			// `title:` below (`Page.class.js`: "if (this.title) h1.c('page-title', …)"),
			// found live while proving this page (a second, identical-looking "Prompt
			// review: Fri 2 Oct" heading right under the real one).
			p.c("prompt-review-sub muted").text("Every real prompt from the 2 Oct session (#session-361c4d18) — the owner's own words, the gist made of them, and tags for what each one is about.");
			views_row(root, "list");
		});
		$tagbar = div.c("prompt-review-tagbar");
		$rows = div.c("prompt-review-list");
	});
	fill_list(root, $tagbar, $rows);
}

async function fill_list(root, $tagbar, $rows){
	const items = await load_prompts();
	if (!items.length){
		$rows.empty(() => void p.c("muted").text("No refined prompts yet."));
		return;
	}

	const prefs = new Page.Prefs({ id: "prompt-review-tags" });
	const active = new Set(prefs.get({ tags: [] }).tags ?? []);
	const all_tags = [...new Set(items.flatMap(it => it.tags ?? []))];

	const redraw = () => {
		$tagbar.empty(() => all_tags.forEach(t => button.c("prompt-review-tag-btn" + (active.has(t) ? " on" : ""))
			.attr("type", "button").text(t)
			.on("click", () => {
				active.has(t) ? active.delete(t) : active.add(t);
				prefs.patch({ tags: [...active] });
				redraw();
			})));
		$rows.empty(() => {
			const shown = active.size ? items.filter(it => (it.tags ?? []).some(t => active.has(t))) : items;
			if (!shown.length) return void p.c("muted").text("Nothing matches that filter.");
			shown.forEach(it => row(root, it));
		});
	};
	redraw();
}

/* OVERVIEW — the same rows, grouped by tag. A prompt carrying two tags appears in BOTH its
   groups (requirements.md's own words), which is just "file this row under every tag it has",
   not only its first one. */
function overview_page(root){
	return new Page({
		title: "Overview", icon: "category", url: root.url + "overview/",
		content(){ build_overview(this, root); },
	});
}

function build_overview(page, root){
	let $groups;
	div.c("prompt-review pad wide", () => {
		div.c("prompt-review-head", () => {
			p.c("prompt-review-sub muted").text("The same prompts, grouped by what each one is about.");
			views_row(root, "overview");
		});
		$groups = div.c("prompt-review-groups");
	});
	load_prompts().then(items => {
		const groups = new Map();
		items.forEach(it => (it.tags?.length ? it.tags : ["(untagged)"]).forEach(t => {
			if (!groups.has(t)) groups.set(t, []);
			groups.get(t).push(it);
		}));
		$groups.empty(() => {
			if (!groups.size) return void p.c("muted").text("Nothing to group yet.");
			[...groups.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([tag, list]) => {
				div.c("prompt-review-group", () => {
					const $h = h2.c("prompt-review-group-head").text(`${tag} (${list.length})`);
					mentions($h.el);
					div.c("prompt-review-group-rows", () => list.forEach(it => row(root, it)));
				});
			});
		});
	});
}

/* DETAIL — one prompt, in full. Leads with the same quote → heading → bullets shape every row
   already uses (so a reader arrives somewhere familiar, just bigger), then the Structured ·
   Clean · Raw switch (`prompt-card.js`'s own `prompt_modes()`, reused whole — Condensed hidden
   by this page's own CSS, see `prompt-review.css`), defaulting to Structured. Past 56em of the
   page's own width (a CSS container query, not the viewport — `prompt-review.css`), a second,
   always-on pair of panes shows Clean beside Raw, so comparing the two never needs a click;
   under that width — mobile included — the switch above is the only way to see either, never
   a row of tabs. */
function detail_page(root, index){
	// `title` can't be the real gist yet — `Page.render()` draws its own `h1.page-title` from
	// this field SYNCHRONOUSLY, before the fetch below ever resolves, and found live (proving
	// this page) that setting `page.title` afterwards does nothing to that already-painted
	// heading. "Prompt" is the honest placeholder; the real title is the big heading `lead()`
	// draws the moment the data lands, one line down.
	return new Page({
		title: "Prompt", icon: "arrow_back", url: root.url + "p" + index + "/",
		content(){ build_detail(this, root, index); },
	});
}

/* ⚠ FOUR TOP-LEVEL SIBLINGS, not one wrapping div — `.page`'s own grid only sends a direct
   child to the wide track (`prompt-review.css`'s own note on `.wide`), so `$wide` has to sit
   at this same level as `$head`/`$lead`/`$modes`, never nested one more div down inside them. */
function build_detail(page, root, index){
	let $head, $lead, $modes, $wide;
	$head = div.c("prompt-review-detail-head pad", () => {
		a.c("prompt-review-back").href(root.url).text("← all prompts");
		views_row(root, null);
	});
	$lead = div.c("prompt-review-detail-lead card pad");
	$modes = div.c("prompt-review-detail-modes pad");
	$wide = div.c("prompt-review-detail-wide wide");

	load_prompts().then(items => {
		const item = items.find(it => it.index === index);
		if (!item){ $lead.empty(() => void p.c("muted").text("That prompt isn't on the session page yet.")); return; }

		$lead.empty(() => { lead(item, h2); tag_chips(item.tags); });

		const source = {
			raw: item.raw, sentences: item.clean, structured: item.structure, fallback_text: item.raw,
			strikes: item.strikes, misheard: item.misheard, flags: item.flags,
		};
		$modes.empty(() => {
			prompt_modes(source, { mode: "structured" });
			if (item.model) small.c("prompt-review-model muted").text(`refined by ${item.model}`);
		});
		$wide.empty(() => {
			div.c("prompt-review-pane", () => { prompt_modes(source, { mode: "clean" }); });
			div.c("prompt-review-pane", () => { prompt_modes(source, { mode: "raw" }); });
		});
	});
}
