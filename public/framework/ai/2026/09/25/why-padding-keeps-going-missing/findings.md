# Why padding keeps going missing

**Padding went missing because three things failed at once, and none of them caught it.**

```
Now card, text flush against the inbox column
├── 1. The ask: "full bleed" was meant for the tab strip
│      → the agent applied it to the content area as well
│      → nothing asked "does the content inside need padding?"
├── 2. The check: padding-check.mjs was blind to this case
│      → it scored 0 problems on the unpadded card
│      → it only looked for edges on the text's own containers;
│        the edge here was a neighbour (the inbox column)
│      → it never measured buttons, checkboxes or the stat tiles
└── 3. The habit: the check only ran when someone remembered
       → the check that runs by itself on landing never looked at padding
```

| Without padding (the checker said "clean") | With padding (manager-now's fix) |
|---|---|
| ![stripped](shots/now-padding-stripped.png) | ![padded](shots/now-padded.png) |

## The fix

- [x] **The check sees neighbours.** It looks at what is actually beside each piece of text, each control and each framed box, and skips anything marked `.bleed`. Proof: the unpadded Now card went from 0 findings to 7 (the question, a stat tile, the files button). Five pages built by other agents are still clean. Merged as `870251a3`.
- [x] **The check runs by itself on every landing** (`Server/on-landing.mjs`). Anything it flags also goes to the Servex mastermind. Proof: a test landing flagged the AI 2 miss below.
- [ ] **The smoke test before a merge calls it.** Handed to the smoke-test builders, who are not done yet.
- [x] **The page skill asks, every time:** How wide is this? Does it need padding (`.pad`, `.card`, or a deliberate `.bleed`)? How does it meet its neighbours? It also warns that "full bleed" is for a strip, and the content inside still gets `.pad`.
- [x] **Padding stays opt-in.** `.pad` is the word (your correction).

**It already found one real miss:** on [AI 2](/framework/ai2/) at 1280, the Assistant box sits at the page's left edge. Sent to its owner.

Run it by hand: `node Server/padding-check.mjs /some/page/ --base http://monorepo.localhost`

Task log: [/framework/ai/2026-09-25/padding-system/](/framework/ai/2026-09-25/padding-system/)
