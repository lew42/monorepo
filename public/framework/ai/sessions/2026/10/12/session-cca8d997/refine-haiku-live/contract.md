# The live-refine contract (server ↔ browser)

Design: `public/framework/ext/Refine/doc/live-refine-2026-10-12.md` (in the worktree `C:/Code/lew42/wt-refine-haiku-live`, branch `worktree/refine-haiku-live`).

```
POST /api/refine/live
  { prompt: "<id, [\w-]{4,60}>", session?: "<claude session uuid>", text: "<the whole raw text so far>", final?: false, source?: "dictated"|"typed" }
→ { ok: true, prompt, seq,                       // seq grows per answer; the browser keeps only the newest
    slots: [{ n: 1, raw: "...", clean: "...", cleaned: true }],   // clean = raw until its Haiku clean returns
    md: "# 🧩 ...\n## ...\n- ⬜ point [S1, S2]\n",                  // the outline, markdown, Outline.parse()-able
    outline: { subject, sections: [{ title, cards: [{ id: "c1", text, cites: [1, 2] }] }] },
    unplaced: [n...], pending: 0, done: false,
    timing: { clean_ms, amend_ms, placed_ms },  // of the last batch; placed_ms = sentence arrival → in the outline
    cost_usd }                                  // total so far, measured from RefineCall
  or { ok: false, why }
```

- The POST answers once the batch holding its new sentences is placed (or at once if it adds no finished sentence).
- With `session`, every stage is also written to `/framework/ai/sessions/<session>/` through `VoicePage` (streamed), as `run_refine` does.
- `final: true` closes the last sentence, drains the queue, logs the prompt (`PromptLog`), marks the page done.
