# reply.js — design notes

## Reply system overview
Reply to ONE thing, where it already is. Every item of the hierarchy — an ask card, a decision row, a task card — can carry this control: two small buttons, **reply** and **🎤**, that open a one-line box under that item. What you type or say goes to Claude with the item already explained, so you never have to say which one you mean, and the answer lands under the same item a few seconds later.

`m` is the task's own manifest (an `ext/JSONL` `TaskJSONL`) — the thread is read out of `m.chats` and written back into `m.url`, so the record is the task's own log and there is no second store. `about` is the item: its `kind` and `id` are what the thread is filed under, everything else is what the turn is told about it.

Off the dev server the buttons are not drawn at all and the thread renders read-only — the same rule `ai/AITask`'s Approve and Improve already follow.

## WIRE constant timing
How long the wire gets to take an append. `ai/AITask`'s decisions tab waits the same 2s for the same reason: /imagine/stream/ measures the real round trip at 9ms, and this is the net for a dev server that is up enough to accept an append and not to stream it.

## stamp() timezone handling
An ISO timestamp carrying the reader's own offset, so a line says when it was written where it was written — `toISOString()` would silently move it to UTC. A copy of `ai/AITask/rank.js`'s, on purpose: imports flow DOWN, and `ai/AITask` imports `ext/Ask`, so `ext/Ask` may never import back.

## append() through dev socket
Whole lines into a task's own log, through the dev socket. The return value is true when it took them.

## MINION prompt design
What the turn is asked to be. It is not a chat partner: the owner is looking at the item right now, so the answer is four sentences, and anything they ASKED for becomes lines in the log that show up on the tab within seconds. The turn answers in at most four plain sentences with no preamble or restating the question.

If words asked for something (new work, a choice, anything next session must know), the answer ends with ONE fenced block labelled jsonl, one JSON object per line, carrying exactly one of three verbs: `ask`, `decision`, or `log`. Ids are kebab-case; reusing an existing id AMENDS the item rather than adding a second one.

## threaded replies in Reply class
Built on `ux/Dictate` since 2026-09-19 (was `ext/Ask/mic.js`'s `Mic` directly) — it draws its OWN "no engine reachable" note when neither whisper nor the browser can hear, so this no longer needs the old `!$mic` fallback branch.

## turn_it() session handling
A reply thread resumes ITS OWN session (`chat_session_id`) and, by default, starts that session fresh rather than forking the task's. The prompt already says everything about the item, so a fresh turn answers just as well — and a fork of a session that has been running all day is both expensive and, past the model's context, impossible: one measured $0.18 and came back with the four words "Prompt is too long" (2026-09-18).

`fork: true` opts back in when the task's own history really is wanted; `recover()` catches it when that turns out to be too much.

## harvest() block parsing
A turn answers in prose and may end with one fenced `jsonl` block. The prose is what the owner reads; the block is what the log gets. The block is stripped out of the answer — raw jsonl under a card is not something anybody reads, and the lines are about to appear on the tab as cards and rows anyway.

## log lines in harvested replies
The mastermind reads `log` lines at its next wake, so a reply that left no trace there is a reply it never hears about. If the turn didn't write one, the browser writes it from the answer's own first line.

## Dictation (Reply.Dictation) design
The same machine with a different job: one box at the top of a wall, where the owner talks through what they want and each sentence comes back as its own `ask` card, live. The turn's whole instruction is "split this into asks".

Dictation is not filed under one item — it is about the whole wall — so the thread under the box is every dictation made on this task. ONLY THE LAST EXCHANGE is shown: this box sits at the top of the Asks tab, and its thread grows downward into the wall: after two dictations the cards started below the fold (measured 2026-09-18). It is a control, not a conversation — the receipt for the last thing said is all it owes, and the real record of every dictation is the ask cards on the wall underneath it.

## Reply.prototype.model and tools
On the PROTOTYPE, not class fields, so one line in a page changes the default for every reply control on it — the same move `Picker.prototype.skip` makes. A class field is an own property and an instance would carry its own copy.

`model`: sonnet, because a reply is usually a request to act on and haiku writes a weaker `ask` line. `tools`: none, and that IS the scoping, not the absence of it — the turn never touches a file, it answers, and the BROWSER writes its lines through `rpc:append`, which can only ever reach a `.jsonl` under `public/`. A turn holding Bash or Edit would have the run of the repo to do the same job.

`fork`: whether the reply thread INHERITS the task's own session. Off, because the prompt already says everything about the item and a day-long session is both dear and, past the model's context, unusable.

## Dictation model choice
A split is mechanical work, not judgement: every `quote` is copied verbatim, so there is nothing to weigh. Haiku does it for about a fifth of the money — and on its own prototype, so it stays haiku when a page retunes `Reply`'s.
