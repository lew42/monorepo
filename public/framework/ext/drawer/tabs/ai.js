import { div, span, label, select, option, small, button } from "/framework/core/View/View.js";
import md from "/framework/ext/markdown/md.js";
import Widget, { model, MODELS } from "/framework/ux/Dictate/Widget.js";
import { composer } from "/framework/ext/Chat/Composer.js";
import { post_prompt } from "/framework/ux/Dictate/Dictate.js";
import { servex_base, is_folder_id, card_prompt, cards_ready } from "/framework/ai2/inbox.js";
import { ask, available } from "/framework/ext/Ask/Ask.js";
import { servex_url } from "/framework/dev/servex_url.js";
import drawer from "../drawer.js";
import { DEV } from "../tabs.js";
import DrawerInbox from "../inbox.js";   // the page's inbox, at the top of this tab (doc/inbox.md)
import * as Session from "/framework/ext/Session/Session.js";
import floor from "/framework/ux/Dictate/floor.js";

// The SAME key `ext/drawer/rail.js`'s own ✦ sheet uses for its `sessionStorage`
// slot — "the SAME widget and the SAME session pair as the ✦ sheet" (the owner,
// round 4): a card session started here is the one the sheet picks up on the same
// tab, and back. Kept as its own literal, not imported from `rail.js`, so this
// file never has to import that one — `rail.js` already imports `tabs.js`, which
// imports THIS file, so a static import the other way would be a cycle (`code`
// skill's own warning: "a parent↔child import cycle breaks only on deep reload").
const SESSION_KEY = "lew42-voice-session";

// Re-exported for anything that still imports them from here — `model()`/`MODELS`
// themselves moved to `ux/Dictate/Widget.js` (round 3, 2026-09-30: "find the
// drawer's current model switcher and move it into the Widget") so `Widget`'s own
// `models: true` option can draw the picker without `ux/Dictate` reaching up into
// `ext/drawer`.
export { model, MODELS };

/* THE AI TAB — v2 (`ai/2026-09-29/audio/c-chat/`, `Widget` as of round 3) is
   `ux/Dictate/Widget`: the log, the composer and the mic as ONE widget, the exact
   one the mobile ✦ sheet (`rail.js`) now also builds — "we need a consistent chat
   widget… whether it's in a desktop sidebar or a mobile sheet" (the owner,
   2026-09-29; `ChatPanel` answered that call first, `Widget` replaces it here).
   `models: true` draws the picker above it, OFF in the sheet (the owner, round 3).
   v1, the hand-wired list-plus-composer this replaced, stays reachable as `aiV1`
   below (unchanged, still exported) — swap it in by pointing `tabs.js`'s "ai" row
   at `{ default: aiV1 }` instead of this file's own default.

   Where a message goes is ONE function, `send()`, exported so anything else on the
   page — a picked element, minion 2's selection — sends the same way:
   · on a CARD: where the card's composer already sends (Servex's prompt log, `re`
     the card), and the reply arrives in the card's own chat on the page;
   · on a plain PAGE: the agreed page-pair route, `POST /api/page-ai`
     (ai/2026-09-25/recursive-pairs/interface.md); until Servex answers it, the dev
     bar's Ask route (ext/Ask), so a message still gets an answer today. */

// Context for the Ask route is text: a list of picked elements becomes one line each.
const as_text = context => Array.isArray(context)
	? context.map(c => `${c.label ?? c.kind ?? "element"} (${c.selector ?? "?"}): ${String(c.text ?? "").slice(0, 300)}`).join("\n")
	: context ?? undefined;

