# framework/ai2, and the folders in framework/ai

Expected cost: under $1. Haiku. Follow [findings-method.md](../findings-method.md).

The owner's words: "There's still an AI2 directory. I cannot believe AI2 is still here." They have asked for it to go more than once.

1. **What's left in `public/framework/ai2/`?** File count, last real commit (log sweeps don't count), and which files anything still imports or links to: search code and readmes for `ai2`, and separate real imports from mentions. Is any data there absent from `framework/ai`? Compare by script. Note: `public/framework/readme.md` says "`ai2/` itself is retired", and the handover says "AI 2 merged into AI" on 10-09.
2. **Why is it still there?** Search `public/framework/ai/asks.jsonl`, `git log --all -- public/framework/ai2` and the task folders for each time it was asked for, and what happened each time. Name the step where it stopped: never filed, filed but not started, built but not merged, merged but files kept on purpose.
3. **Map `public/framework/ai/`:** one row per direct child: name, file count, size, last non-sweep commit, whether a readme links it, whether code imports it, and one line on what it is. Use a script.

End with a recommendation for ai2: what would have to happen first, as a scripted move with a dry run and a manifest (the repo's rule: moves are scripted, never destructive). Then list the `ai/` folders that are undeniably dead, by the same evidence.
