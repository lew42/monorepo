# Docs check: does the AI system docs chain make sense?

Read the chain root to leaf (root `CLAUDE.md` → [`framework/readme.md`](/framework/) → [`ai/readme.md`](/framework/ai/)) and the System tab it describes ([`overview.js`](/framework/servex/fs/?file=public/framework/ai/overview.js), [`concepts.js`](/framework/servex/fs/?file=public/framework/ai/concepts.js), [`objects.js`](/framework/servex/fs/?file=public/framework/ai/objects.js)).

**Verdict: mostly yes — one real bug, two small gaps.**

## The one real bug: the CLAUDE.md this directory loads is stale

`public/framework/ai/CLAUDE.md` is meant to be an exact copy of the root `CLAUDE.md`, refreshed by `node public/framework/ai/skills.mjs`.

It wasn't current. It was missing **Laws 5, 6 and 7** and the whole **"Systems that shape every turn"** section — both live in the root file today.

That's not just a stale display page. It's the file Claude Code itself loads for any agent working in this folder, since it's the nearest `CLAUDE.md` above `public/framework/ai/`. Until the sync script reruns, those agents work three laws short.

**Fixed:**

```
node public/framework/ai/skills.mjs
```

Root and `ai/CLAUDE.md` are now byte-for-byte the same.

Small bonus finding, not yet fixed: `skills.mjs` writes that copy twice in a row (lines 33–34 and 36–37 are an exact duplicate) — harmless, a one-line cleanup next time the file is touched.

## Two small gaps in readme.md's own description of the System tab

`ai/readme.md`'s one line on the System tab names eight sub-pages, but misses two that exist and are linked from the tab:

- **Readmes** (`/framework/ai/readmes/`) — the chain itself, and how to read it.
- **How thinking works** — reached from the Models page, explains the `effort` knob.

A readme points, it doesn't explain — but naming all eight is still the line's one job.

## Everything else holds together

- `concepts.js` and `overview.js`'s `FLOW` tell one coherent story — you speak → the assistants hear it → it becomes an ask → a mastermind takes it → minions build it → it's reviewed and merged → you see it on the card — every step links to its own page.
- `objects.js`'s chip/row/panel pattern is used the same way by Skill, Ask and Task.
- The new "Data: how it's written" and "How a page saves" pages say plainly that they're snapshots that go stale, and name the fix: re-check against the code. That's Law 7.