/* ⚠ NO REPLY EVER SHOWED (mastermind, 2026-09-29): `POST /api/page-ai` answers at
 * once with `{ok, assistant, manager}` and no text — the assistant's own answer
 * lands a few seconds later, appended by Servex to the page's own chat log, a flat
 * JSONL file at `<page>ai/chat.jsonl` (one line per turn: `{"prompt":{id,text,at,by}}`
 * then `{"message":{by,text,at,kind:"reply"}}`). `send()` used to return the moment
 * the POST answered, so both the sheet and the desktop drawer showed "sent" and
 * then nothing, forever. This polls that same log, same-origin, until an assistant
 * reply dated at or after this prompt's own send time shows up. `cache: "no-store"`:
 * the file is growing under us, and a cached miss from the FIRST check (the file may
 * not exist a split second before the prompt line lands) must never stick. */
const REPLY_POLL_MS = 1500;
const REPLY_TIMEOUT_MS = 90000;

async function page_reply(page, since){
	const url = String(page ?? "/").replace(/\/?$/, "/") + "ai/chat.jsonl";
	const deadline = Date.now() + REPLY_TIMEOUT_MS;
	while (Date.now() < deadline){
		try {
			const res = await fetch(url, { cache: "no-store" });
			if (res.ok){
				const lines = (await res.text()).split("\n").filter(Boolean);
				for (const line of lines){
					let row; try { row = JSON.parse(line); } catch { continue; }
					const msg = row.message;
					if (msg?.kind === "reply" && String(msg.by ?? "").startsWith("assistant") && new Date(msg.at) >= since) return msg.text;
				}
			}
		} catch {}
		await new Promise(r => setTimeout(r, REPLY_POLL_MS));
	}
	return null;
}

/**
 * Send one message from the drawer. Resolves `{via, text?, session_id?, note}`:
 * `via` is "card", "page-ai" or "ask"; `note` is one line to show the reader.
 * `text` is the reply — for "ask" the route hands it back at once; for "page-ai"
 * the POST itself answers with no text, so this waits (polling the page's own
 * `ai/chat.jsonl`, up to 90s) for the assistant's own reply and returns that.
 * `on({text})` fires once with a "waiting…" line while that poll runs, the same
 * shape Ask's own streaming chunks use, so a caller that shows `on` chunks live
 * needs no special case for either route.
 *
 *     await send({ page: "/framework/ux/Dictate/", text: "why two buttons?",
 *                  context: [{ kind: "p", label: "this paragraph", text: "…", selector: "main p" }] });
 *
 * `card` (an id) sends into that card; `thread` ({task, resume}) skips the page
 * assistant, records an Ask exchange in that thread and resumes its session; `on` streams Ask's reply.
 */
export async function send({ page = drawer.page(), text, context, card, thread, via = "typed", on } = {}){
	if (card){
		const entry = { at: new Date().toISOString(), type: "prompt", by: "owner", text, via, re: card, selected: card };
		if (context) entry.context = context;
		const ok = await post_card(entry);
		return { via: "card", ok, note: ok ? "sent — the reply lands in the card's chat" : "Servex is not answering, so nothing was sent" };
	}

	// A thread picked on the Sessions tab IS an Ask session, so it resumes there; only a
	// fresh conversation goes to the page's assistant. Off the dev server there is no
	// Servex to call (and an http:// call from an https:// page is blocked anyway).
	if (!thread && DEV) try {
		const sent_at = new Date();
		const res = await fetch(servex_url("/api/page-ai"), { method: "POST", headers: { "content-type": "application/json" },
			body: JSON.stringify({ page, text, from: "owner", context }), signal: AbortSignal.timeout(4000) });
		const out = res.ok && (res.headers.get("content-type") ?? "").includes("json") ? await res.json() : null;
		if (out?.ok){
			on?.({ text: "waiting for the page's assistant…" });
			const reply = await page_reply(page, sent_at);
			return { via: "page-ai", ...out, text: reply ?? undefined,
				note: reply ? "answered by this page's assistant" : "no reply after 90 s" };
		}
	} catch {}

	// The fallback: one turn of the dev bar's Ask bridge, on this tab's dev server.
	if (!available()) return { via: "none", note: "No page assistant yet, and the Ask bridge is off (localhost with edit mode on)." };
	let r = await ask(text, { task: thread?.task, resume: thread?.resume, context: as_text(context), on }), fresh = "";

	/* ⚠ A thread's session can be GONE — Claude Code prunes old transcripts, and a
	   session is filed under the directory it ran in, so one started in another tree is
	   not found here. `--resume` then answers nothing at all. The thread goes on anyway:
	   a fresh session, filed in the same thread, handed its last turns to read. */
	if (thread?.resume && !r.text){
		r = await ask(text, { task: thread.task, context: [recap(thread.history), as_text(context)].filter(Boolean).join("\n\n"), on });
		fresh = " · the old session was gone, so a fresh one read the thread";
	}
	if (thread) thread.resume = r.session_id;
	return { via: "ask", ...r, note: `answered by Ask · $${(r.cost_usd ?? 0).toFixed(3)}${fresh}` };
}

