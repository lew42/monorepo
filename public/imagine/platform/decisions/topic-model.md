# Topic model — what a topic is in code

Two decisions, both expensive to reverse because everything else names them. The demo that
runs on both: [JavaScript](/imagine/platform/topic/). The slice that spends them:
[MVP](/imagine/platform/mvp/).

## §33 — A topic is a page that says `is: "topic"`

| | |
|---|---|
| **Decision** | A topic is an ordinary `Page` with one extra word, `is: "topic"`. No `Topic` class, no registry, no second data model. |
| **Problem** | The brief (§3, §4) floats `Topic extends Page`. About 160 pages exist; whatever a topic is, the other 155 must not pay for it — and a topic three columns deep must be findable by its whole subtree with no import in either direction. |
| **Options** | (a) `Topic extends Page` · (b) `is: "topic"` role + config words on the page literal · (c) a separate Topic data model beside pages · (d) a directory convention with no code at all |
| **Recommended** | **(b)** |
| **Why** | [`core/Page/doc/roles.md`](/framework/core/Page/doc/roles/) already argued this exact question on 2026-08-27 and rejected both a subclass and a `topic: true` flag — a subclass forces a file per role and shadows the accessor it would define; a flag named after the accessor shadows `topic()` on the page that claims it. It is not a proposal: `nearest()` is one line (`chain().findLast(p => p.is === role)`) and two pages ship on it today ([game](/imagine/game/), [team](/imagine/team/)). (c) is the registry roles.md rejected — a second tree kept in step by hand. (d) is real but empty: a convention with no accessor cannot let a room three levels down read its topic's state, which is the one thing the brief needs. |
| **Advantages** | Zero cost to a non-topic — no `is:`, so `topic()` is `undefined` and every topic feature is inert, with nothing imported and nothing loaded. Works through columns, panels and file boundaries. `findLast` means the closest claim wins, so a subtopic graduates to a topic by adding one word. `is:` reads as one field beside `width:` and `card:`, so a topic still looks like a page literal rather than a framework. |
| **Disadvantages** | Nothing is typed and nothing is validated: a topic that promises an `intro` and never builds it is a 404 on click, not an error at load. An inner topic silently shadows an outer one (that is also the feature). And there is no place to hang shared behaviour — five topics wanting the same three methods copy them; this record does not solve that, and a `Topic` subclass is what would. |
| **Security** | None of its own, deliberately. `is:` is a word on a static page and authorizes nothing. Every write is authorized at the Worker against the session — never against a page's claim about itself ([users](/imagine/platform/research/users/), [ai §33](/imagine/platform/research/ai/)). |
| **Cost** | Zero. One string field: no module, no fetch, no storage, no build. |
| **Scalability** | A topic costs one directory. What actually bounds a large tree is `depth:` / `leaf:` ([`declaring.md`](/framework/core/Page/doc/declaring/) — `/imagine/` went 92 modules to 20 on one number), not the role. |
| **Complexity** | One line of core that already exists and is already documented. |
| **Migration/reversibility** | Fully reversible: `is: "topic"` is one word to delete and every reader already handles `undefined`. It also does not close option (a) — a `Topic` subclass added later can still say `is: "topic"`, so the accessor keeps working while the class arrives. |
| **Deliberately NOT doing yet** | A `Topic` class; a topic registry or manifest; any cross-topic query (a browser cannot list a directory — `declaring.md`); the server knowing about `is:` at all. |

## §33 — A capability is opt-in, and its default declaration is a child page

