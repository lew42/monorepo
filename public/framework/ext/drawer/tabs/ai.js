import { div, span, label, select, option, small, button } from "/framework/core/View/View.js";
import md from "/framework/ext/markdown/md.js";
import { composer } from "/framework/ext/Chat/Composer.js";
import { post_prompt } from "/framework/ux/Dictate/Dictate.js";
import { servex_base, is_folder_id, card_prompt, cards_ready } from "/framework/ai2/inbox.js";
import { ask, available } from "/framework/ext/Ask/Ask.js";
import { servex_url } from "/framework/dev/servex_url.js";
import drawer from "../drawer.js";
import { DEV } from "../tabs.js";

/* THE AI TAB — the site's chat composer (ext/Chat, imported: one line, the microphone
   beside it, Send after it) with a model picker above it and the conversation between
   them. The composer hands every finished message, typed or dictated, to this tab's own
   `deliver(entry)`.

   Where a message goes is ONE function, `send()`, exported so anything else on the
   page — a picked element, minion 2's selection — sends the same way:
   · on a CARD: where the card's composer already sends (Servex's prompt log, `re`
     the card), and the reply arrives in the card's own chat on the page;
   · on a plain PAGE: the agreed page-pair route, `POST /api/page-ai`
     (ai/2026-09-25/recursive-pairs/interface.md); until Servex answers it, the dev
     bar's Ask route (ext/Ask), so a message still gets an answer today. */

export const MODELS = ["haiku", "sonnet", "opus", "fable"];
const MODEL_KEY = "lew42-drawer-model";

/** The model the reader picked. Stored only — nothing reads it yet (harness step 2). */
export function model(value){
	try {
		if (value) localStorage.setItem(MODEL_KEY, value);
		return localStorage.getItem(MODEL_KEY) || "sonnet";
	} catch { return value || "sonnet"; }
}

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

export default function ai({ page, card, tabs }){
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

		/* THE THREAD. ON A CARD (one-ai, 2026-09-29): this tab used to draw its own
		   empty, throwaway list of turns EVEN THOUGH `send()` below already posted
		   into the card's real, persisted log — the SAME route the card's own page
		   and the mobile ✦ sheet (`ext/drawer/rail.js`) post through — so the exact
		   same conversation looked like two different, differently-remembered ones
		   depending on which door you talked through. It now reuses `ai2/chat.js`,
		   the exact widget the ✦ sheet already shows, reading the card's own
		   `chat_entries()` — one thread, seen the same way everywhere.
		   ⚠ Imported lazily, HERE, not at this file's top: this tab loads on every
		   page's drawer, and most opens are not on a card — loading AI 2's own chat
		   module for those would be dead weight paid on every other page. */
		if (card){
			const $thread = div.c("drawer-ai-list flex v");
			import("/framework/ai2/chat.js").then(m => {
				$thread.empty(() => { talk = m.default({ source: () => card.chat_entries(), re: () => card.id }); });
				talk.sync();
			});
		} else {
			$list = div.c("drawer-ai-list flex v");
			(thread?.history ?? []).filter(c => c.text).forEach(c => turn($list, c.role === "user" ? "you" : "assistant", c.text));
			// The hint goes as soon as the first message is sent. Card side: the real
			// thread above already says "nothing yet" its own way (or shows what is
			// there), so there is nothing for a second, local hint to add.
			$hint = !thread?.history?.length && small.c("drawer-ai-empty muted", "Ask anything about this page. Sessions lists this page's saved threads.");
		}

		// THE CHIPS — what the next message is about, like the open file an IDE shows in its
		// chat box: each element picked on the page (the Element tab's "Ask about this"),
		// with an ✕. They stay until removed, and every send carries them as `context`.
		const $chips = div.c("drawer-chips flex wrap");
		const chips = () => $chips.empty(() => {
			tabs.chips.forEach(it => {
				span.c("drawer-chip flex v-center", () => {
					span.c("drawer-chip-label", it.label).attr("title", it.text);
					button.c("drawer-chip-x", "✕").attr("type", "button").attr("title", "Leave it out")
						.click(() => { tabs.unchip(it); chips(); });
				});
			});
		});
		chips();
		const context = () => tabs.chips.length ? tabs.chips.map(c => ({ ...c })) : undefined;

		// ON A CARD the message goes where the card's own footer used to send it
		// (`send()` with `card`), and the reply now lands in the SAME thread drawn
		// above — `talk.sync()` right after is what picks it up without waiting for
		// the next unrelated redraw; on a page it is answered here as before.
		// `deliver(entry)` answers true when the message went; the composer then
		// shows `sent` or `failed` in its own box.
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