/* A CARD'S POST — the same two posts AI 2's own composer makes, copied from its
   `deliver` and `into_card` (ai2/compose.js), not imported, so this tab depends on the
   card's data (ai2/inbox.js) and not on AI 2's composer: Servex's prompt log, which the
   fast assistant reads, plus the card's own copy of the words. */
async function post_card(entry){
	const ok = await post_prompt(entry, servex_base() + "/log/prompts");
	const re = entry.re;
	if (is_folder_id(re) && await cards_ready()) card_prompt(re, entry.text, entry.via, entry.context).catch(() => null);
	else post_prompt(entry, servex_base() + "/log/cards/" + (is_folder_id(re) ? re.split("/").at(-1) : re.split("/")[0])).catch(() => {});
	return ok;
}

// A thread's last turns, as text — what a fresh session reads to carry the thread on.
// Kept under 800 characters: the server cuts `context` there (ext/Ask/Ask.js).
const recap = (history = []) => "Earlier in this thread:\n" + history.filter(c => c.text).slice(-4)
	.map(c => `${c.role}: ${String(c.text).slice(0, 170)}`).join("\n");

/* NEW SESSION for the page's (or card's) own fast assistant — the ✦ sheet's
 * "New session" button (`ext/drawer/rail.js`). On `DrawerRailSheetPanel` (the
 * default sheet) a PLAIN page's sentence goes through a real voice session now
 * (`ext/Session/Session.js`, wired in `rail.js`), which has its own, separate
 * reset (`rail.js`'s own `forget_session()`) — this function is called for
 * that sheet's CARD branch only. `DrawerRail.SheetLinksV1`, the earlier
 * page-ai-bridge sheet kept reachable, still calls this for a plain page too,
 * so both cases stay here. `POST /api/page-ai` carries no session id of its
 * own; the page's (or card's) assistant is a real Claude Code session that
 * Servex's Layers.js resumes by ITS OWN session id, kept server-side. The only
 * way to make the next message start a fresh one is to ask Servex to forget
 * that id: `GET /api/page-agents` (or `/api/card-agents`) finds the assistant's
 * agent id, then `POST /api/agent/<id>/recycle` forgets its session (Layers.js's
 * own `recycle()` — "stop it and forget its session; its id is kept, and it
 * restarts fresh"). Off the dev server (`!DEV`) there is no Servex to ask, so
 * this only clears the sheet on screen; the caller (rail.js) does that part. */
export async function new_session({ page, card } = {}){
	if (!DEV) return { ok: false, note: "No assistant reachable here, so only this screen was cleared." };
	try {
		const list_url = card ? `/api/card-agents?card=${encodeURIComponent(card)}` : `/api/page-agents?page=${encodeURIComponent(page)}`;
		const res = await fetch(servex_url(list_url), { cache: "no-store", signal: AbortSignal.timeout(4000) });
		const rows = res.ok ? await res.json() : [];
		const assistant = Array.isArray(rows) ? rows.find(r => r.role === "assistant") : null;
		if (!assistant) return { ok: true, note: "no session yet — the next message starts fresh anyway" };
		const out = await fetch(servex_url(`/api/agent/${assistant.id}/recycle`), { method: "POST", signal: AbortSignal.timeout(4000) })
			.then(r => r.ok ? r.json() : { ok: false });
		return { ok: !!out.ok, note: out.ok ? "the assistant will start a fresh session next time" : "could not reset the session" };
	} catch {
		return { ok: false, note: "Servex is not answering, so only this screen was cleared." };
	}
}

