# Coverage

One row per clean sentence, built mechanically from the citations `structured.md` and `brief.md`
already carry — only the *uncited* rows below ("context only" / "dropped, because …" /
"unclassified") came from a model classification pass; every other row, and every flag, is a
plain word count against the transcript, no model call.

## Sentence coverage

| S# | sentence | -> |
|---|---|---|
| S1 | All right, so if there's a bunch of dev servers running that don't need to be, that's a mistake. | ask #1 |
| S2 | File a complaint with the system designer. | ask #1 |
| S3 | This comes down to that whole functionality and having AIs forget to start or stop things. | ask #2 |
| S4 | We don't want to rely on the AIs to remember to do everything because after they get deep in thought, planning and building, they tend to forget to wrap things up. | ask #2 |
| S5 | So we need either a loop or some sort of awaken or you could try and engineer some agentic solution to that. | ask #3 |
| S6 | However, if any task that started has this update kind of loop to it, you could call it a heartbeat. | ask #4 |
| S7 | And maybe each mastermind session that gets spawned is automatically a task in and of itself and could have subtasks, and each task could always have subtasks. | ask #5 |
| S8 | By the way, I want to see something about our task system, our AI task system: we should be able to have nested tasks where any number of steps and the aggregate percentage completion is based on the subtasks. | ask #6 |
| S9 | We can have parallel tasks and series; obviously there are dependencies, so you could have a mixture of both. | ask #7 |
| S10 | You could launch a bunch of parallel tasks at phase one, but then once they're all complete, you embark on phase two which could also be in parallel. | ask #8 |
| S11 | And you could mix sequential systems with parallel systems. | ask #9 |
| S12 | I'm not sure exactly how those should look visually, but hopefully the visual design could indicate clearly whether it's parallel or series and how it all flows and what's in flight and what we're waiting on and the percentage completion and all that stuff. | ask #10 |
| S13 | But yeah, trying in terms of the 22 dev servers running and just keeping things efficient, the system mastermind should be trying to analyze the efficiency of the system. | ask #11 |
| S14 | Maybe he spawns a mastermind to study the efficiency of the system in terms of do we have accurate logs of all the things that are created. | ask #12 |
| S15 | And does that give us a picture of how many things are created that are never finished and how many servers are started that are never shut down properly? | ask #13 |
| S16 | How many work trees do you get orphaned and are just sitting there and don't need to be? | ask #14 |
| S17 | All these things that we're creating, we want to manage the life cycle essentially of all of our systems. | ask #15 |

## Flags

Three mechanical checks: a **strength word** (must / never / always / only) the cited
sentence(s) don't contain; **new words** — a word in the ask that is nowhere in the whole
transcript; a **thin citation** — an ask cites a sentence but shares no wording with it
(also marked "(thin)" right in the table above).

| ask | flag | detail |
|---|---|---|
| #1 | new words | "being", "left", "when" — not in the transcript at all |
| #2 | new words | "themselves", "since" — not in the transcript at all |
| #3 | new words | "problem" — not in the transcript at all |
| #4 | new words | "when" — not in the transcript at all |
| #5 | new words | "becomes" — not in the transcript at all |
| #6 | new words | "computed" — not in the transcript at all |
| #7 | new words | "support", "including", "require" — not in the transcript at all |
| #8 | new words | "support", "batch", "fully" — not in the transcript at all |
| #9 | new words | "support", "mixing" — not in the transcript at all |
| #10 | new words | "settled", "make", "being" — not in the transcript at all |
| #11 | new words | "case", "point" — not in the transcript at all |
| #12 | new words | "might" — not in the transcript at all |
| #13 | new words | "logging", "determine" — not in the transcript at all |
| #14 | new words | "logging", "determine", "unneeded" — not in the transcript at all |
| #15 | new words | "being" — not in the transcript at all |
