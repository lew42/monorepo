Same image, second question — and the rule changes here.

**You may now read files, and you should.** Your first instruction ("never open or read
any other file") governed the critique: it kept your eyes on the picture. That is done.
This turn is about the code behind it, so `Read` is not just allowed, it is the job.

The screenshot came from:

PAGE: {{url}} at {{width}}px wide
REGION: {{sel}}
DOM (tag + classes, two levels down from the region):
{{outline}}

## Read before you answer

Required, in ONE batch of `Read` calls — reading them one at a time is six round trips
for the same bytes:

- `public/framework/framework.css` — the utility vocabulary and the tokens
  (`--gap --column --measure`). Most "new" rules already exist here as a word; a fix that
  reinvents a utility is a wrong fix.
- `.claude/skills/css/SKILL.md` and `.claude/skills/layout/SKILL.md` — the house rules you
  are held to.

Only if a finding actually needs it, in the same batch:
`public/framework/core/Page/Page.css` (anything inside a page — tracks, previews) ·
`public/styles.css` (the site skin, `@layer site`) ·
`public/framework/styles/layers/theme/lew42/lew42.css` (colour and type) ·{{module}}
`public/framework/styles/doc/layout-system.md` (the five layout words).

## Answer — one entry for EVERY finding, no exceptions

Each finding you just made carries a `fix`: a **direction**, a **property** in plain
words, and an **amount**. Your job is to translate it into the smallest CSS that moves
that property in that direction — or to say, having read the code, that it should not
move at all. Those are the only two answers. **Never return nothing, and never return
fewer entries than you had findings.**

**A. The delta** — `{"what", "sel", "decl", "why", "ladder_rung"}`.

- One selector, one to three declarations. No `!important`, no `>` chains, no `:has()`.
- The selector must be a class you can see in the DOM above **or** in a file you read.
- Climb the ladder and stop at the first rung that works: change a **token** first
  (`--gap`, `--column`, `--measure` — a subtree redeclares it, no specificity war), then
  an existing **rule's value**, then claim an existing **class** you can see is available
  (`wide`, `bleed`, a layout word). A new rule is the last rung, not the first.
- Size the change to the `amount`: "a little" is one step of an existing scale, "a lot"
  is two, "to match X" is literally X's value — go read X's value and use it.
- If the honest rung is markup or a component that does not exist, say that in `why` and
  leave `decl` empty — but you must still return the entry.

**B. The retract** — `{"what", "retract": true, "why"}`.

Use it when the code says the finding was wrong: the CSS is already what the fix asks,
the value is a deliberate token (a capped `--measure`, a muted tier that clears contrast),
or the picture misled you about a distance you can now read. **A retract is an answer, not
a refusal, and not a failure** — it is the most valuable thing this turn produces, because
it is the only place the code can correct the eye. Say what you read that changed your
mind, in `why`.

One fenced JSON block, nothing before or after it. **Under 400 words total** — no
commentary, no restating the finding, no narrating what you read:

```json
{"fixes": [{"what": "…", "sel": ".page-preview", "decl": "padding-block: var(--gap)",
    "why": "…", "class": "broken", "ladder_rung": "module css"},
   {"what": "…", "retract": true, "why": "`--measure: 40em` caps prose on purpose"}],
 "skill_notes": [{"skill": "css", "note": "…"}]}
```

- `what` — repeat the finding's `what` verbatim, so it can be matched back. Same order,
  same count as your findings — **one entry each**, delta or retract.
- `ladder_rung` — where the fix sits on the css skill's ladder, exactly one of:
  `nothing` · `utility` · `layout word` · `component class` · `module css` · `site css`.
  Omit it on a retract.
- `why` — what the reader will see change, or what you read that retracted it.
  **At most 12 words.**
- `skill_notes` — usually empty. One line for anything in the two skills that **misled you
  on this page**: what should change, and the evidence you just hit. Not praise, not a
  summary, not a wish — only a correction you can point at.
