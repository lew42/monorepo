# Gate proof (scratch, never merged)

A throwaway worktree (`fer-gate-proof`) with one added `page.js` under `public/framework/scratch/`
— nothing more. Its only purpose is to be a `full`-size branch so `Server/merge.mjs`'s review gate
has something real to refuse (no review yet), then accept (once `review.mjs` runs against it).
This worktree and branch are torn down at the end of the proof; the page is never linked from
anywhere and never lands on `michael/dev`.
