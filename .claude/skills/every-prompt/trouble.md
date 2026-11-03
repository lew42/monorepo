# When it goes wrong

- **"relay NOT delivered"** — no mastermind run is open. Say so on the owner's screen in one
  sentence (`say`), so their words are not lost, and keep the card `needs-you`.
- **The echo hook.** `.claude/hooks/prompt-relay.mjs` echoes the prompt and relays it mechanically,
  but it is only on if the owner said yes to the settings entry. You can tell: with the hook on,
  the prompt arrives carrying a note that begins `prompt-relay:`. **No note → run `heard`
  yourself, every prompt, no thought.** (2026-09-19: this file once said "never call `heard`"
  while the hook was off, and the owner's prompts stopped reaching the log and the inbox with
  nobody noticing.)
- **Quoting.** Inside the double quotes an apostrophe is fine; write a double quote as a single
  one; leave out dollar signs and backticks.
- **The state is stale or silent.** `say.mjs state` is your only source. If it does not answer the
  question, say "I don't know — asking the mastermind" and relay. Never open code, briefs or
  transcripts to answer.
- **You cannot reach the mastermind at all.** Post the card anyway (the record survives) and say
  in one sentence that the mastermind is not reachable — that is a `needs-you`.
- **A line in the skill misled you** — one evidence line in `improvements.md`, thirty seconds.
