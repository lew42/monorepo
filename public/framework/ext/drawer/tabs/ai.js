import { div, span, label, select, option, small, button, a } from "/framework/core/View/View.js";
import AIFeed from "../AIFeed.js";
import md from "/framework/ext/markdown/md.js";
import Widget, { model, MODELS } from "/framework/ux/Dictate/Widget.js";
import chat from "/framework/ux/Dictate/chat.js";
import { composer } from "/framework/ext/Chat/Composer.js";
import { post_prompt } from "/framework/ux/Dictate/Dictate.js";
import { servex_base, is_folder_id, card_prompt, cards_ready } from "/framework/ai/rail/inbox.js";
import { ask, available } from "/framework/ext/Ask/Ask.js";
import { servex_url } from "/framework/dev/servex_url.js";
import drawer from "../drawer.js";
import { DEV } from "../tabs.js";
import Inbox from "../inbox.js";   // the page's inbox, at the top of this tab (doc/inbox.md)
import * as Session from "/framework/ext/Session/Session.js";
import floor from "/framework/ux/Dictate/floor.js";
import ChatView from "../ChatView.js";   // the v2 chip, shared with the phone sheet

const SESSION_KEY = "lew42-voice-session";

export { model, MODELS };

// See doc/ai-tab-notes.md for architecture and design decisions.

// Context for the Ask route is text: a list of picked elements becomes one line each.
const as_text = context => Array.isArray(context)
	? context.map(c => `${c.label ?? c.kind ?? "element"} (${c.selector ?? "?"}): ${String(c.text ?? "").slice(0, 300)}`).join("\n")
	: context ?? undefined;

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

export async function send({ page = drawer.page(), text, context, card, thread, via = "typed", on } = {}){
	if (card){
		const entry = { at: new Date().toISOString(), type: "prompt", by: "owner", text, via, re: card, selected: card };
		if (context) entry.context = context;
		const ok = await post_card(entry);
		return { via: "card", ok, note: ok ? "sent — the reply lands in the card's chat" : "Servex is not answering, so nothing was sent" };
	}

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

	if (!available()) return { via: "none", note: "No page assistant yet, and the Ask bridge is off (localhost with edit mode on)." };
	let r = await ask(text, { task: thread?.task, resume: thread?.resume, context: as_text(context), on }), fresh = "";

	if (thread?.resume && !r.text){
		r = await ask(text, { task: thread.task, context: [recap(thread.history), as_text(context)].filter(Boolean).join("\n\n"), on });
		fresh = " · the old session was gone, so a fresh one read the thread";
	}
	if (thread) thread.resume = r.session_id;
	return { via: "ask", ...r, note: `answered by Ask · $${(r.cost_usd ?? 0).toFixed(3)}${fresh}` };
}

async function post_card(entry){
	const ok = await post_prompt(entry, servex_base() + "/log/prompts");
	const re = entry.re;
	if (is_folder_id(re) && await cards_ready()) card_prompt(re, entry.text, entry.via, entry.context).catch(() => null);
	else post_prompt(entry, servex_base() + "/log/cards/" + (is_folder_id(re) ? re.split("/").at(-1) : re.split("/")[0])).catch(() => {});
	return ok;
}

const recap = (history = []) => "Earlier in this thread:\n" + history.filter(c => c.text).slice(-4)
	.map(c => `${c.role}: ${String(c.text).slice(0, 170)}`).join("\n");

let live_card = null;

export function sync_card_thread(id){
	if (live_card?.id === id) live_card.sync();
}

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

// See doc/ai-tab-notes.md for header strip design and agent state architecture.
const AGENT_ROLES = ["fast", "smart"];

function agent_state_label(raw){
	if (raw === "working") return "working";
	if (raw === "idle") return "idle";
	return "asleep";
}

async function fetch_agent_states(session){
	let rows = [];
	try {
		const res = await fetch(servex_url("/api/agents"), { cache: "no-store", signal: AbortSignal.timeout(4000) });
		rows = res.ok ? await res.json() : [];
	} catch {}
	return AGENT_ROLES.map(role => ({ role, state: agent_state_label(rows.find?.(r => r.id === `session-${role}-${session}`)?.state) }));
}

