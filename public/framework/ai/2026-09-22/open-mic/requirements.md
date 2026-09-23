# open-mic — the mic stays on; every finished sentence is transcribed and routed as it ends

Minion: Sonnet, effort high (budget mode — no Opus). Session id
`81c5e98b-ce60-493e-8db8-24d17caef851`. You are IN A WORKTREE (the launcher says where; your
server's port). Read [`../mastermind-servex/common.md`](../mastermind-servex/common.md)
first. Load `code`, `ui-test`. Dispatch: after 19:39 (the session window resets).

## The owner's words (2026-09-22 18:50, verbatim excerpts)

> as I would transcribe, it would put the text under the text area, which is kind of weird,
> and then it moved the text from underneath the text area into the text area and then
> submitted it automatically all at once. The user experience that needs to happen is that I'd
> like to be able to just turn on the mic and even just leave it on kind of indefinitely — live
> open mic — and it just gets transcribed continuously, no matter what I say. And then a fast
> assistant is listening and deciding how to route those messages. Maybe a master assistant,
> a slower assistant, is also getting the full transcription just to have a secondary opinion.
> The fast assistant can render summaries on the page.

## What exists

`ux/Dictate/Dictate.js`: a segment streams as grey partial text under the box (`draw_caption`),
`commit(text)` moves it into `$input` and posts a `prompt` line to Servex (`post_prompt`); a
"stop after a pause" checkbox (off by default) ends the session on silence; AI 2's
`compose.js` and the board's composer mount it and Send posts the box. Servex's fast assistant
answers every `prompt` line with `name`/`card`/`refined` (`prompt-lifecycle`); the master
assistant role exists (`Servex/agents/roles.js`, skill `master-assistant`) but nothing feeds it.
`talk` (landing now) shows words streaming into one card.

## Deliverables

1. **Open-mic mode in Dictate** (`mode: "open"`): the mic stays on until pressed again; each
   finished sentence commits on its own — posted as a `prompt` line the moment whisper returns
   it — and is shown as a settled line in the caption stream; **nothing is ever written into
   the text box and nothing is auto-submitted** (the box is for typing; in open mode it stays
   empty and enabled). The caption stream is the card the owner watches (in `talk` and in AI
   2's composer): partial grey, settled solid, appended, never moved. "Stop after a pause"
   becomes irrelevant in open mode and is hidden there.
2. **Routing by the fast assistant.** Each `prompt` line already gets a `card`; add one field
   to the assistant's brief (`Servex/agents/assistant.md`): a `route` on the card —
   `{route: "note" | "task" | "question" | "correction", re: <card id it continues, if any>}` —
   so a sentence that continues an earlier topic evolves THAT card instead of making a new one
   (the id the assistant names; the appender's naming checks still apply). The AI 2 inbox and
   `talk` show the route as one small word on the card.
3. **The master assistant listens.** Servex keeps one `master-assistant` agent alive (like
   `assistant-fast`; Opus is NOT allowed in budget mode — use `claude-sonnet-5`, effort medium,
   and say so in a `decision`); every `prompt` line is sent to it as well; it answers only when
   it disagrees with the fast assistant's route or name — a `dispute` line (the appender
   handles it) — or when a whole thread deserves a `refined` summary of its own (at most one
   per five prompts). Measure its cost per ten prompts and log it; if it exceeds $0.10 per ten,
   make it every-other-prompt and log that instead.
4. **Proof (fake mic, `--use-file-for-fake-audio-capture` with a longer clip: concatenate
   jfk.wav three times with a node script into a 33 s wav):** open mode on `/framework/ai/talk/`
   and on AI 2 — three sentences commit as three `prompt` lines while the mic stays on; the
   text box stays empty; the second and third sentences (which continue the first) evolve one
   card, not three (log the ids); the master assistant produced 0–1 lines; screenshots at
   1280 and 400; zero console errors.

## Fence

`public/framework/ux/Dictate/Dictate.js` (+ readme/doc), `Servex/agents/assistant.md`,
`Servex/agents/Assistant.js` (the master listener — Edit only; restart Servex hidden via
`Servex/sustain.mjs --stop` then PowerShell `Start-Process … -WindowStyle Hidden`; never
`cmd /c start`), `public/framework/ai2/compose.js` and `public/framework/ai/talk/**` ONLY for
the caption-stream mount (Edit; both are other minions' landings — re-read before each edit),
your task dir. Land by the launcher's patch with hold `--paths` on the exact files, seconds.

## Length

Under 200 new lines. Landing report: five sentences, the ids that show one evolving card, the
master assistant's cost.

## Also (18:56): mixed clocks on one log
Whisper prompts stamp `at` with `new Date().toISOString()` (UTC, "23:51") while typed ones and
Servex stamp local time with offset ("18:51"); the same log shows two clocks. Dictate's
`log_prompt` must let Servex stamp `at` (send none) or use the local-offset format `say.mjs`
uses. One line; prove the next prompt's `at` matches the typed one's format.

## Owner addendum (19:03) — items 5–6

> the microphone should generally be open, so whenever I'm saying something I don't have to
> click to talk, and it's contextual: whatever I have selected, it automatically gets routed to
> the best place. But I might forget what I have selected or start talking about something
> unrelated — so it should go through a routing mechanism like the fast assistant, who can see
> the context and judge whether this is the proper place; a caveat could reference something
> else. Turning specific tasks, pages, extensions into linkable icons — when I say "AI two
> dashboard" the transcription turns it into a little link.

5. **Routing with judgment.** The selected card/section is the DEFAULT `re`; the fast
   assistant sees it (the composer sends `selected: <id>` with each prompt) and may override:
   when a sentence plainly belongs elsewhere it routes `re` to that card (or a new one) and
   says so in one small line on both cards ("filed under X — put it back?" with one click that
   re-routes). Prove: with card A selected, a sentence about A stays in A; a sentence clearly
   about B lands in B with the re-route line.
6. **Mentions become links.** The assistant gets the site's page index (`/directory.json` or
   the framework's page titles — whichever is one fetch) and, in its `refined` text and the
   card title, wraps a mention of a page, task, module or card in a link (`[AI 2](/framework/ai2/)`,
   `[grip](/framework/ext/grip/)`); the board renders markdown already. Prove with three
   sentences naming "AI 2 dashboard", "the grip" and "the talk page" → three links that resolve
   (200). Keep the matcher to titles and slugs; no fuzzy magic.

## Owner addendum (19:45, verbatim excerpts) — items 7–8, do these FIRST

> On the new card I started transcribing and it made a new line in the middle of a sentence —
> whisper or the UI? We need to iron out that process, with a workspace where we start simple:
> just what whisper outputs — it streams a guess and then updates it. Also on the new card I
> said "hello, can anyone hear me?" — it transcribed it into the card, but nobody responded. I'd
> prefer a response instantly, or near instantly.

7. **A card-directed sentence gets an answer, typed.** Measured at 19:40: prompts with
   `re: topic-…` DID get assistant events within 4 s, but every one of them has NO `type` (and
   no title/text) — so the board renders nothing and the owner sees silence. Read
   `Servex/agents/assistant.md` and `Assistant.js`'s tool: when `re` is set the assistant must
   append (a) a `reply` line `{type: "reply", re: <card>, text: <one or two sentences answering
   or acknowledging>}` within ~2 s, and (b) the card's `refined`/`name` evolution as before —
   every event with a `type` from `events.md`, enforced in `Assistant.js` (drop and log any
   event without a type; count them). AI 2's card page shows a `reply` under the transcript
   line it answers. Prove: POST "hello, can you hear me?" with `re` → a typed reply on the card
   within 3 s; zero typeless lines in the log after the fix.
8. **No line breaks mid-sentence.** Dictate commits a segment when whisper's text ends in
   sentence punctuation (or after a silence longer than the pause window), joining consecutive
   whisper segments into one line until then; a partial that is later revised replaces the
   grey guess in place (whisper streams a guess then updates it). Prove with the 33 s JFK clip:
   the transcript shows one line per sentence, none broken mid-sentence; log where the old
   breaks came from (whisper segment boundary vs the UI's segment close). The recordings
   workspace (`/framework/ai/2026-09-22/record/`) gets a "raw whisper segments" pane showing
   each segment with its times, so the owner can see exactly what whisper output.

**Item 7, the exact cause (19:48):** the assistant's tool handler writes the event as a STRING
inside a field — `{"at": …, "event": "{\"type\":\"card\",\"title\":\"Checking Connection\",…}",
"id": "undefined-muddlyc1", "by": "assistant-fast", "re": "p-106"}` — so `type`, `title`, `text`
sit unparsed and `id` is `undefined-…`. Since `card-to-task`'s change to `append_prompt_event`
(or the SDK passing the argument as a string), the handler must `JSON.parse` a string `event`
(and reject one that does not parse), spread it, and build the id from the parsed type. Fix
in `Servex/agents/Assistant.js` (Edit; re-read first — `card-to-task` edited it at 19:2x), then
prove the typed reply and re-fold the 19:39–19:41 lines if cheap (the owner's "can you hear
me?" card should show its answer).

## Owner addendum (19:50, verbatim excerpts) — items 9–11 (yours: Dictate + ai2/compose.js)

> The microphone at the top of the left column on AI 2: I said "testing, can you hear me?" and
> it immediately created a new card with just that; then "are you still listening?" — it didn't
> appear to still be recording. The UI flickers as it hears something; the microphone icon
> itself should turn the primary color when it's on, so we know which one is toggled on. Same
> for the per-card transcribe. We don't want a paragraph split into two, or a sentence split.
> Let's lean into the per-card transcribe for now: remove the rail's transcribe-everything mic;
> keep the New card button with a little checkbox for auto-transcribe (turn on the microphone
> when we create a new card — the default now, but make it an option and a reminder).

9. **The mic looks on.** Every `Dictate` button: when listening, the icon and its ring are the
   primary colour (`--prim`), solid, not flickering with sound — the level bar beside it is the
   thing that moves; off = the plain icon. Applies to every mount (AI 2 card page, talk, bench,
   the board's composer). Prove with two screenshots per mount, on and off.
10. **AI 2's rail composer loses its mic.** The box at the top of the rail is typed-only (it
    still starts a new card on Send); the mic lives on the card's page (per-card transcribe).
    Beside `+ New card`: a small checkbox `auto-transcribe` (default on, remembered per
    browser) — when on, creating a card starts its mic; when off, the card opens silent and
    the owner presses its mic. In `public/framework/ai2/compose.js` (+ the rail's New-card
    code in `page.js`, Edit, re-read first) — this is how AI 2 mounts Dictate, not Dictate.
11. **One card, one conversation — and no split sentences.** With the rail mic gone, item 8's
    commit-on-sentence-end rule is what stops "testing, can you hear me?" / "are you still
    listening?" landing as two cards or two broken lines: inside a card's page every sentence
    appends to that card; paragraphs break only on a pause longer than the pause window (log
    the number). Prove with the 33 s clip: one card, three sentences, no mid-sentence break.

## Owner addendum (19:55) — item 12: archive, never delete; and proofs never touch the live board

> There are four new cards labelled "you" that I didn't make. We probably want a clear or
> archive feature — we don't necessarily want to delete things, but a clear button.

Those five `topic-…` cards (board.jsonl lines 610–615, 19:28–19:35) were made by the AI 2
minion's headless proofs pressing `+ New card` against the LIVE board. The mastermind has
appended `status: "archived", author: "proof"` lines for them (merged by id).

12. **Archive.** In AI 2's fold (`inbox.js`, Edit): a card whose newest line has
    `status: "archived"` is hidden from the rail and from the counts; a small `archived (n)`
    word at the rail's foot shows them (greyed) on click. On every card page: one small
    `clear` control that appends `{card: {id, status: "archived", by: "owner"}}` through the
    same write the board uses (say.mjs's shape / `POST /log/prompts` for prompt-born cards —
    whichever the card came from; the fold reads both). Nothing is ever deleted. Also: AI 2's
    `+ New card` writes `at` as UTC "Z"; use the local-offset format every other writer uses
    (same fix as the Dictate clock). Prove: the five proof cards are gone from the rail and
    counted under `archived (5)`; `clear` on a test card hides it; reload keeps it hidden.
