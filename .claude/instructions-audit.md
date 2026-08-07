# Instructions audit — what the AI is told, and what it costs

Written from inside a long autonomous session, so the evidence is first-hand
rather than inferred: every claim below names something that actually happened
while working in this repo.

**The headline, and it supports the "keep instructions minimal" instinct with a
sharper argument than usual:**

> Every documentation failure in this session was a **confident false statement**,
> not a missing one. Not one problem was caused by absent guidance.

That reframes the trade. The cost of a long instruction file is not mainly the
tokens — it is that **prose cannot be tested**, so every sentence is a liability
that ages, while the code underneath moves. Length is bad *because* it correlates
with staleness, not on its own.

---

## 1. What it currently costs

| file | chars | ~tokens | loaded |
|---|---|---|---|
| `CLAUDE.md` | 46,963 | ~12,500 | **every session, always** |
| `.claude/skills/code-architecture/SKILL.md` | 14,838 | ~4,000 | when triggered |
| | | **~16,500** | before any work begins |

`CLAUDE.md` by section:

```
9,585  ## CSS                        <- largest
8,546  ## Working agreements         <- second largest
5,313  ## OOP conventions
5,184  ## Ext
3,801  ## The View system
3,577  ## Writing docs
3,309  ## How the site works
...
```

**18KB — 38% — is `CSS` + `Working agreements`**, and those are the two sections
that are *prose about how to behave* rather than facts about the codebase.

---

## 2. The four failures, with receipts

### 2.1 `How the site works` was wrong, and it is the section a new session trusts most

It described `App.load_page()`, `Page.module_url()`, and the `.page.js` sibling
convention (`/path/sub` → `/path/sub.page.js`). **None of the three existed.**
Verified by grep: 0 hits for all three across `App.js`, `Router.js`,
`Page.class.js`.

Consequences that were real, not hypothetical:

- `/notes/git-branch-names.page.js` sat orphaned and unreachable, **linked from
  the home page**, because the convention it used had been deleted.
- A browser crawl — not the docs — is what found that 5 of 6 site sections were
  404ing.

### 2.2 The skill told me to ignore the best design record in the repo

> *"the `new/` and `new/starter` prototypes (**sketches — not the shipping
> framework; don't import them or take their APIs as current**)"*

`core/new/1/Router.js` is **line-for-line** the shipping `core/Router/Router.js`
(199 lines, both). `children`-as-a-Map, `container()` and `Router.mark()` all
shipped from it unchanged. Its readme is 26KB of design record — with
**measurements** — for the current architecture.

Meanwhile `App`, `Router`, `View` and `Sidebar` shipped with **no readme at all**.
One sentence of guidance hid the answer to the exact question four missing files
were asking.

### 2.3 A rule that was written down did not prevent the thing it described

`framework/readme.md` §4 contained, before the rewrite:

> **rename freely inside `framework/`, alias on the way out.** A dev's `lib/` is a
> downstream package that happens to share a repo.

The App rewrite then dropped `app.stylesheet()`, `App.path_to_page_url()`,
`app.font()` and turned `app.loaded` from a getter into a method — taking
`alex/`, `arya/`, `castin/`, `edric/` and `michael/` down with it.

**Writing a rule down is not enforcement.** Only a test or a structural
impossibility is. This is the single most useful thing in this audit, because it
bounds what *any* amount of instruction text can buy.

### 2.4 Two instruction sources gave opposite orders

- `CLAUDE.md`: *"a directory of raw agent output is scratch… `.tmp-council/`
  showed up in every `git status` afterwards as noise nobody could safely delete."*
- `.claude/skills/design-council/SKILL.md`: *"That directory is the agent's
  scratchpad and the home of its report. **Committed** — the reports are a
  deliverable."*

I had to arbitrate mid-task. `core/new/1/agents/` — 8 committed agent reports —
is the artifact of the skill winning a previous time.

**Contradictions are worse than either rule alone**, because they convert a
decision that should be automatic into a judgement call, every time.

---

## 3. What actually earned its tokens

Not everything should be cut. Ranked by value observed **in this session**:

| kept me from a real bug | section |
|---|---|
| **Capture is synchronous — never build DOM after an `await`** | View system |
| **The layer order must be restated in full, every stylesheet** | CSS |
| **An unlayered rule beats every layer** | CSS |
| **`pkill -f` silently matches nothing on Windows; orphans pin a core** | Dev server |
| **`classify()` runs inside `super()`, before class fields** | OOP |