/** The header strip itself — see the class doc above. Returns `{view, stop}`; `stop()`
 *  drops its own poller and its `chat.on_change` subscription, called by `dispose_chat()`
 *  below the same way it already disposes the chat mount, so reopening this tab ten times
 *  never leaves nine stale timers running (review finding 3's own bug, for the mount —
 *  this strip is new code, so it is built with that fix already in it, not after). */
function session_header({ card, view }){
	const $box = div.c("drawer-ai-session flex v");
	let $chips = null, chip_timer = null, switcher = null;

	function draw_chips(session){
		if (!$chips) return;
		if (!session){ $chips.empty(() => AGENT_ROLES.forEach(role => span.c("drawer-ai-chip drawer-ai-chip-asleep", `${role} · asleep`))); return; }
		fetch_agent_states(session).then(list => {
			if (!$chips?.el.isConnected) return;
			// `info`, not `a` — `a` is this file's own import, the anchor-tag factory (code skill).
			$chips.empty(() => list.forEach(info => span.c(`drawer-ai-chip drawer-ai-chip-${info.state}`, `${info.role} · ${info.state}`)));
		});
	}

	async function paint(){
		const session = chat.current();
		let rows = [];
		try { rows = await Session.recent_project({ limit: 12 }); } catch {}
		if (!$box.el.isConnected) return;
		const live_row = rows.find(r => r.session === session);

		$box.empty(() => {
			div.c("drawer-ai-session-head flex v-center split wrap", () => {
				span.c("drawer-ai-session-name", live_row?.title || "a new conversation");
				if (live_row?.home) a.c("drawer-ai-session-log muted", "log")
					.attr("href", live_row.home.replace(/\/?$/, "/") + "ai/" + live_row.session + ".jsonl")
					.attr("target", "_blank").attr("title", "This conversation's raw file");
			});
			// THE ONE QUESTION THE OWNER ASKED FIRST ("is this a global session?") — answered
			// flatly, every time, because it is always true: every surface shares this ONE
			// conversation (chat.js's `GLOBAL` controller). `card` never makes a second,
			// scoped one — only a hint for its first line — so this never says "scoped".
			small.c("drawer-ai-session-scope muted", card
				? "global conversation — this card is only a hint for its first line; it follows you everywhere"
				: "global conversation — the same one on every page, until “+ New session”");

			$chips = div.c("drawer-ai-chips flex wrap");
			draw_chips(session);

			// The one shared switcher (one-dictation item 4): `chat.js`’s `session_switcher()`,
			// also used by the phone sheet’s head now — one control, not a second hand-rolled
			// copy per surface (CLAUDE.md law 6, “one of everything”). `paint()` reruns on every
			// session change, so the OLD switcher's own subscription is stopped first — the same
			// leak this file's own mount-rebuild comment (below) already guards against.
			switcher?.stop();
			switcher = chat.session_switcher(() => live_chat, { label: "+ New session" });
			div.c("drawer-ai-switcher flex v-center wrap", () => view.chip("drawer-ai-switch-btn"));
		});
	}

	paint();
	const unsubscribe = chat.on_change(paint);
	// The chips' own state can change (an agent falls asleep after 5 idle minutes) with no
	// session change at all to trigger `paint()` — a light poll, same 10s rhythm
	// `ai2/agents.js`'s own card-agents row already uses, stopped the instant the box leaves
	// the page (checked inside `draw_chips`/`fetch_agent_states` doing nothing useful once
	// `$box` is disconnected — `stop()` below clears the timer itself regardless).
	chip_timer = setInterval(() => draw_chips(chat.current()), 10000);

	return { view: $box, stop(){ unsubscribe(); switcher?.stop(); clearInterval(chip_timer); } };
}

/* THE ONE LIVE MOUNT. `ai()` below builds a `chat.js` mount every time the drawer
 * refills this tab — this module-level slot (singleton, like `live_card` above)
 * remembers it so the OLD one gets `remove()`d first, instead of leaking a
 * poller and an `EventSource` on every reopen. A `MutationObserver` plus the
 * `drawer-close` event catch the two ways the mount can leave the page without
 * `ai()` running again: a different tab replacing this one's content, or the
 * whole drawer shutting. Full reasoning: [`doc/chat.md`](/framework/ux/Dictate/doc/chat/).
 * `live_header` (`session_header()`'s own return) is disposed the same way, same moments —
 * see that function's own doc for why it needs disposing at all. */