| | |
|---|---|
| **Decision** | A topic opts into a feature by having a child page for it — `intro/`, `space/`, `levels/`. `can:`, one space-separated string, is reserved for behaviour that has no url of its own, and the MVP declares none. Core reads neither. |
| **Problem** | §4 and §30: not every topic needs a community, levels, spaces or an intro, and features must be "plugins, modules, flags, optional capabilities" without every page paying for the ones it does not want. |
| **Options** | (a) every topic gets everything, hidden when empty · (b) booleans on the page (`community: true`) · (c) a capability string `can: "intro space levels"` read by the features · (d) a capability **is** a child page, so `children:` is already the list · (e) a plugin registry on `app` |
| **Recommended** | **(d)**, with (c) as the escape hatch |
| **Why** | Every capability in the brief needs a url anyway — a 10-minute intro is something you link, bookmark and resume (§15) — and `children:` already declares presence, order, label and icon in one line. (b) is the flag roles.md rejected, for the same reason: `community: true` shadows any `community()` reader. (e) is the registry roles.md rejected. (a) makes 155 pages pay. |
| **Advantages** | No new vocabulary at all — the entire capability system is four directory names. A topic with no `space/` has no community and there is nothing to switch off. Discovery, nav order, labels, icons and lazy loading come free with `children:`, `depth:` and `leaf:`. A reader sees the capability list by looking at the directory. |
| **Disadvantages** | It cannot express a capability that changes an *existing* page instead of adding one — inline chat on every page is the example, and that is what `can:` is for, which means a second way to say a similar thing the day it is needed. Nothing enforces that every `space/` behaves like every other `space/`; consistency is convention, not code. |
| **Security** | Capabilities are declarations, never permissions. A `space/` page renders for everyone; what may be *written* there is the Worker's call against the session plus the level gate ([community](/imagine/platform/research/community/)). Never gate a mutation on the page's own word. |
| **Cost** | Zero for a topic that declares none. A declared capability costs one module, at the depth its parent budgets. |
| **Scalability** | Capability count is per-topic and nothing central enumerates it, so there is no list to grow. |
| **Complexity** | The lowest available: the only new thing on the whole platform is a naming convention. |
| **Migration/reversibility** | Renaming a capability moves a directory and breaks its inbound links; `store_key` keeps its saved state ([`store.md`](/framework/core/Page/doc/method/store/)). `can:` can be added later without touching a page that has none. |
| **Deliberately NOT doing yet** | `can:` itself — nothing in the MVP needs it. No capability manifest, no per-capability permissions, and no capability whose data is not either the topic's own `store()` or, past the line, a D1 row. |

## The four capability words

| capability | how a topic says it | what a page that wants it pays | what it costs everyone else | who reads it |
|---|---|---|---|---|
| **intro** | a child page `intro/` | one module | nothing | the reader; §15's 10-minute experience, resumable out of `topic().store()` |
| **space** | one child page per channel under `space/` | one module per channel | nothing | the channel's Durable Object — the object key is that page's url ([realtime](/imagine/platform/research/realtime/)) |
| **levels** | a child page `levels/`, derived from an action log, never a stored number | one module | nothing | `topic().level()`, anywhere in the subtree |
| **subtopics** | ordinary `children:` | nothing extra | nothing | core's column row — [`columns.md`](/framework/core/Page/doc/columns/) |

Two rules the table is hiding. **Every one of them is inert without `is:`** — a feature reaches
its topic through `this.topic()`, and on a page that has no topic ancestor that is `undefined`,
so the feature draws nothing and imports nothing. And **core stops at the ref**: no core method
knows any of these four words, exactly as roles.md ruled for watchers. A subscription API on
`Page` would make 160 pages pay for a pattern four of them want.

## A subtopic versus a page

**A subtopic is a page.** The tree is the composition the brief asks for (§4), and `columns()`
already makes every child a full-height column beside its parent, at any depth. Three states,
all reached by adding or omitting one word:

1. **A page** says nothing. It costs nothing and it is most of the site.
2. **A subtopic** is a page inside a topic. `this.topic()` walks straight past it to the topic
   above — so a room in a realm, or a lesson in a subtopic, reads and writes the *topic's*
   state, which is what makes a deep tree feel like one world.
3. **A subtopic that graduates** adds `is: "topic"`. `findLast` means it now shadows the outer
   topic for everything below it, and it gets its own `store()` for free because the store key
   is its own url. That is the whole of "a topic may contain topics" — one word, no migration,
   and the demo's `async/` does exactly this in a separate file with no import either way.

⚠ **The one thing this model does not give away free: user-created subtopics (§19).** A page is
a file and production is static, so a visitor cannot write one. The MVP's answer is that a
*suggested* subtopic is a D1 row rendered by a `route()` on the topic — the catalogue shape
`declaring.md` already documents, urls with no folder at all — and becomes a real directory only
when someone commits one. That gap is the largest distance between this model and the brief, and
it is named here rather than designed around.

## What this settles for the Durable Object conflict

[`research/cloudflare`](/imagine/platform/research/cloudflare/) shards state one Durable Object
per **topic**; [`research/realtime`](/imagine/platform/research/realtime/) shards per **channel**
and closes by saying the owner must settle which topic model is real before either ships. This
record is that settlement: **a topic is a tree, and a channel is a page in it**, so the
coordination boundary is a page url, not a topic. The ruling itself, with the object key and the
hot-object mitigation, belongs to [`data.md`](/imagine/platform/decisions/data/).