/* THE AI TAB'S OWN LIVE THREAD, if it is open on a card right now — one module-level
   slot (this tab is a singleton, like the drawer itself), read by `ai2/card.js`'s
   `sync_global_ai()` so a reply streaming in reaches this tab's thread too, without
   rebuilding the whole tab (which would wipe whatever the reader is mid-typing in its
   own composer below). `null` whenever the tab is shut, or open on something that is
   not a card. */
let live_card = null;

/** Called from `ai2/card.js` on every redraw of the card this tab might be open on —
 *  a no-op unless this tab is showing exactly that card right now. */
export function sync_card_thread(id){
	if (live_card?.id === id) live_card.sync();
}

// The chips row: what the next message is about, like the open file an IDE shows in
// its chat box — each element picked on the page (the Element tab's "Ask about
// this"), with an ✕. Shared by v2 (below) and v1 (aiV1) so both wire the same way.
function chips_row(tabs){
	const $chips = div.c("drawer-chips flex wrap");
	const draw = () => $chips.empty(() => {
		tabs.chips.forEach(it => {
			span.c("drawer-chip flex v-center", () => {
				span.c("drawer-chip-label", it.label).attr("title", it.text);
				button.c("drawer-chip-x", "✕").attr("type", "button").attr("title", "Leave it out")
					.click(() => { tabs.unchip(it); draw(); });
			});
		});
	});
	draw();
	return { view: $chips, context: () => tabs.chips.length ? tabs.chips.map(c => ({ ...c })) : undefined };
}

/**
 * v2 — the default. `Widget` (`ux/Dictate/Widget.js`) reads the card's own real,
 * persisted thread (the exact widget the mobile ✦ sheet's card thread already
 * shows, `rail.js`) or, on a page, keeps its own local list seeded from the picked
 * thread's saved history. `--chatbox-panel-max: 100%` (`drawer.css`) is the
 * drawer's own full height — the widget still starts small and only grows into
 * that ceiling. `models: true` — the one thing the sheet's own widget doesn't
 * show (the owner, round 3).
 */