let live_chat = null;
let live_header = null;
let live_feed = null;   // the feed goes with its chat: one pair, never a feed left behind
let live_view = null;   // Chat v2's chip and box (ChatView.js) and its follow-the-session subscription
let live_view_off = null;
let live_slot = null;   // the box the chat mounted in: emptied with it, so a shut dock keeps no hidden second widget
function dispose_chat(){
	const handle = live_chat;
	live_chat = null;
	handle?.remove();
	live_feed?.stop();
	live_feed = null;
	live_view_off?.(); live_view_off = null;
	live_view?.release(); live_view = null;
	live_slot?.replaceChildren();
	live_slot = null;
	live_header?.stop();
	live_header = null;
}
window.addEventListener("drawer-close", dispose_chat);
// AIPage lets go of the chat it mounted (the token ai() returned), never one the dock mounted since (doc/sheet.md#one-chat-one-feed)
export function release_chat(token){ if (token && live_chat === token) dispose_chat(); }

/**
 * THE DEFAULT — `ux/Dictate/chat.js`'s ONE mount, the exact same call the mobile ✦
 * sheet makes (`Sheet.js`'s `Sheet.Panel`), filling the drawer's full height
 * (`.drawer-ai-panel`, `drawer.css`). "One of everything; don't repeat yourself"
 * (CLAUDE.md law 6, 2026-09-30): no model chooser, no small hint text, no per-card
 * rebuild — `chat.js` owns the ONE global session and redraws its whole history on
 * every mount, on a card or a plain page alike. `sync_card_thread()` (below) is kept
 * as a compatibility no-op for `ai2/card.js`'s own call into this file — `chat.js`'s
 * own `watch()` already keeps every open mount live on its own, so nothing needs to
 * be told to redraw any more.
 */
export default function ai({ page, card, tabs }){
	dispose_chat();   // this refill replaces whatever this tab built last time
	const inbox = new Inbox.Compact({ page });
	let mine = null;
	div.c("drawer-ai flex v", () => {
		inbox.view();
		const view = live_view = new ChatView({ slot: () => live_slot, mount: () => live_chat });
		live_header = session_header({ card, view });
		const $slot = div.c("drawer-ai-panel");
		live_slot = $slot.el;
		const handle = mine = live_chat = chat($slot.el, {
			path: page,
			card: card?.id,
			placeholder: card ? "talk into this card" : "say something",
		});
		live_view_off = chat.on_change(() => view.sync());   // a new or resumed session: Chat v2 follows its file
		view.sync();
		const feed = live_feed = AIFeed.on($slot.el, page);   // this page's events among the bubbles (sheet step 7)
		// The OTHER way this mount's content can leave the drawer: a different tab's
		// own refill clears $slot's own parent out from under it (see the doc above).
		const host = $slot.el.closest(".drawer-body");
		if (host){
			const mo = new MutationObserver(() => {
				if ($slot.el.isConnected) return;
				mo.disconnect();
				feed.stop();
				handle.remove();
				if (live_feed === feed) live_feed = null;
				if (live_chat === handle) live_chat = null;
				live_header?.stop();
				live_header = null;
				if (live_view === view){ live_view_off?.(); live_view_off = null; view.release(); live_view = null; }
			});
			mo.observe(host, { childList: true });
		}
	});
	window.dispatchEvent(new CustomEvent("drawer-chat", { detail: mine }));   // a surface that mounted the chat before this one lets go of its box
	return mine;
}

/**
 * v2 — kept reachable, unchanged: `Widget` (`ux/Dictate/Widget.js`) with its own
 * model picker and the OLD private session wiring this task replaced as the tab's
 * default. Swap it back in by pointing `tabs.js`'s "ai" row at `{ default: aiV2 }`.
 */
export function aiV2({ page, card, tabs }){
	const thread = card ? null : tabs.thread;
	let panel, $hint;
	live_card = card ? { id: card.id, sync: () => panel?.sync() } : null;
	const inbox = new Inbox.Compact({ page });

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
			import("/framework/ai/cards/CardChat.js").then(m => {
				$thread.empty(() => { talk = m.CardChat.chat({ source: () => card.chat_entries(), re: () => card.id }); });
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
