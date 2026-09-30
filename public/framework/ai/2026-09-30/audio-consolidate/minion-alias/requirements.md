# Minion: keep the old audio URLs working, fix one link

Load the `minion` and `new-page` skills. Worktree only: `C:\Code\lew42\worktrees\audio-consolidate` (server http://localhost:53292/). Commit each file with `git commit -m "…" -- <exact path>`. Leave every `files.jsonl` / `page.jsonl` change alone.

**Why:** the branch moved six pages under `/framework/audio/v1/`. Their old URLs now show "Page Load Error", and `Server/merge.mjs`'s smoke test refuses the merge. The owner's ask said to keep the old things as thin aliases.

## Deliverables
1. **Six thin alias pages** at the OLD paths: `public/framework/audio/{MicPicker,LevelMeter,PushToTalk,sound-recorder,push-to-talk,mic-to-text}/page.js`. Each should be as small as possible: a one-line note that says "moved to v1", with a link to `/framework/audio/v1/<name>/`, or the v1 page's own content re-used if that is just as small. Declare them in `public/framework/audio/page.js`'s `children:`, but keep them OUT of the tab strip with the same `this.tab({ name, nav: false })` move that page already uses for "v1". The strip must look exactly as it does now.
2. **One link:** in `public/framework/ux/Dictate/readme.md`, line ~128, the link `(/framework/ext/Chat/doc/floor/)` 404s because ext/Chat has no doc pages. Point it at `/framework/ext/Chat/` instead.

Fence: those 7 page.js files, and that readme. Nothing else.

## Proof
Run `MSYS_NO_PATHCONV=1 node Server/merge.mjs C:/Code/lew42/worktrees/audio-consolidate /framework/audio/ /framework/ux/Dictate/ /framework/ai2/ --dry-run` from `C:\Code\lew42\monorepo`. It should report zero FAIL lines. If it can't dry-run the smoke test, load each of the 6 old URLs plus /framework/audio/ headless instead, with zero Page Load Errors, and shoot `/framework/audio/` at 400 into this dir as `audio-400.png` so the tab strip can be checked.

Budget: about $1. End with 2 lines: the commit ids, and the smoke result.