export default function ai({ page, card, tabs }){
	const thread = card ? null : tabs.thread;
	let panel, $hint;
	live_card = card ? { id: card.id, sync: () => panel?.sync() } : null;
	const inbox = new DrawerInbox({ page });

	div.c("drawer-ai flex v", () => {
		div.c("drawer-ai-head flex v-center split wrap", () => {
			small.c("muted", card ? `talking into this card — ${String(card.title ?? card.name).slice(0, 60)}`
				: thread ? `thread · ${thread.slug}` : "this page · a new conversation");
			// The model picker lives INSIDE `Widget` now (`models: true`, below) —
			// michael/dev's own copy of it here (from before round 3's move) is
			// left out on purpose, not lost: see `Widget.Models` in `Widget.js`.
			if (DEV) inbox.button();
		});
		inbox.view();

		const { view: $chips, context } = chips_row(tabs);

		// THE WIDGET. Captured now, filled in a callback for the card branch (`code`
		// skill §1 — the card branch's `import()` drops the captor at its first
		// `await`), built at once for the page branch.
		const $slot = div.c("drawer-ai-panel");
		if (card){
			/* THE SESSION PAIR, not `send({card})` (round 4, `ai/2026-09-30/audio-
			 * consolidate/minion-wire/` — the owner: "Make the AI 2 drawer and card
			 * pages use the SAME widget and the SAME session pair as the ✦ sheet").
			 * The old route posted every sentence into Servex's PROMPT LOG
			 * (`send({card})` → `post_card()` above) and read the card's own
			 * persisted `chat_entries()` back as history; this now starts (or
			 * resumes) a real voice session pinned to the card's own home folder —
			 * `Session.start({path, card: card.id})` — exactly the same pair
			 * `rail.js`'s ✦ sheet uses, and the SAME `sessionStorage` slot (this
			 * file's own `SESSION_KEY`, above), so a conversation begun on the
			 * phone continues here and back. No `history` is given: a session
			 * begun fresh in THIS tab has nothing to read yet (a known, named gap
			 * — the card's own Overview, `ai2/card.js`, stays the permanent
			 * record). Until Servex restarts with the session pair's own `card`
			 * handling, the server ignores the hint and runs it as a plain
			 * session; the send still goes out (this task's own proof note). */
			const own_ats = new Set();
			let session = null, session_file = null;
			const watch_it = () => Session.watch(session_file, line => {
				if (!line.chat || own_ats.has(line.chat.at)) return;
				panel?.say({ chat: line.chat });
			});
			const ensure_session = async () => {
				if (session) return;
				try {
					const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
					if (saved?.session && saved?.file && saved.card === card.id){
						session = saved.session; session_file = saved.file; watch_it(); return;
					}
				} catch {}
				try {
					const made = await Session.start({ path: page, card: card.id });
					session = made.session; session_file = made.file;
					try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ session, file: session_file, card: card.id })); } catch {}
					watch_it();
				} catch {}   // left with no session — deliver() below fails the send instead
			};
			$slot.empty(() => {
				// `Widget` builds its own composer, and the composer builds the
				// microphone (`Dictate`, `mode: "open"`) — this call is the one place
				// that chain starts for the drawer's AI tab's card branch.
				panel = new Widget({
					models: true,
					marks: true,
					placeholder: "talk into this card",
					deliver: async entry => {
						try {
							await ensure_session();
							if (!session) return false;
							const via = entry.via === "typed" ? "text" : "voice";
							floor.stamp(entry);
							const r = await Session.say({ session, path: page, text: entry.text, via, floor: entry.floor, cues: entry.cues });
							own_ats.add(r.at);
							panel.retag(entry.at, r.at);
							return true;
						} catch { return false; }
					},
				});
			});
		} else {
			// The hint goes as soon as the first message is sent (`on_text`, below).
			$hint = !thread?.history?.length && small.c("drawer-ai-empty muted", "Ask anything about this page. Sessions lists this page's saved threads.");
			$slot.empty(() => {
				panel = new Widget({
					models: true,
					marks: true,
					placeholder: "ask about this page",
					// `on_text` only hides the intro hint — `Widget.submit()` already drew
					// the owner's own bubble by the time this fires.
					on_text: () => $hint?.el.remove(),
					/* THE UNIVERSAL CHAT LINE (`ext/Chat/readme.md`), used here for the
					   REPLY: first "_thinking…_", then `fix: true` on the SAME `at` as
					   `send()`'s streamed chunks arrive, so the reply grows in place
					   instead of a new bubble per chunk. The owner's OWN line is not
					   drawn here — `Widget.submit()` (the composer) already drew it,
					   optimistically, before `deliver` (this function) even started. */
					deliver: async entry => {
						const reply_at = new Date(Date.now() + 1).toISOString();
						panel.say({ chat: { at: reply_at, from: { kind: "assistant" }, text: "_thinking…_" } });
						let streamed = "";
						try {
							const r = await send({ page, text: entry.text, thread, via: entry.via, context: context(), on: e => {
								streamed += e.text ?? "";
								if (streamed) panel.say({ chat: { at: reply_at, from: { kind: "assistant" }, text: streamed, fix: true } });
							} });
							panel.say({ chat: { at: reply_at, from: { kind: "assistant" }, text: r.text ?? r.note, fix: true } });
							return r.via !== "none";
						} catch (e){
							panel.say({ chat: { at: reply_at, from: { kind: "assistant" }, text: "**Could not send:** " + e.message, fix: true } });
							return false;
						}
					},
				});
				(thread?.history ?? []).filter(c => c.text).forEach((c, i) => panel.say({
					chat: {
						from: { kind: c.role === "user" ? "owner" : "assistant" },
						text: c.text,
						// One second apart, oldest first — real order, not real timestamps
						// (the saved thread does not keep per-turn times).
						at: new Date(Date.now() - ((thread.history.length - i) * 1000)).toISOString(),
					},
				}));
			});
		}
	});
}

