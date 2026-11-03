# Findings: where V3 came from, what it does against what you asked, and whether the fast seat can pause

## 1. Where you asked for V3

**You asked in voice session [v-9dvbbrn](/framework/ai/sessions/2026/10/25/v-9dvbbrn/) on 2026-10-26, from 15:44 to about 17:07.** The first line was "We need a V3. I thought I'd ask for that." (15:44). The agent that built the rough draft wrote down your 17:07 correction: keep it MVP, no per-sentence Prompts, no new data shapes, V3 is only a view over the `tasks` list ([its brief](/framework/ai/sessions/2026/10/25/session-5644835c/mastermind-v3-draft/requirements.md)). It merged the same day.

Your three asks, in your own words from that session, checked against V3 today:

| You asked | Your words (time) | V3 today |
|---|---|---|
| **Raw Whisper words in the cards, in real time** | "the raw whisper transcriptions need to be streamed onto new prompt cards as they're created" (16:17); "light gray to black should be reserved only for the whisper finalization" (16:26) | ⬜ **Partly.** The unsent words show as a faint draft, but only because V1 stays mounted underneath. Sent words stay gray for 8 s of quiet, a timer, not Whisper's final. |
| **Refined clean sentences, each with its own id** | "I don't know if we want to ID each sentence" (16:19); "prompt.clean can be the markdown", "as close to verbatim as possible" (16:39) | ⬜ **Partly.** Each Prompt has a cleaned `text` (smart seat) and `paragraphs` (code), but no per-sentence id. You were unsure about ids yourself, and your 17:07 correction said no per-sentence Prompts. |
| **Titles and summaries with 100% prompt coverage** | "every sentence of every prompt assigned to an outcome... a coverage indicator that should be 100%" (16:20); "the smart assistant should keep its own completion at 100%" (16:22) | ⬜ **Titles yes, summaries and coverage no.** Each Prompt card has the smart seat's title. There is no summary card over several Prompts and no coverage number in V3. The session page's Coverage tab ([ext/Refine](/framework/ext/Refine/doc/refine-queue.md)) is the only coverage view. |

**And the bar you set, V1's live streaming:** V1 shows the words growing in the bubble and every reply. V3 shows 6% of replies (the ones written into a Prompt); the other 94% are `{chat}` lines it never reads.

## 2. Can the fast seat pause?

> **Reversed the same day (2026-11-01):** the owner kept the fast seat on ("turning it off isn't going to fix anything… put them to work", prompt `qrct21sx` in [session.jsonl](session.jsonl)). The default is `voice` again; `off` stays as a switch. What follows is the reasoning for the one-day pause, kept as a record.

**Yes. Nothing that matters still depends on it.** It is the `voice-assistant` role (Haiku), woken once per sentence. What it writes, and who reads each:

| It writes | Read by | If it stops |
|---|---|---|
| `{place}` lines, with a cleaned copy of the sentence | V1's bubble only (`Widget.place`) | V1 shows the raw sentence instead of the cleaned one |
| `{summary}` lines | V1 only | V1 loses its folded summaries (rare: 99% of places are "same") |
| Question tasks for a "?" sentence | V1, V2, V3 | **Kept:** code files them instead (below) |
| the Prompt's `paragraphs` | — | Nothing: `Sessions.say()` writes those itself, not the seat |

- **Prompt refining does not read it.** `ext/Refine` and the Coverage tab read the owner's prompts, never `{place}`.
- **The smart seat never sees its output.** The smart seat gets the raw sentences (echo mode, [answers.md §3](../dictation-map/answers.md)).
- **`Follow.heard()`** counts `{place}` lines as "heard" when waking a session's own seat; with no `{place}` lines it simply wakes on the owner's lines, as before.

**What changes:** `off` joins the switch's words (`voice`, `fast`) and becomes the default, and a sentence ending in "?" files its Question in code. It takes effect at the next Servex restart, never during a voice call. Going back is one word, `voice`, in `%LOCALAPPDATA%\lew42\servex\session-assistant.txt`.

## 3. What changed

**On michael/dev already** (for the owner's walk):
- **A tap unlocks read-aloud** (057f98333): a phone refuses sound that starts without a tap, and a reply starts from the network. The first tap anywhere now unlocks Recite's audio. Review: [tap-unlock/](tap-unlock/).
- **V1 reads every new reply aloud**, whether it came on the live wire or the file poll, and Recite logs one `recite` line per step to [the Whisper log](/framework/audio/Whisper/log/). Review: [recite-trace/](recite-trace/).

**On worktree/dictation-v3** (merged with this review):
- **One version dropdown**, `Chat V1 ▾` (V1, V2, V3), built like the session dropdown; V1 stays mounted, so dictation never stops on a switch ([shot](shots/sheet-dropdown-400-menu.png)).
- **V3 shows every reply** (old-style `{chat}` replies placed by their `re`), the reply as it is written, solid text once written, a brighter draft, and no link icon. 23 checks pass.
- **The karaoke playhead**: `Recite.Highlight` lights the sentence and the word being read in the chat, and the bar shows them on its own line.
- **The fast seat was off by default for a day, then back on** (`voice`, the owner's ruling); code files a Question for each "?" sentence only when the seat is `off`.
- **Replies fit to be read aloud**: the smart seat is told no tables and no bare paths.

**Not built yet** (queued in [plan.md](plan.md), in the owner's order): voice and speed in the settings with a Sample button, "switch your voice", the echo guard, speech from the first words, Chatterbox and one-engine supervision, V3 paragraphs, the send outbox.

## 4. The phone ran an old Sheet.js (2026-11-01)

The owner's phone heard nothing because Chrome served it a `Sheet.js` from days before, straight from its HTTP cache, with no request at all. The page check of run mvyn29c5po2 showed it: status 200, 0 bytes over the wire, 28,512 bytes of body, while the current file is 33,987 bytes. The cause was an older reply that carried no `Cache-Control`. After a manual cache delete, the owner heard the voice (20:33). The fix makes sure no phone needs that again: the site gateway clears each browser's HTTP cache once, on its next page load (`Clear-Site-Data: "cache"`), and never touches cookies or storage. How it works and its proof: `Servex/ext/remote/doc/tunnel.md`, "No stale files on a phone", `node Server/SiteGateway.cache.test.mjs`.
