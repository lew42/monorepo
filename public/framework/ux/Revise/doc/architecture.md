# Revise architecture — prompts by name, never by full text

`Revise.run()` turns rambling speech-to-text into polished text at one of three levels: clean (typos and filler only), edit (tighter sentences, same voice), or summary (reorganized). Entry: [`Revise.js`](../Revise.js). The level API is extensible — callers add custom `{prompt, model}` objects with no change to core code.

## Prompt text lives in Servex, never sent over the wire

**Decided:** built-in levels are named strings (`"clean"`, `"edit"`, `"summary"`); `Revise.run()` sends only the name to Servex, which owns the real prompt text.
**Why:** the browser and server can never disagree about what revision actually ran. With no build step to share one prompt file, keeping the text on the server side only is the cheapest way to avoid two copies.
**Instead:** send full prompt text (server and browser could diverge) or a build step (forbidden; production is static).
**Detail:** [`Servex/agents/tidy.js`](/Servex/agents/tidy.js) — the real prompts; display copies in `Revise.js` are for this page's demo and for callers writing custom levels.

## Levels are extensible objects

**Decided:** `Revise.LEVELS` is a plain object; callers add a new level by assigning `{ label, hint, prompt, model }` with no change to this file or Servex.
**Why:** three levels (clean, edit, summary) cover most uses; custom levels for edge cases avoid bloating the core.
**Instead:** a registry or a configuration file (extra machinery for a rare case).
**Detail:** readme § The three levels, and call signature in `Revise.run()` line 82.

## Never throws — always returns {ok, why}

**Decided:** network failure, Servex being down, or a bad response all return `{ok: false, why}` in plain words; the method never throws.
**Why:** callers (the dictate path, this page's own demo) should be able to say plainly that revision isn't available rather than crash.
**Instead:** throw and let callers handle exceptions (requires every caller to try/catch; plain language is harder).
**Detail:** try/catch at `Revise.run()` line 90; valid response paths at lines 98–100.

## View shows saved example first (show, don't tell)

**Decided:** `Revise.View` renders with a pre-filled saved example, not an empty form, so what this page does is visible on arrival.
**Why:** a page should show what it does before it explains it; a reader sees the result on arrival and edits from there.
**Instead:** describe the three levels in text and let the user type their own sample (discovery requires effort).
**Detail:** [`Revise.js`](../Revise.js) line 187–190; SAMPLES constant line 113–116; SAVED_EXAMPLE line 124.