// ============================================================================
// v1 — kept reachable, unchanged from before ChatPanel: a hand-wired `turn()`
// list plus a standalone `composer()`. Not the default; import `{ aiV1 }` and
// point a tab's `load()` at `{ default: aiV1 }` to bring it back.
// ============================================================================

// One turn of the conversation. Built through `$list.append`, which re-establishes the
// captor, so a bubble raised from an event handler lands in the list.
function turn($list, who, text){
	let $text;
	$list.append(() => {
		div.c("drawer-turn drawer-turn-" + who, () => {
			span.c("drawer-turn-who muted", who === "you" ? "you" : "assistant");
			$text = div.c("drawer-turn-text", () => { md(text ?? ""); });
		});
	});
	$text.el.scrollIntoView({ block: "nearest" });
	return $text;
}

export function aiV1({ page, card, tabs }){
	const thread = card ? null : tabs.thread;
	let $list, talk, $hint;
	live_card = card ? { id: card.id, sync: () => talk?.sync() } : null;

	div.c("drawer-ai flex v", () => {
		div.c("drawer-ai-head flex v-center split wrap", () => {
			small.c("muted", card ? `talking into this card — ${String(card.title ?? card.name).slice(0, 60)}`
				: thread ? `thread · ${thread.slug}` : "this page · a new conversation");

			label.c("drawer-model flex v-center", () => {
				span.c("muted", "model");
				const $pick = select(() => { MODELS.forEach(m => option(m[0].toUpperCase() + m.slice(1)).attr("value", m)); });
				$pick.el.value = model();
				$pick.on("change", () => model($pick.el.value));
			}).attr("title", "Only stored for now — the provider that reads it comes with harness step 2.");
		});

		if (card){
			const $thread = div.c("drawer-ai-list flex v");
			import("/framework/ai2/chat.js").then(m => {
				$thread.empty(() => { talk = m.default({ source: () => card.chat_entries(), re: () => card.id }); });
				talk.sync();
			});
		} else {
			$list = div.c("drawer-ai-list flex v");
			(thread?.history ?? []).filter(c => c.text).forEach(c => turn($list, c.role === "user" ? "you" : "assistant", c.text));
			$hint = !thread?.history?.length && small.c("drawer-ai-empty muted", "Ask anything about this page. Sessions lists this page's saved threads.");
		}

		const { view: $chips, context } = chips_row(tabs);

		composer({
			placeholder: card ? "talk into this card" : "ask about this page",
			sent: card ? "sent — the reply lands in the thread above" : "sent",
			failed: card ? "Servex is not answering, so nothing was sent" : "not sent",
			on_text: text => { $hint?.el.remove(); if (!card) turn($list, "you", text); },
			deliver: card
				? async entry => {
					const ok = (await send({ card: card.id, page, text: entry.text, via: entry.via, context: context() })).ok;
					talk?.sync();
					return ok;
				}
				: async entry => {
					let streamed = "";
					const $reply = turn($list, "assistant", "_thinking…_");
					try {
						const r = await send({ page, text: entry.text, thread, via: entry.via, context: context(), on: e => {
							streamed += e.text ?? "";
							if (streamed) $reply.empty(() => { md(streamed); });
						} });
						$reply.empty(() => { md(r.text ?? r.note); });
						return r.via !== "none";
					} catch (e){
						$reply.empty(() => { md("**Could not send:** " + e.message); });
						return false;
					}
				},
		});
	});
}
