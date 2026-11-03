# Parallel Haiku: independent readers, compared (an idea, not built)

The owner's idea (2026-10-24). One agent reading a pile of files gives one answer, and nothing says how far to trust it. Several cheap agents reading the same pile **independently** give answers that can be compared.

## The idea

- Start several Haiku agents on the same question. Each writes to **its own subfolder** (`run-a/`, `run-b/`, `run-c/`) and **never reads another run's folder**. That is the whole trick: no agent can follow another's lead ([context pollution](context.md#context-pollution-the-second-pass-follows-the-first)), so no bias is shared.
- When independent runs **agree**, that is a stronger signal than any one run. Where they **differ**, the difference is the finding: the question is unclear, or the sources disagree.
- **Vary the run, don't repeat it.** The same model with the same prompt tends to make the same mistake three times. Change the model or the effort (or the reading order, or the wording of the question) so the runs fail differently.
- A final step, with a clean context, reads all the subfolders and writes one answer: which claims every run made, which only one did.

## Experiments to try (record each as a small checkable experiment, one line in a task log)

| Try | Measure |
|---|---|
| Sonnet at low effort against Haiku at xhigh, same question | the answer quality (against a known answer) and the dollar cost of each |
| Haiku xhigh three times against Haiku xhigh once | does agreement rise with a right answer, and does it fall for a wrong one |
| Benchmark questions with **clear right answers** (does this file exist, which module owns X) against **open-ended** ones (what should we change in this module) | agreement as a signal: strong for the first kind, only a hint for the second |

Questions with right answers measure the method; open-ended questions are where it would be used, so test both and say which kind each result came from. Agreement on an open-ended question is evidence the finding is easy to see, not that it is correct.

## Where it would plug in

The module audit ([plan](module-audit.md)) and the past-work search ([plan](past-work-haiku.md)) are the two first users: both are long reads with a short written result, which is the shape this fits. Nothing is built; the first step is a node script that makes the subfolders and the compare step, then one trial per row above.
