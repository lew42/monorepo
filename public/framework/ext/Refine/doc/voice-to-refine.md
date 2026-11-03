# Voice to refine: a proposal

**The idea in one line:** a long prompt you dictate through the voice tunnel gets the same two steps as the Refine demo, and the refined result shows up on [/live/](/live/).

This is a proposal only. Nothing here is built. How the pieces work today is in [how-it-works.md](how-it-works.md).

## Today's path, in short

- A phone talks to the PC through the tunnel. `Server/Tunnel.mjs` forwards one path, `/mcp/remote`, to `RemoteMCP` (`Servex/ext/remote/RemoteMCP.js`). That class has one tool, `ask_mastermind`.
- The steps are `run_refine()` (`Servex/ext/refine/run.js:30`), which the Refine buttons and Echo already share.
- A session page gets each stage from `VoicePage` (`Servex/ext/refine/VoicePage.js:19`).
- `/live/` is a feed: its `page.jsonl` is written by the voice mastermind through `page_log`, `page_add` and `page_set` with `path: "/live/"` (`public/live/readme.md`).

## The smallest slice

One change, in one place:

1. **In `RemoteMCP`'s `ask_mastermind` handler**, when the spoken text is long (the threshold is a guess, start with 40 words), save the text first and call `run_refine()` in the background. The reply to the phone stays an instant ack, as the voice agent's instructions already require.
2. **`run_refine()` does the work unchanged.** Clean, structure and clarity all run as they do for the Refine buttons. Law 6: one pipeline, no second copy.
3. **Write the result to `/live/`** with the page tools (`path: "/live/"`), one `page_add` for the refined card, the same way the voice mastermind already logs.

Done when: one long phone prompt produces one refined card on `/live/`, and a second check on the PC shows the same card on the session page.

## Which class owns each hop

| Hop | Owner | Why this one |
|---|---|---|
| Phone → tunnel → `/mcp/remote` | `Server/Tunnel.mjs` (gateway), `RemoteMCP` | already does this; the bearer token stays as is |
| Save the text, decide "long" | `RemoteMCP` | it already receives the text |
| Clean, structure, clarity | `run_refine()` (`run.js`) | the one shared pipeline |
| Stage lines on the session page | `VoicePage` | already the single writer for voice stages |
| Card on `/live/` | the page tools (`page_add`, `page_set`) | `/live/` is a `Page` fed by its own `page.jsonl`; the tools are the only writer |
| Reply the phone gets on its next ask | `RemoteMCP`, through `remote-replies/` (`RemoteMCP.js:33`, `%LOCALAPPDATA%/lew42/servex/remote-replies/`) | the existing "results arrive on the next ask" rule |

## Risks

- **The one-minute window.** The tool answers within a minute. A long prompt can take longer than that across several Haiku calls. The phone must get the ack, and the card comes later. The voice instructions already say this ("minion results arrive on your next ask").
- **A dropped tunnel loses speech.** If the connection drops mid-prompt, only what was saved is kept. So save on first arrival, before any model runs.
- **Two writers for one prompt.** The phone and a Dictate session could both send the same words. Use one prompt id (`RefineSystem.new_prompt_id()` style) so a second send updates the first.
- **Cost.** Each refine is a few Haiku calls (clean, structure, clarity, notes). A long prompt costs real money, so keep the spend guard on and log the cost in the reply.
- **Remote Control sessions** do not offer voice mode at all (`ux/Dictate/doc/voice-bridge.md:7`). This works only for the tunnel path.
- **Unknown reader.** Nothing reads a session page into `/live/` yet, so the page tools must write `/live/` directly. Decide that before building.

## Decisions taken here (the owner may change them)

- Threshold 40 words, a guess to be measured, not a rule.
- Write to `/live/` through the page tools, not a new feed.
- Reuse `run_refine()` and `VoicePage`; build no second refine.

Not built, and no action now.
