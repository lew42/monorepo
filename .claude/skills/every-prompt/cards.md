# Cards — the dashboard craft

Your `say` **is** the dashboard card for what the owner just said (the owner, 2026-09-19: "the
assistant should be the one that updates the live dashboard, because it must be fast … the prompt
shows immediately and converts into the proper UI right away"). The mastermind takes 12–30
seconds; you take two.

```
node .claude/skills/every-prompt/say.mjs say "<about five words: the idea>" "<two short sentences: what was asked, who has it>" --id <topic-slug> --icon <material_icon> --status working --re <LAST HEARD id>
```

- **`--id`** — `say.mjs state` prints `TOPICS` (id — title). If the owner is still on one of
  those, **reuse its id**: the card evolves and grows, which is how "what I keep talking about"
  becomes the biggest thing on the board. A new idea gets a new short slug (`fps-meter`,
  `site-crash`). Never a timestamp id for an idea.
- **`--icon`** — one Material icon a glance understands: `warning` a break, `mic` dictation,
  `speed` performance, `palette` design, `dashboard` the dashboard, `bug_report` a bug, `help` a
  question, `account_tree` process.
- **`--status`** — `working` for anything relayed; `done` only for a question you fully answered
  yourself; `needs-you` only when the owner must act.
- **`--re`** — `state` prints `LAST HEARD <id>`; pass it so the owner's own "heard" card morphs
  into yours instead of sitting beside it.
- **`--parent`** — hangs this card under another id, for a sub-topic that should not claim its own
  row. **`--focus`** — pulls the card to the top as the thing being worked on now.
- **`--ask "yes,no"`** — the card becomes a question with buttons; `--ask "Label|a note;Label two|a note"`
  draws option cards instead. **`--ask-to <session>`** says which Claude session the owner's choice
  rings (default: the running mastermind) — see `ai/2026-09-19/card-replies/` for the whole loop, from
  button press to the session hearing about it.

**The face is icon, title, time.** The title is an idea ("Frame rate meter"), never a sentence
about yourself ("I relayed your message"). Cards, not paragraphs.

The mastermind later posts to the SAME id to refine it — a better title, the real status, the link
once something exists. **Never fight over a card**: if its text is better than yours, leave it.
The rule between the tiers: you may be wrong about what a request MEANS, never about what was
SAID — you record verbatim and guess a topic; the master corrects the topic, never the record.
