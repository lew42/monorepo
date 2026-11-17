# How Lew42 v2 is documented and approved (proposal, 2026-11-16, think-docs)

The question: how can the owner see what exists, what state it is in and how to use it, without walls of text, and how does only approved work become the system? Short answer: **the design shows itself, a Review tag holds the state, and the repo holds the why.** Every other copy is a copy that goes stale.

## Three homes, one rule each

| Home | What lives there | The one rule |
|---|---|---|
| **Figma canvas** | Every master as a specimen: the thing, its name, its Review tag. | A name and a tag, no sentences. (The owner's own note on Big Sloppy's Docs page: "a title plus a grid of small specimen tiles, each with just a name, no other text".) |
| **AI page** | The rules an agent must read before it touches the file. | One screen: the 5–7 rules lint can't check, plus "run lint, zero errors". A rule lint checks is not written twice. |
| **Repo `doc/`** | Why, decisions, recipes, lint, and the approvals record. | One doc per topic, current state only. A plan that has landed gets merged into its topic's doc or archived. |

The Live page is not a fourth home: it is the owner's inbox. It shows **one thing waiting for him** (the "One simple thing" card) and **what is in flight**, nothing else.

## The approval loop (two clicks for the owner)

1. **Build:** one builder makes one thing as a `Specimen` with Review = Draft. Lint must report 0 errors.
2. **Check:** a different agent runs lint and looks at 1:1 crops of each section. A reviewer can't approve anything; it only sends the work back, or passes it into the "One simple thing" slot. One item at a time.
3. **Decide:** the owner opens Live and flips the tag (click the dropdown, then Approved), or picks Rejected and dictates why. The note goes into the specimen's Notes slot.
4. **Record:** a read-only `use_figma` script, like `lint.js`, reads every Review instance and writes `doc/approved.jsonl` (node id, name, status, date). Code writes this record, never an agent's memory. The tag is the only switch.
5. **Enforce:** a new lint rule, `unapproved`, flags any instance of a master that isn't in `approved.jsonl`. `roots` moves the approved master into its Components folder, and the next item takes the slot.

Why this fixes today's failures: reviewers passed bad work because they could also say "done", and now only the owner's flip counts. The owner lost track because the board was typed by hand, so "In flight" should be generated from the agents' task logs, not typed.

## Delete or archive (nothing is lost: git and the Archive page keep it)

- **Live page:** "Done · archive (32)", "Done today (46)", the 14-card "Demos to review" grid (one queued item replaces it) and the Consolidation plan card (it belongs in the repo).
- **AI page:** the Connectors frame (connectors are now banned outside Archive) and the Rules frame, which repeats `build-checklist.md` almost line for line (the sidebar rule appears twice). Drop the Systems map's "Lives:" lines and the Pages frame: both go stale as soon as `roots` moves masters.
- **Repo:** `approval-strategy.md`, `consolidation-plan.md` and `simplify-proposal.md` are three plans for one job. Merge them into `approval-strategy.md` and move the other two to `doc/archive/`. Cut `build-checklist.md` (1,885 words) down to what lint can't check. `page-audit.md` and `master-pass.md` are dated reports: archive them once they have been acted on.

## First change to make

**Make the Review tag the one source of approval.** Write the `approved.jsonl` sync script and the `unapproved` lint rule, then cut the Live page down to "One simple thing" plus a generated In-flight line. That one change makes the system's state visible, stops typed values from going stale, and makes "only approved things become the system" a rule that code enforces.
