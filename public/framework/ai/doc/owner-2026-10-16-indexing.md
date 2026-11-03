# Owner notes, 2026-10-16: indexing and finding past work (dictated, captured by voice-app)

Not a plan, not approved. The owner's words condensed. Related: `past-work-index.md` (by task), `readmes.md`, `module-homes.md`.

## Every directory has an index

`framework/ext`, `framework/ui`, `framework/ux`, `framework/ai`, and the rest are each a directory of things. Each one should carry its own index: every thing inside it, with a brief description of what it does. Call it **indexing**; a skill, maybe a tool, something node makes sure happens.

Subsystems can be sub-indexed stepwise instead of itemising every granular thing many levels deep. The test: if we are digging for something, we can find it. If AI voice work exists, the AI index reveals it.

## Related items

Inside each thing, a list of related things. Simplest: a "Related" list in the readme, one reference per line, using the mention forms we already have (`/path`, `@user`, `#module`). A `.txt`/JSONL file with one reference per line is the alternative. Dependencies especially: whenever a module is used with another, say so, so a search for one finds the other.

## Refine looks up past work

Prompt refinement should look for past work as a step. Sometimes the thing is named and obvious; sometimes the step is "work out what we are talking about", then search the indexes.

## Documentation skill rules (same dictation)

- A class architecture overview writes the full chain inline: `class Page extends Item extends Events(Object)`, never "extends Item" and make the reader look up Item.
- Code changes should trigger the documentation skill, and readmes never go stale. Whether the trigger is the skill being loaded or node queuing a message, the owner leans on node.
- A skill tied to one specific task is suspicious: it is never needed except for that task, and then the task's own doc is the skill. Making sure the right procedure is loaded is node's job, with tools we can reliably invoke.