**These share one property: they are traps that do not throw.** You cannot
discover them by reading the code, and you cannot discover them by testing,
because the failure is silent. That is the highest-value-per-word content in the
whole file, and it is a small fraction of it.

The stuff that did *not* earn its place is the prescriptive prose — paragraphs
arguing for taste. Not because the taste is wrong (it's good), but because it is
**re-derivable from the code**, which is full of the same judgement, and because
a model reading 8KB of "how to behave" spends attention that the actual task
needed.

---

## 4. Recommendations

### 4.1 Split by *decay rate*, not by topic

The organising principle should be **how fast does this go stale**, because
staleness is the failure mode:

| tier | contents | where | ages? |
|---|---|---|---|
| **Traps** | silent failures — capture/await, layer order, `classify()` timing, Windows `pkill` | `CLAUDE.md`, always loaded | **almost never** |
| **Constraints** | no build step, static host, no bare specifiers, never push to `main` | `CLAUDE.md` | never |
| **Facts** | API names, file layout, call order | **the code + `readme.md` next to it** | constantly |
| **Taste** | naming philosophy, the CSS ladder rationale, doc-writing split | a skill, loaded on demand | slowly |

**The move that matters: get *facts* out of `CLAUDE.md` entirely.** They are the
only tier that was wrong, and they are the tier the code can answer authoritatively.
Replace them with pointers.

### 4.2 Concrete cuts, measured

```
## CSS                9,585  ->  ~1,500   keep: layer order, unlayered-beats-all,
                                          "override = bug report". Move the ladder
                                          rationale to the styles skill.
## Working agreements 8,546  ->  ~2,000   keep: propose-before-surgery, autonomy
                                          rule, no-new-dependency, scratch-not-in-repo.
                                          Cut the worked examples — they're in the
                                          readmes they cite.
## OOP conventions    5,313  ->  ~1,200   keep: assign-based constructors, adoption,
                                          no-magic-getters, never read window.app.
## Ext                5,184  ->    ~400   one paragraph + a pointer. The three ext
                                          readmes are better and already exist.
## The View system    3,801  ->    ~800   keep the capture trap. Cut the factory
                                          list — it's one line of code away.
## How the site works 3,309  ->    ~600   this is the section that was WRONG.
                                          Six lines and a pointer at Router.js.
## Writing docs       3,577  ->      0    make it a skill. It matters when you add
                                          a module, which is rarely.
                                    ─────
                     ~47,000  ->  ~9,000   (~2,400 tokens, down from ~12,500)
```

**Target: `CLAUDE.md` under 10KB.** Everything cut goes to a skill or a `readme.md`
— nothing is deleted, it is *relocated to where it can be checked*.

### 4.3 Three cheap structural fixes

1. **Resolve the design-council contradiction.** ✅ **Done** — the skill now sends
   reports to the session scratchpad and says explicitly that `CLAUDE.md` is the
   project's law. Conclusions get folded into the neighbouring `readme.md`; the
   transcripts are left behind.
2. **`core/new/1/agents/`** (8 committed reports) — **kept, deliberately.** The
   general rule says delete, but these are the supporting record for
   `new/1/readme.md`, which is now a first-class design record for the *shipped*
   design rather than a prototype note. Grandfathered on that basis; the skill fix
   above is what stops new ones landing.
3. **Date the volatile claims.** A line like *"as of 2026-08, `Router.load_segments`
   is the whole loader"* tells a future reader how much to trust it. An undated
   confident sentence gives no signal at all.

### 4.4 The rule that would have prevented §2.1 and §2.2

> **A statement about code belongs next to that code, or it belongs nowhere.**

`CLAUDE.md` should say *what to watch out for* and *where to look*. The moment it
says *what a method is called*, it has taken on a maintenance obligation it has no
way to meet — there is no test that fails when `CLAUDE.md` goes stale, and this
session proved there is no habit that catches it either.

---

## 5. The counter-argument, stated fairly

Minimal instructions have a real cost, and it should not be hand-waved: **a model
with less context makes more locally-reasonable, globally-wrong choices.** The
value of "propose before major surgery" is precisely that it is *not* re-derivable
— it encodes a preference about collaboration that no amount of code-reading
reveals.

So the recommendation is **not "cut by volume."** It is: keep every sentence that
encodes a preference or a silent trap, and delete every sentence that restates
something a file already says. The first category is small and durable. The second
is most of the file, and it is the part that was wrong.
