# Client-side reactivity, signals and reactive lists for a framework-free OO vanilla-JS codebase (as of late October 2026)

Context for the writer: the user has a jQuery-like `View` class (`.el`, plus a "capture" templating system where elements created inside a function are captured), an `Item` base class whose `get`/`set` fire change events (Backbone-style), and `List extends Item`, which wraps an array of Items. He needs list deltas (insert/remove/move/update) both to bind the UI and to persist or stream them.

Methodology note: version numbers, release dates and dependency lists come from the npm registry (`registry.npmjs.org`), fetched 2026-10-29. I measured sizes myself from the published npm tarballs. Each size is the gzip -9 size of the package's own minified prod build, or of an esbuild 0.24.2 `--minify` ESM build where no minified build ships. Each is the whole library with all exports and no tree-shaking, so apps that import fewer exports will be smaller. Maintenance status is inferred from npm publish dates. Popularity stats (stars, downloads) are deliberately omitted because another researcher covers them. The web-search budget ran out partway through, so I gathered the adopter evidence in §9 from official pages and npm dependency manifests, not from searches.

## 1. How signals work mechanically, and the history

### Takeaway
The user's guess is right. A signal's getter checks for a global "currently running" computation (an effect or computed). If one exists, the getter records an edge between the two, so dependencies are discovered at runtime from the reads that actually happen. Writes push a cheap "dirty/check" mark down the graph. Derived values are recomputed lazily when someone pulls them (push-pull), which avoids glitches in diamond-shaped graphs. Batching defers effect execution until the outermost batch ends. The idea runs from Knockout (2010) through S.js, MobX, Vue, Preact, Solid, Angular and Svelte 5, and on to alien-signals, whose algorithm Vue 3.6 adopted.

### Cited Findings
**Dependency tracking via getter reads**
- Vue documents the canonical pseudo-code. A Proxy `get` trap (or a `ref`'s `get value()`) calls `track(target, key)`, and `set` calls `trigger(target, key)`. "Inside `track()`, we check whether there is a currently running effect. If there is one, we lookup the subscriber effects (stored in a Set) for the property being tracked, and add the effect to the Set." Subscriptions live in a global `WeakMap<target, Map<key, Set<effect>>>` — [Vue: Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- `activeEffect` "will be set right before an effect is about to be run" — [Vue: Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- Vue: "Fundamentally, signals are the same kind of reactivity primitive as Vue refs. It's a value container that provides dependency tracking on access, and side-effect triggering on mutation." The page traces this to Knockout observables and Meteor Tracker, and says MobX and Vue's Options API "hide the primitives behind object properties" — [Vue: Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- Preact: "the computed signal or effect sets itself as the current evaluation context", and "A running compute function tracks which signal values are actually read during its run" — [Preact blog, "Signal Boosting" (Joachim Viide, 2022-09-24)](https://preactjs.com/blog/signal-boosting/)
- Angular, on dynamic dependencies: "Only the signals actually read during the derivation are tracked." Computeds are lazy and memoized. `untracked` reads a signal without creating a dependency. Equality functions are customizable, and the default is referential equality — [Angular signals guide](https://angular.dev/guide/signals)

**Data structures, versioning, push-pull**
- Preact stores each dependency edge as a node that sits in two doubly linked lists at once: the consumer's sources and the signal's targets. Each signal has a version number, and there is a global version shared by all plain signals, so a computed can skip work when nothing has changed anywhere. "When a computed signal gets a notification from its dependencies, it flags the cached value as outdated." Effects are eager: "Effects that get a notification schedule themselves to be run" — [Preact "Signal Boosting"](https://preactjs.com/blog/signal-boosting/)
- Glitch definition: "Never allow user code to see intermediate state where only some reactive elements have updated." A diamond (D depends on B and C, which both depend on A) can make a naive push system run D twice or with stale inputs. MobX uses a two-pass count of pending parents. Preact uses version numbers on nodes and edges. Reactively uses graph colouring: "When a node changes, we color it red (dirty) and all of its children green (check)", and a green node walks up its sources on read to decide whether to recompute — [Milo, "Super Charging Fine-Grained Reactive Performance" (milomg.dev, 2022-12)](https://milomg.dev/2022-12-01/reactivity)
- "Reactively uses one down phase and one up phase. Instead of version numbers, Reactively uses only graph coloring." Preact Signals "started from the MobX algorithm, then switched to a lazy approach" (paraphrase of the page) — [milomg.dev](https://milomg.dev/2022-12-01/reactivity)
- alien-signals is described as "a push-pull based signal algorithm". It borrows Vue 3's propagation, Preact's doubly linked lists, Svelte's inner-effect scheduling and Reactively's graph colouring. Its core avoids Array/Set/Map and recursion for speed, and the README has readable recursive versions of `propagate` and `checkDirty` — [alien-signals README](https://github.com/stackblitz/alien-signals)
- The TC39 proposal describes the same push-pull split. Computeds re-evaluate only when read (pull), while a Watcher's `notify` fires synchronously when state changes (push). It names glitch-freedom, laziness and caching as goals — [tc39/proposal-signals](https://github.com/tc39/proposal-signals)

**Batching and scheduling**
- alien-signals exports `startBatch()`/`endBatch()`, `getActiveSub()`/`setActiveSub()` (the "current context" hook), `effectScope()` and `trigger()`. `trigger()` notifies dependents after a value was mutated in place, for example `arr().push(1); trigger(arr)` — [alien-signals README](https://github.com/stackblitz/alien-signals); exports verified in the alien-signals 3.2.1 npm tarball
- In Solid 2.0's core, writes are batched by default and flushed on a microtask: "reads after a write won't reflect the new value until `flush()` runs". This is a deliberate change of semantics to prevent glitches — [@solidjs/signals README (2.0.0-rc)](https://www.npmjs.com/package/@solidjs/signals)
- Preact signals-core 1.14.0 stopped triggering dependents when a batch takes a signal from A to B and back to A. 1.14.4 fixed stale computeds after such reverted batches — [@preact/signals-core CHANGELOG](https://github.com/preactjs/signals/blob/main/packages/core/CHANGELOG.md)

**History**
- Ryan Carniato's timeline: Knockout.js (July 2010) introduced `observable`/`computed` and later `pureComputed`. Backbone (Oct 2010) used model-driven re-renders. AngularJS (2010) used dirty checking. S.js (2013) named its primitive "Signals" after digital circuits and introduced reactive ownership for automatic disposal. Vue (2014) built fine-grained reactivity into its core. Mobservable/MobX (2015) traded push for "a push-pull hybrid system", in which "Notification of changes are pushed out but the execution of the derived state was deferred to where it was read". Svelte 3 (2019) compiled reactivity away. Later adopters include Preact, Solid, Qwik, Marko and Angular — [Ryan Carniato, "The Evolution of Signals in JavaScript" (2023-02-27)](https://dev.to/this-is-learning/the-evolution-of-signals-in-javascript-8ob)
- Carniato: "A Signal keeps a strong reference to its subscribers", which is why ownership and disposal matter — [same](https://dev.to/this-is-learning/the-evolution-of-signals-in-javascript-8ob)
- Svelte 5 runes: `$state` on an array or simple object returns "a deeply reactive state proxy". "Class instances are not proxied", so you put `$state` in class fields instead. Svelte 5 also has `$state.raw` (reassign-only), `$state.snapshot`, and reactive `Set`, `Map`, `Date` and `URL` in `svelte/reactivity` — [Svelte docs: $state](https://svelte.dev/docs/svelte/$state). Svelte 5.0.0 was published 2024-10-19, and the latest is 5.57.3 — [npm: svelte](https://www.npmjs.com/package/svelte)
- Svelte-style compile-time reactivity "require[s] a build step", whereas Vue's runtime reactivity "can work without a build step" — [Vue: Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- Vue 3.6 ports the alien-signals algorithm, per PR #12349 "perf(reactivity): ports `alien-signals`". The PR claims about 13% less memory (2.3MB to 2.0MB) for many refs, computeds and effects, and "over 30x" faster reads of many computeds after a ref changes. In the thread, yyx990803 found that some early gains were benchmark artefacts, and nin-jin criticised the microbenchmarks — [vuejs/core PR #12349](https://github.com/vuejs/core/pull/12349). On 2026-10-29 Vue 3.6 was still a release candidate (`@vue/reactivity` rc tag 3.6.0-rc.13, published 2026-10-23), and stable `latest` was 3.5.44 — [npm: @vue/reactivity](https://www.npmjs.com/package/@vue/reactivity)
- alien-signals also lists adoption by XState (atom architecture), Vue language-tools and others, plus ports to Dart, Lua, Java, C#, Go and Rust — [alien-signals README](https://github.com/stackblitz/alien-signals)
- Angular 22.0.0 was published 2026-06-03, and the latest is 22.2.4 — [npm: @angular/core](https://www.npmjs.com/package/@angular/core)

### Inferences
- The mechanism fits in about 30 lines. Keep a module-level `currentObserver`. `read()` links `currentObserver` and the source. `write()` marks dependents dirty and schedules effects. A computed sets itself as `currentObserver`, runs its function, and diffs the old and new source lists. Everything else (versions, colouring, linked lists, batching) is optimisation and glitch-avoidance.
- Dependencies are dynamic, and that is the main advantage over hand-wired events. On each run the tracked set is exactly what was read (for example, the branch of an `if` that actually ran), so stale subscriptions disappear automatically.
- Signals answer "something you depend on changed, recompute". They do not say what changed. This matters for the user's List deltas (see §6).

### Gaps
- Angular's signal history (introduced as developer preview in v16, May 2023, later stabilised) comes from background knowledge. The fetched Angular guide does not say which APIs are stable and which are in developer preview.
- I fetched no primary source on Knockout's internal dependency-detection code (`ko.dependencyDetection`). It is described here only through Carniato and Vue.

## 2. TC39 Signals proposal status (October 2026) and the polyfill

### Takeaway
Signals is still at Stage 1. The proposal repo still carries its 2024 status text, and the TC39 Stage 1 table lists it as last presented in June 2024. I found nothing showing it advanced in 2025–2026. A web article claiming "Stage 4 / ES2026" is false. The polyfill (`signal-polyfill` 0.2.2) has had no release since January 2025 and says not to use it in production.

### Cited Findings
- The proposal README header reads "Stage 1". Its status section still says "This proposal is on the April 2024 TC39 agenda for Stage 1. It can currently be thought of as 'Stage 0'." Champions are Daniel Ehrenberg, Yehuda Katz, Jatin Ramanathan, Shay Lewis, Kristen Hewell Garrett, Dominic Gannaway, Preston Sego, Milo M and Rob Eisenberg. The original authors are Rob Eisenberg and Daniel Ehrenberg — [tc39/proposal-signals](https://github.com/tc39/proposal-signals)
- Planned before Stage 2: multiple production-grade polyfills tested against framework tests, test262-style tests and benchmarks; integration into many frameworks and large apps; and settling which API extensions to add — [tc39/proposal-signals](https://github.com/tc39/proposal-signals)
- API: `Signal.State` (`get`/`set`); `Signal.Computed` (lazy, memoized, auto-tracked, caches and rethrows errors); `Signal.subtle.Watcher` (`watch`, `unwatch`, `getPending`, and a synchronous `notify` callback that may not read or write signals); `Signal.subtle.untrack`; and introspection (`introspectSources`, `introspectSinks`, `hasSinks`, `hasSources`, `currentComputed`, plus watched/unwatched hooks). "The Signal API does not include any built-in function like `effect`". Scheduling is left to frameworks — [tc39/proposal-signals](https://github.com/tc39/proposal-signals)
- The TC39 proposals index lists Signals in the Stage 1 table with "last presented" 2024-06 ("algorithms-for-signals") and 2024-04 before that — [tc39/proposals stage-1-proposals.md](https://github.com/tc39/proposals/blob/main/stage-1-proposals.md)
- The TC39 proposals changelog for 2026-05-19 lists Explicit Resource Management, Joint Iteration and `Atomics.pause` reaching Stage 4, and Decorators plus Decorator Metadata moving to 2.7. Signals is not mentioned — [kt3k TC39 proposals changelog 2026-05-19](https://kt3k.github.io/changelog/tc39/proposals/2026-05-19)
- A search result titled "TC39 Signals Proposal Reaches Stage 4: Native Reactivity Integrated into ECMAScript 2026" ([tech-champion.com](https://tech-champion.com/programming/javascript/tc39-signals-proposal-reaches-stage-4-native-reactivity-integrated-into-ecmascript-2026)) is contradicted by both the [proposal repo](https://github.com/tc39/proposal-signals) and the [tc39/proposals Stage 1 table](https://github.com/tc39/proposals/blob/main/stage-1-proposals.md). Treat it as unreliable or AI-generated.
- Polyfill: `signal-polyfill` latest is 0.2.2, published 2025-01-17. 0.1.0 came out 2024-03-31. Apache-2.0, no dependencies — [npm: signal-polyfill](https://www.npmjs.com/package/signal-polyfill). Its README says: "⚠️ This polyfill is a preview of an in-progress proposal and could change at any time. Do not use this in production." It shows how to build an `effect` from `Signal.subtle.Watcher` plus your own microtask scheduler — [proposal-signals/signal-polyfill](https://github.com/proposal-signals/signal-polyfill)
- Measured size: signal-polyfill 0.2.2 is about 3.2 KB min+gzip (esbuild bundle of dist/index.js).
- Lit's labs integration `@lit-labs/signals` 0.3.0 (2026-05-14) depends on `signal-polyfill ^0.2.2` — [npm: @lit-labs/signals](https://www.npmjs.com/package/@lit-labs/signals)
- alien-signals' README links a starter template that implements `.get()`/`.set()` "like the Signals proposal" on top of its `createReactiveSystem()`, and signal-polyfill PR #44 explores the same idea — [alien-signals README](https://github.com/stackblitz/alien-signals)

### Inferences
- Do not plan on native `Signal` in browsers in the near term. A Stage 1 proposal with no presentation since mid-2024 is years from shipping.
- The proposal's shape is still a useful design target for the user's own API: `.get()`/`.set()` objects, a Watcher-based effect, and no built-in scheduler. It maps directly onto an `Item.get`/`Item.set` design.

### Gaps
- Without GitHub API access I could not check recent commits or issues on the proposal and polyfill repos, or any 2025–2026 TC39 meeting notes that might mention Signals informally.

## 3. Standalone signal/reactivity libraries usable from plain ESM (size and maintenance)

### Takeaway
For a no-bundler OO codebase, the strongest small, maintained options are `@preact/signals-core` (about 2.2 KB, released two days before this research, now with a class-friendly `createModel`), `alien-signals` (about 1.9 KB, the fastest core, adopted by Vue 3.6) and `@vue/reactivity` (about 7.3 KB, ships a browser ESM build, proxies and refs). MobX 7 (about 14.3 KB) is the heavyweight OO option; it is Proxy-only now and has good class support. S.js and uhooks are dormant. Solid 2.0's standalone core is a release candidate and much larger.

### Cited Findings
Sizes are my measurements, min+gzip of the whole library (method at top). Versions and dates are from npm.

| Package | Latest (date) | Size min+gz | Notes |
|---|---|---|---|
| `alien-signals` | 3.2.1 (2026-05-14); 3.0.0 2025-09-27; 1.0.0 2025-01-14 | ~1.9 KB | MIT, 0 deps — [npm](https://www.npmjs.com/package/alien-signals) |
| `@preact/signals-core` | 1.14.5 (2026-10-27) | ~2.2 KB (`signals-core.min.js`) | MIT, 0 deps — [npm](https://www.npmjs.com/package/@preact/signals-core) |
| `@vue/reactivity` | 3.5.44 (2026-10-13); 3.6.0-rc.13 (2026-10-23) | ~7.3 KB (3.5 `esm-browser.prod.js`), ~7.5 KB (3.6-rc) | MIT — [npm](https://www.npmjs.com/package/@vue/reactivity) |
| `mobx` | 7.1.3 (2026-10-27); 7.0.0 2026-07-30 | ~14.3 KB (`mobx.esm.production.min.js`) | MIT, 0 deps — [npm](https://www.npmjs.com/package/mobx) |
| `valtio` (`valtio/vanilla`) | 2.3.2 (2026-05-01) | ~1.6 KB incl. `proxy-compare` | MIT — [npm](https://www.npmjs.com/package/valtio) |
| `s-js` | 0.4.9 (2018-07-28) | ~1.9 KB | dormant — [npm](https://www.npmjs.com/package/s-js) |
| `@solidjs/signals` | `latest`=2.0.0-rc.0 (2026-08-12); `next`=2.0.0-rc.20 (2026-10-29) | ~23 KB (rc.0) / ~38 KB (rc.20), full export set | MIT — [npm](https://www.npmjs.com/package/@solidjs/signals) |
| `solid-js` | 1.9.17 (2026-10-07); 2.0.0-rc.20 `next` | — | 2.0.0-beta.0 2026-03-03 — [npm](https://www.npmjs.com/package/solid-js) |
| `@arrow-js/core` | 1.0.6 (2026-04-01); 1.0.0 2026-03-20 | ~5.1 KB (`index.min.mjs`) | MIT, 0 deps — [npm](https://www.npmjs.com/package/@arrow-js/core) |
| `@lit/reactive-element` | 2.1.2 (2025-12-23) | ~2.4 KB (`reactive-element.js`) | BSD-3 — [npm](https://www.npmjs.com/package/@lit/reactive-element) |
| `uhtml` | 5.0.9 (2025-08-06) | ~6.7 KB (DOM build incl. signals) | depends on `@webreflection/alien-signals` (0.4.2, 2025-10-18) — [npm](https://www.npmjs.com/package/uhtml) |
| `uhooks` | 0.4.0 (2022-05-23) | — | dormant — [npm](https://www.npmjs.com/package/uhooks) |
| `knockout` | 3.5.3 (2026-03-25) | ~25 KB | still patched — [npm](https://www.npmjs.com/package/knockout) |
| `signal-polyfill` | 0.2.2 (2025-01-17) | ~3.2 KB | "not for production" — [npm](https://www.npmjs.com/package/signal-polyfill) |

Library details:
- **@preact/signals-core** exports `signal`, `computed`, `effect`, `batch`, `untracked`, `action`, `createModel`, and the `Signal`/`Computed`/`Effect` classes (verified in 1.14.5 dist). `createModel` (added in 1.13.0) "define[s] disposable model instances that group signals, computed values, and actions". Returned methods are auto-wrapped as batched, untracked actions, and "Effects created while constructing the model are captured and disposed when you call `model[Symbol.dispose]()`". "Class instances work too: their prototype methods … are wrapped as actions" — [@preact/signals-core README](https://www.npmjs.com/package/@preact/signals-core); [CHANGELOG](https://github.com/preactjs/signals/blob/main/packages/core/CHANGELOG.md)
- **alien-signals**: function-style API (`const count = signal(1); count(); count(2)`) with `computed`, `effect`, `effectScope`, nested effects that clean up automatically when the outer effect re-runs, `trigger()`, and `createReactiveSystem()` "to build your own signal API" — [alien-signals README](https://github.com/stackblitz/alien-signals). `createReactiveSystem({ update, notify, unwatched })` is exported from `esm/system.mjs` (verified in the 3.2.1 tarball).
- **WebReflection/alien-signals** wraps alien-signals with a "Preact signals like API and a class based approach for easy brand check". uhtml 5 uses it — [alien-signals README, Derived Projects](https://github.com/stackblitz/alien-signals); [npm: uhtml](https://www.npmjs.com/package/uhtml)
- **@vue/reactivity** ships `dist/reactivity.esm-browser.prod.js`, a browser-ready ESM build (verified in tarball). Vue documents that runtime reactivity "can work without a build step" — [Vue: Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- **MobX 7** (7.0.0, 2026-07-30): "MobX now always uses Proxy-backed observable objects and arrays. The ES5/non-proxy fallback has been removed." "Legacy decorators are no longer supported." "Bundle sizes are down: ESM prod 17.02 KiB gzip -> 13.96 KiB gzip; a minimal tree-shaken example is 10.32 KiB gzip". 7.1.x fixes cover 2022.3 `@computed` `super` reads and `toJS` with `@observable accessor` — [MobX CHANGELOG](https://github.com/mobxjs/mobx/blob/main/packages/mobx/CHANGELOG.md) (read from the 7.1.3 npm tarball)
- **MobX class usage**: `makeObservable(this, { value: observable, double: computed, increment: action })` in the constructor, or TC39 decorators, where "the `@observable` decorator should always be used in combination with the `accessor` keyword". On subclassing: "`makeObservable` can only annotate properties declared by its own class definition", only `action`/`computed`/`flow`/`actionBound` on the prototype can be overridden, and "`makeAutoObservable` cannot be used on classes that have super or are subclassed" — [MobX: Creating observable state](https://mobx.js.org/observable-state.html)
- **MobX custom atoms**: `createAtom(...)` returns an atom with `reportObserved()` (call in a getter) and `reportChanged()` (call in a setter). This is the official hook for adding tracking to your own data structures — [mobx src/core/atom.ts](https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/core/atom.ts) (verified in the 7.1.3 tarball)
- **Valtio** (proxy-based): `subscribe(proxyObject, callback(ops), notifyInSync?)`. Op shape: `['set', path, value, prevValue] | ['delete', path, prevValue]`. In 2.3.2 the internal `createOp` is `undefined` until `unstable_enableOp()` is called, and the devtools util calls it, so ops are opt-in and marked unstable — [valtio 2.3.2 `esm/vanilla.mjs` / `vanilla.d.mts`](https://www.npmjs.com/package/valtio)
- **Solid 2.0 core** (`@solidjs/signals`): "Status: Release Candidate … The API is frozen barring showstoppers before the final release." It is "a push-pull hybrid reactive system" with async, transitions, optimistic updates and deep stores. Its effects split tracking from side effects (`createEffect(() => doubled(), value => {...})`) — [@solidjs/signals README](https://www.npmjs.com/package/@solidjs/signals). The rc.20 exports include `createSignal`, `createMemo`, `createEffect`, `createStore`, `createProjection`, `reconcile`, `mapArray`, `repeat`, `untrack` and `flush` (verified in tarball).
- **Arrow.js**: "a tiny, type-safe reactive UI runtime built around JavaScript modules, template literals, and the DOM", with `reactive()`, the `html` tag, `component()` and `watch()`. It reached 1.0 in March 2026 — [@arrow-js/core README](https://www.npmjs.com/package/@arrow-js/core); [arrow-js.com](https://arrow-js.com)
- **Lit reactive controllers**: `ReactiveControllerHost` exposes `addController`, `removeController`, `requestUpdate()` and `updateComplete`. A controller "aggregat[es] the state, behavior, and lifecycle hooks related to a single feature" (from `reactive-controller.d.ts` in @lit/reactive-element 2.1.2) — [npm: @lit/reactive-element](https://www.npmjs.com/package/@lit/reactive-element)
- **uhtml** imports straight from a CDN with no tools: `import { html } from 'https://esm.run/uhtml'`. It offers "*React* like components with *Preact* like *signals*" — [uhtml README](https://github.com/WebReflection/uhtml)

### Inferences
- **Best fit for the user's `Item`**: `@preact/signals-core` or `alien-signals` as an internal engine behind `Item.get`/`Item.set`. Both are under 2.5 KB, have no dependencies, and are maintained. Preact's `createModel` plus `Symbol.dispose` closely matches an OO model whose effects should die with it. `effectScope` in alien-signals or Vue maps onto the user's capture templating: effects created inside a View's render function get collected and disposed when the View is removed.
- **MobX 7** is the most complete OO option (observable arrays with splice events, atoms, decorators). But `makeAutoObservable` is off-limits in inheritance chains like `Item → List`, so explicit `makeObservable` per class or `accessor` decorators would be needed.
- **No-bundler caveat**: bare specifiers (`import ... from 'mobx'`) need an import map or a CDN ESM endpoint (esm.sh, esm.run/jsDelivr `+esm`). Packages with runtime dependencies (Valtio needs `proxy-compare`; mobx-keystone needs `nanoid`, `tslib`, `fast-deep-equal`) are easier through a CDN that bundles them. Zero-dependency packages (alien-signals, preact signals-core, mobx) can be vendored as single files.
- Svelte runes and Angular signals are not realistic standalone choices for a no-build vanilla codebase. Svelte needs its compiler, and Angular's primitives are tied to `@angular/core`.

### Gaps
- Maintenance is judged from npm publish dates only. Commit activity was not checked because the GitHub API was blocked.
- Vue 3.6 stable release date unknown. It was still at rc.13 on 2026-10-23.
- Not verified: whether Angular publishes its signal primitives as a separately consumable package.
- Arrow.js `reactive()` internals (proxy-based, and whether it tracks per-key) were not read in source.

## 4. Reactive collections and list diffing; list events as persistence deltas

### Takeaway
There are two families. **Delta-emitting collections** (Backbone `add`/`remove`/`reset`/`sort`; MobX `splice`/`update`; Knockout `arrayChange` with `moved`; .NET `Add`/`Remove`/`Replace`/`Move`/`Reset`) tell you exactly what changed, so the same events can drive the DOM and persistence. **Snapshot-and-reconcile** approaches (Solid `reconcile`/`mapArray`/`<For>`, Lit `repeat`, udomdiff, morphdom, idiomorph) take "old list vs new list" and compute DOM moves by key. Most delta systems have no first-class "move" (MobX, JSON Patch, MST). Knockout and .NET are the exceptions. A move is usually encoded as remove plus insert, which matters if you want move-aware persistence.

### Cited Findings
**Delta-emitting collections**
- **MobX observable arrays**: `observe()` emits `splice` events {`index`, `removed`, `removedCount`, `added`, `addedCount`} and `update` events {`index`, `newValue`, `oldValue`}. `push`/`unshift`/`replace` also fire `splice`. There is no `move` event. "even inside a transaction `observe` will fire its listeners for each mutation". The docs call relying on these utilities "an anti-pattern" and recommend `reaction` — [MobX: intercept & observe](https://mobx.js.org/intercept-and-observe.html)
- In MobX 7 source, every array mutation (`push`, `unshift`, `splice`, `length` assignment, `replace`) goes through `spliceWithArray_`, which emits `{type: "splice", index, removedCount, addedCount, ...}` — [mobx observablearray.ts](https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/types/observablearray.ts) (verified in 7.1.3 tarball). MobX 7.0.6 fixed `length` assignment so it respects `intercept` — [MobX CHANGELOG](https://github.com/mobxjs/mobx/blob/main/packages/mobx/CHANGELOG.md)
- **Backbone.Collection events**: `"add"` (model, collection, options); `"remove"` (model, collection, options), with the pre-removal index in `options.index`; `"update"` (collection, options), a "single event triggered after any number of models have been added, removed or changed in a collection"; `"reset"` (collection, options), with `options.previousModels`; `"sort"`; `"change"`, `"change:[attribute]"`, `"destroy"` and `"all"`. `collection.set(models)` performs a "smart" update (add new, merge existing, remove absent) and then fires one `"update"` — [Backbone docs: Events catalog](https://backbonejs.org/#Events-catalog). Backbone 1.6.1 was published 2025-04-01 — [npm](https://www.npmjs.com/package/backbone)
- **Knockout** `obsArray.subscribe(fn, thisArg, "arrayChange")` delivers records like `{ index: 3, status: 'added', value: 'Delta' }`. Reorders carry `moved`, e.g. `{ index: 0, moved: 1, status: 'deleted', value: 'Alpha' }`. Deleted indexes refer to the old array and added indexes to the new one. "An `observableArray` tracks which objects are *in* the array, *not* the state of those objects" — [Knockout: observableArray](https://knockoutjs.com/documentation/observableArrays.html)
- **.NET naming precedent**: `NotifyCollectionChangedAction` = `Add`, `Remove`, `Replace`, `Move`, `Reset` ("The contents of the collection changed dramatically") — [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.collections.specialized.notifycollectionchangedaction)
- **Valtio** ops are path-based `set`/`delete` (no splice or move), and opt-in via `unstable_enableOp()` — see §3 ([valtio](https://www.npmjs.com/package/valtio))

**Keyed reconciliation and DOM diffing**
- **Solid `<For>`** "renders a list by item identity", "maps items by value identity", and "If the same item value appears at a new position, its rendered node can be moved instead of recreated". "`<For>` uses `mapArray` internally", and `index` is an accessor — [Solid docs: For](https://docs.solidjs.com/reference/components/for)
- **Solid `reconcile`** "reconciles existing state with a new value", for example an incoming snapshot. The `key` option defaults to matching array items by `"id"`, falling back to position or reference. `merge` controls whether updates are pushed to the leaves or non-matching branches are replaced — [Solid docs: reconcile](https://docs.solidjs.com/reference/store-utilities/reconcile)
- **Lit `repeat`** "performs efficient updates of lists based on user-supplied keys". With `repeat`, a reversed list moves nodes. With `map`, "Lit maintains the DOM nodes for the list items, but reassigns the values". Use `repeat` "If updating the DOM nodes is more expensive than moving them" or when nodes hold uncontrolled state such as checkbox state. Otherwise "use map or looping statements" — [Lit: Lists](https://lit.dev/docs/templates/lists/)
- **udomdiff**: `futureNodes = udomdiff(parentNode, [...currentNodes], [...futureNodes], get, before)`. The `get(node, 1|0|-0|-1)` callback maps items to nodes, so it can diff arrays of arbitrary items, not only nodes. ESM import: `https://unpkg.com/udomdiff/esm/index.js` — [udomdiff README](https://github.com/WebReflection/udomdiff). Version 1.1.2 (2024-11-27), about 0.5 KB min+gzip (measured) — [npm](https://www.npmjs.com/package/udomdiff)
- **morphdom and idiomorph**: morphdom and nanomorph match siblings by `id`. idiomorph builds "id sets" ("a mapping of elements to a set of all ids found within that element") and treats two elements as matching if their id sets intersect, which gives better matches using structure from the children — [idiomorph README](https://github.com/bigskysoftware/idiomorph). morphdom 2.7.8 (2026-01-14, about 3.1 KB); idiomorph 0.8.0 (2026-09-05, about 3.8 KB, 0BSD) — [npm: morphdom](https://www.npmjs.com/package/morphdom), [npm: idiomorph](https://www.npmjs.com/package/idiomorph)

**List events as persistence deltas**
- **MST patches**: `onPatch(target, (patch, reversePatch) => …)`. Patches follow "JSON-Patch, RFC 6902", with `op: "replace" | "add" | "remove"`, a `path` relative to the listener and an optional `value`. "Patches are emitted immediately when a mutation is made and don't respect transaction boundaries". "A single mutation can result in multiple patches, for example when splicing an array". Reverse patches enable undo/redo, and `applyPatch(model, patch)` replays them — [MST: Patches](https://mobx-state-tree.js.org/concepts/patches); `recordPatches` also exists (`dist/core/mst-operations.d.ts`, MST 9.0.0 tarball)
- **mobx-keystone patches**: `onPatches(subtreeRoot, (patches, inversePatches) => …)`, where `Patch = add | remove | replace` with array `path`s, plus `patchRecorder(subtreeRoot, opts)` (keystone 2.4.1 `.d.ts`). 2.0.0 added support for JSON Patch `"-"` array appends — [mobx-keystone CHANGELOG via npm](https://www.npmjs.com/package/mobx-keystone)
- **Valtio** ops (`set`/`delete` with path and prevValue) can serve as deltas, but the API is `unstable_` and opt-in — [valtio](https://www.npmjs.com/package/valtio)

### Inferences
- **Recommended delta vocabulary for `List`**, combining Backbone, MobX, Knockout and .NET: `insert(index, items)`, `remove(index, count)`, `move(from, to)`, `replace(index, item)` / `update(index, key, value)` (item-level change bubbled up), and `reset(items)`. Emit these as events, and optionally coalesce them into a Backbone-style `update`/batch event per transaction.
- **Keep `move` first-class** in the user's own events, even though MobX, MST, keystone and JSON Patch lack it. Downstream it can be encoded as remove plus add for JSON Patch, or as RFC 6902 `move` (which exists in the RFC but is not used by MST or keystone). A dedicated move avoids destroying and recreating DOM and preserves item identity in persistence and CRDT sync. Knockout's `moved` field shows the UI benefit.
- **Two DOM-binding strategies**:
  - (a) Apply deltas directly. On `insert`, render the new Item's View and `insertBefore` the anchor; on `remove`, detach; on `move`, `insertBefore`. This is O(change) and needs no diff, which fits the user's event-based `Item`/`List`.
  - (b) Re-render the list and key-diff with udomdiff (0.5 KB), using `get` to map Item to `item.view.el`. This is simpler when changes come in as snapshots from a server or a sort.
  - Many systems do both: deltas when available, keyed diff on `reset`/`sort`.
- Per-mutation, synchronous delta events (as in MobX `observe` and MST patches) are fine for persistence logs but too chatty for the network. Batch them per action or microtask before streaming, which is effectively what Backbone's single `update` event does.

### Gaps
- I did not confirm whether Backbone's `"update"` event carries `options.changes = {added, removed, merged}`. The fetched part of the catalog does not document it, although I believe it exists in Backbone ≥1.3.
- I did not read the algorithm details of udomdiff, Solid `mapArray` or Lit `repeat` (prefix/suffix trimming plus LIS or map-based moves).
- I did not confirm whether MST or keystone ever emit RFC 6902 `move` ops. The MST docs and keystone types show only add/remove/replace.

## 5. MobX-state-tree and mobx-keystone: status and fit

### Takeaway
Both are actively maintained in 2026 and both moved to MobX 7. MST shipped 8.0 (2026-09-02, needed for MobX 7) and 9.0 (2026-10-23, roughly 2x faster creation and 4x faster `applySnapshot`, snapshots computed lazily). mobx-keystone 2.x (2.0 released 2026-09-13, latest 2.4.1 on 2026-10-11) is class-based (`class Todo extends Model({...})`). It has JSON patches with inverse patches, references, transactions, undo/redo, Yjs and Loro CRDT bindings, and as of 2.4 a JSON serialization and remote-call API. keystone is the closer conceptual match to the user's OO Item/List design. MST's model definition is a factory DSL (`types.model`), not classes. Both are large: MST is about 21 KB and keystone well over 50 KB min+gzip, each on top of MobX's ~14 KB, and both are TypeScript-centric.

### Cited Findings
**mobx-state-tree (MST)**
- Releases: 7.0.0 2024-11-19; 7.1.0 2026-03-26; 7.3.0 2026-07-01; 7.4.0 2026-08-23; 8.0.0 2026-09-02; 9.0.0 2026-10-23. Peer dependency `mobx ^7.0.0` — [npm: mobx-state-tree](https://www.npmjs.com/package/mobx-state-tree)
- v8.0.0: "MobX 7 compatibility requires us to update our TypeScript config from `es5` -> `es2015`"; "If you want to use MobX 7, upgrade to MobX-State-Tree v8". Releases are published by coolsoftwaretyler. The repo had 97 open issues and 3 open PRs when fetched — [MST releases](https://github.com/mobxjs/mobx-state-tree/releases)
- v9.0.0: "MST 9 makes model creation about 2x faster and applySnapshot about 4x faster". Breaking changes:
  - redeclaring a member as a different kind now throws (#2304);
  - snapshots are computed on read (`getSnapshot`/`onSnapshot`) instead of after every action (#2308);
  - `walk` visits every node (#2305).
  Fixes: `applySnapshot` reconciles children by identifier when they move (#2311) — [MST v9.0.0 release](https://github.com/mobxjs/mobx-state-tree/releases/tag/v9.0.0)
- References: `types.reference(Author)` "stores just the `id` reference" — [MST README (npm 9.0.0)](https://www.npmjs.com/package/mobx-state-tree). Patches are RFC 6902, emitted immediately (not batched per transaction), with reverse patches and `applyPatch` — [MST: Patches](https://mobx-state-tree.js.org/concepts/patches)
- Size: `mobx-state-tree.min.js` is about 20.9 KB min+gzip, excluding the mobx peer (measured)

**mobx-keystone**
- Releases: 1.0.0 2022-09-21; 2.0.0 2026-09-13; 2.4.1 2026-10-11. Peer `mobx ^7 || ^6 || ^5 || ^4`. Runtime deps `tslib`, `nanoid`, `ts-toolbelt`, `fast-deep-equal` — [npm: mobx-keystone](https://www.npmjs.com/package/mobx-keystone)
- The README pitch: "single source of truth, mutable model code, and immutable traceability built in"; "Runtime snapshots and JSON patches for persistence, sync, replay, and debugging"; "Built-in primitives for references, transactions, action middlewares, and undo/redo". Class models look like `@model("todo/Todo") class Todo extends Model({ text: prop<string>(""), done: prop(false) }) { @modelAction toggle(){…} }` with `registerRootStore(store)` — [mobx-keystone README](https://www.npmjs.com/package/mobx-keystone); docs at [mobx-keystone.js.org](https://mobx-keystone.js.org)
- CRDT sync: "Collaborative editing is available through the `mobx-keystone-yjs` and `mobx-keystone-loro` CRDT bindings". Both are at 2.0.1 (2026-09-25) — [mobx-keystone README](https://www.npmjs.com/package/mobx-keystone); [npm: mobx-keystone-yjs](https://www.npmjs.com/package/mobx-keystone-yjs); [npm: mobx-keystone-loro](https://www.npmjs.com/package/mobx-keystone-loro)
- 2.4.0 added a serialization API: `createSerializer`, `encodeValue`/`decodeValue`, `encodeCall`/`decodeCall`, `pathRefs()`/`idRefs()` for referencing tree nodes by path or by type+id, and `applyCall` with a `canCall` allowlist (default: model actions only), "for sending values and calls as JSON". 2.4.1 added `{ generateNewIds }` "for a server that accepts snapshots from clients, where duplicate ids would break `applyPatches` and `applySnapshot` on replicas" — [mobx-keystone CHANGELOG (2.4.1 tarball)](https://www.npmjs.com/package/mobx-keystone)
- 2.1.0 performance work: "at 16,000 items, from milliseconds to microseconds" for array splices, `getSnapshot`/`onSnapshot` after splices, and structural `applyPatches`/`applySnapshot`. "Models without MobX decorators no longer get a MobX observable administration". 2.0.0 hardened JSON Patch handling: `"-"` appends, rejecting malformed pointers or out-of-range indexes, and transaction rollback — [same CHANGELOG](https://www.npmjs.com/package/mobx-keystone)
- `onPatches(subtreeRoot, (patches, inversePatches) => void)`; `Patch = PatchAddOperation | PatchRemoveOperation | PatchReplaceOperation` (from keystone 2.4.1 `dist/types/patch/*.d.ts`) — [npm: mobx-keystone](https://www.npmjs.com/package/mobx-keystone)
- Size: the unbundled minified ESM file is about 64 KB min+gzip, excluding deps and before tree-shaking (measured, so an upper bound)

### Inferences
- **Conceptual fit**: keystone is essentially the "grown-up" version of the user's design. It has Item-like class models with typed props, List-like observable arrays inside a tree, change events in the form of JSON patches plus inverse patches (undo), snapshots for persistence, references by id, and now a JSON wire format plus action-call replication. Its shape is worth studying even if it isn't adopted.
- **Practical fit for a no-bundler vanilla-JS codebase is weak**. Both libraries are TypeScript- and decorator-oriented. keystone's class models rely on decorators (`@model`, `@modelAction`), which are still Stage 2.7 in TC39 per the May 2026 changelog, so they need a transpiler or TypeScript in plain browsers. Both are heavy (MobX plus 21–60+ KB), and they want to own the model base class, which conflicts with the user's own `Item`.
- **Ideas to borrow**:
  1. Patches with inverse patches as the single change-event format for UI, persistence and undo.
  2. Path- or id-based references (keystone `idRefs`/`pathRefs`).
  3. Lazy snapshots (MST 9: compute on read, not per action).
  4. Batching per action. Note that MST still emits patches immediately, not per transaction.
  5. `generateNewIds` when accepting client snapshots.

### Gaps
- Whether keystone class models can be declared without decorators in plain JS (e.g. via `Model(...)` without `@model`, or some registration function) was not verified.
- Detailed MST 7→9 changes to references (safeReference fixes in 7.2.0) were not read.
- I found no independent 2026 usage data comparing MST and keystone. Known adopters are in §9.

## 6. Events vs signals for an OO codebase; can fine-grained tracking be added cheaply to get/set?

### Takeaway
Yes. The user's `Item.get`/`Item.set` is already the right seam. Make `get(key)` call "track this (item, key)" and `set(key, v)` call "trigger this (item, key)" alongside the existing change event. That gives automatic dependency tracking for Views, computed values and effects, using either a 2 KB library (one signal per key, or a MobX `createAtom` per key) or about 50 lines of your own code. Keep the events for deltas. Signals say *that* something changed, which is ideal for re-rendering. Events and patches say *what* changed, which you need for persistence, streaming and list DOM moves. For `List`, track one "structure" signal for membership and order, plus per-item signals, and emit insert/remove/move/update events in parallel.

### Cited Findings
- Vue's own `ref` is exactly this pattern: `get value() { track(refObject, 'value'); return value }` and `set value(v) { value = v; trigger(refObject, 'value') }`, with `track` a no-op when no effect is running — [Vue: Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- MobX's official extension point for custom data structures is an atom with `reportObserved()` (in getters) and `reportChanged()` (in setters) — [mobx atom.ts](https://github.com/mobxjs/mobx/blob/main/packages/mobx/src/core/atom.ts)
- alien-signals provides `createReactiveSystem({update, notify, unwatched})` for building your own surface API, `getActiveSub()`/`setActiveSub()` for the current context, `startBatch`/`endBatch`, and a starter template implementing `.get()`/`.set()` — [alien-signals README](https://github.com/stackblitz/alien-signals)
- Dynamic tracking: "Only the signals actually read during the derivation are tracked" — [Angular signals guide](https://angular.dev/guide/signals)
- Event-style hooks fire per mutation even inside transactions (MobX `observe`), and MST patches "don't respect transaction boundaries" — [MobX: intercept & observe](https://mobx.js.org/intercept-and-observe.html); [MST: Patches](https://mobx-state-tree.js.org/concepts/patches)
- A signal "keeps a strong reference to its subscribers", so you need ownership or disposal — [Carniato](https://dev.to/this-is-learning/the-evolution-of-signals-in-javascript-8ob). Libraries provide this through `effectScope` ([alien-signals](https://github.com/stackblitz/alien-signals)), `createRoot` ([@solidjs/signals](https://www.npmjs.com/package/@solidjs/signals)) and `createModel`, which captures effects and disposes them on `[Symbol.dispose]()` ([@preact/signals-core](https://www.npmjs.com/package/@preact/signals-core))
- Knockout's `observableArray` "tracks which objects are *in* the array, *not* the state of those objects", which separates collection-level from item-level tracking — [Knockout docs](https://knockoutjs.com/documentation/observableArrays.html)
- alien-signals `trigger(arr)` exists precisely to notify after an in-place array mutation — [alien-signals README](https://github.com/stackblitz/alien-signals)
- Lit `repeat` vs `map` shows the cost trade-off. Moving keyed nodes preserves DOM state, while reassigning values is cheaper when nodes are stateless — [Lit: Lists](https://lit.dev/docs/templates/lists/)
- **Signals that carry diffs (a hybrid answer to "signals say that, events say what")**: tldraw's own signals library (`@tldraw/state`) lets an atom take `historyLength` ("the number of diffs to retain for incremental updates") and `computeDiff`. A computed can return `withDiff(value, diff)`, and consumers call `getDiffSince(epoch)`, which returns `RESET_VALUE` "when history is insufficient". `transaction()` batches changes and can roll them back — [tldraw: Signals](https://tldraw.dev/sdk-features/signals)
- tldraw's record store is built on those signals ("The reactive Store.get integrates with tldraw's signals system"). It exposes change events for persistence and sync: `editor.store.listen(cb, { source: 'user' | 'remote', scope: 'document' | 'session' | 'presence' | 'all' })`, where `entry.changes` has `added`, `updated` (as `[prev, next]` pairs) and `removed` — [tldraw: Store](https://tldraw.dev/sdk-features/store)

### Inferences
**Trade-offs**

| | Events (Backbone-style) | Signals (auto-tracked) |
|---|---|---|
| Wiring | Manual `on('change:x')`; easy to over- or under-subscribe; must unbind | Automatic from reads; dependencies update per run |
| Payload | Rich deltas (old/new, index, op): good for persistence, sync, undo, DOM moves | Only "invalidated"; recompute and compare |
| Glitches/batching | Each `set` fires immediately; derived handlers can see half-updated state | Glitch-free derived values; batching built in |
| Debuggability | Explicit, greppable | Implicit; needs introspection or devtools |
| Memory | Listener arrays | Edges in both directions; needs disposal scopes |
| Collections | Natural (add/remove/move events) | Coarse unless paired with keyed mapping (`mapArray`) or deltas |

**Cheap retrofit sketch** (design inference, not tested this session):
- `Item`: keep `#data` and the existing emitter. Add a lazily created per-key signal or atom map.
  - `get(k)`: `this.#sig(k).value` (tracks if inside an effect), return `#data[k]`.
  - `set(k, v)`: if unchanged, return. Otherwise write `#data[k]`, bump the signal, then `emit('change', {key, value, old})`.
  - Wrap multi-key updates in `batch()` so effects run once.
- `List extends Item`:
  - Keep a `#version` or structure signal that is read by `length`, iteration, `at(i)` and `map`, and bumped by insert/remove/move/reset.
  - Emit `{op:'insert'|'remove'|'move'|'replace'|'reset', index, ...}` events for persistence and the DOM. Item-level changes stay in each Item's own signals and events, so a list re-render is not needed when one item's field changes (the Knockout and Solid `<For>` separation).
- `View` capture system: run each render function inside an `effectScope` (alien or Vue) or a `createModel`-like scope (Preact), so effects created while building a View are captured with its elements and disposed when the View is removed. This mirrors S.js and Solid "ownership".
- Persistence: subscribe to the delta events, not signals. Coalesce them per batch or microtask into a patch array, e.g. JSON-Patch-like `{op, path:[listId, index], value}` plus a custom `move`. Optionally record inverse ops for undo (the MST and keystone approach).
- Cost: one small dependency (~2 KB) or ~50–150 lines of your own code. No change to the public `get`/`set` API, so existing event consumers keep working.
- tldraw is the closest shipped precedent for "both at once": signals for reactive reads and derived state, plus a record store that emits `{added, updated:[prev,next], removed}` diffs tagged by source and scope for persistence and multiplayer sync. Diff-carrying atoms (`historyLength`/`getDiffSince`) are a middle path when a computed list needs incremental updates.

### Gaps
- No benchmark of a retrofitted get/set against native signals. An empirical demo was attempted, but running downloaded package code was blocked in this session.
- I found no authoritative article specifically on adding signals to Backbone-style models. The pattern is inferred from Vue `ref`, MobX atoms and the alien-signals starter.

## 7. Python analogs and naming of collection classes

### Takeaway
Python's `list` is the counterpart of JS `Array`. `collections.UserList` is the documented "wrap a real list in `.data` and subclass the wrapper" pattern, which is exactly the user's `List` wrapping an array. `deque` and `OrderedDict` are specialised containers with no direct JS built-in equivalent. For observability, traitlets (Jupyter's `HasTraits` + `observe`) and param (HoloViz, "reactive programming") are the established observable-attribute libraries. Pydantic is validation, not observation. `observ` is a newer reactive-state library. For naming: "Collection" (Backbone, .NET `ObservableCollection`) or "List" for an ordered set of models, "Model"/"Item" for records, and "Store" for the root container or registry.

### Cited Findings
- Python `collections`: `deque` is a "list-like container with fast appends and pops on either end"; `OrderedDict` is a "dict subclass that remembers the order entries were added"; `UserList` is a "wrapper around list objects for easier list subclassing"; `UserDict` is the same for dict. Also `ChainMap`, `Counter`, `defaultdict` and `namedtuple()`. On `UserList`: "The need for this class has been partially supplanted by the ability to subclass directly from `list`; however, this class can be easier to work with because the underlying list is accessible as an attribute", and it "is a useful base class for your own list-like classes" — [Python docs: collections](https://docs.python.org/3/library/collections.html)
- traitlets: "Traitlets implement the observer pattern". It provides `obj.observe(handler, names=["bar"])`, the `@observe("bar")` decorator, change objects with `change.old`/`change.new`, `@validate` (proposal → value) and `@default`. "Trait types can emit other events types than trait changes. This capability was added so as to enable notifications on change of values in container classes." — [traitlets docs](https://traitlets.readthedocs.io/en/stable/using_traitlets.html). Latest 5.16.1 (2026-08-03) — [PyPI: traitlets](https://pypi.org/project/traitlets/)
- param 2.4.2 (2026-09-03): "Declarative parameters for robust Python classes and a rich API for reactive programming" — [PyPI: param](https://pypi.org/project/param/)
- pydantic 2.14.2 (2026-10-29): "Data validation using Python type hints" — [PyPI: pydantic](https://pypi.org/project/pydantic/)
- observ 1.0.1 (2026-10-09): "Reactive state management for Python" — [PyPI: observ](https://pypi.org/project/observ/)
- Collection naming across ecosystems:
  - Backbone: `Model` and `Collection` (events `add`/`remove`/`reset`/`sort`/`update`) — [Backbone](https://backbonejs.org/#Events-catalog)
  - .NET: `NotifyCollectionChangedAction {Add, Remove, Replace, Move, Reset}`, used by `ObservableCollection<T>` — [Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/system.collections.specialized.notifycollectionchangedaction)
  - Knockout: `observableArray` — [Knockout](https://knockoutjs.com/documentation/observableArrays.html)
  - MobX: `observable.array`/`ObservableMap`/`ObservableSet` — [MobX](https://mobx.js.org/intercept-and-observe.html)
  - mobx-keystone: `Model`, `TodoStore`, `registerRootStore`, `ArraySet`, `ObjectMap` — [mobx-keystone](https://www.npmjs.com/package/mobx-keystone)
  - Svelte: reactive `Set`/`Map` in `svelte/reactivity` — [Svelte](https://svelte.dev/docs/svelte/$state)
  - Solid: `createStore` — [@solidjs/signals](https://www.npmjs.com/package/@solidjs/signals)

### Inferences
- **Python `list` vs JS `Array`** (background knowledge, not fetched this session): both are dynamic, heterogeneous, zero-indexed arrays. Python splits mutation into `append`/`extend`/`insert`/`pop`/`remove`/`del a[i:j]`/slice assignment/`sort`/`reverse`, where JS uses `push`/`unshift`/`splice`/`sort`/`reverse`. A Python slice assignment `a[i:j] = xs` is JS's `splice(i, j - i, ...xs)`, the same primitive MobX normalises everything into. Python has no built-in observable list. Traitlets `List` notifies on reassignment, and in-place mutation tracking needs special container types (see Gaps).
- **Naming suggestions for the user**:
  - `Item` (or `Model`) for the base record.
  - `List` for an ordered, index-addressable sequence of Items (Python and Java style). This is the natural name because it supports positional `insert`/`move`. "Collection" in Backbone and .NET means a set of models that may be sorted by a comparator, and in Java it is the superinterface of List and Set.
  - `Set`/`Map` (or `Index`) for keyed, unordered membership.
  - `Store` (or `Registry`/`Repository`) for the root that owns identity (id → Item), persistence and sync.
  - Delta events: `insert`/`remove`/`move`/`replace`/`reset`, which mirror .NET's enum and map cleanly to JSON Patch (`add`/`remove`/`move`/`replace`). Avoid "add" for positional insert if "add" is also used for unordered sets.
- If the user's `List` wraps an internal array (the `UserList` style, with `.data`) rather than subclassing `Array`, he keeps full control over interception. That is the same reason Python added `UserList`, and the reason MobX moved to Proxies rather than Array subclasses.

### Gaps
- I did not verify whether traitlets `List` traits notify on in-place `append`. The fetched docs only mention container event types in general, and I believe in-place mutation does not notify by default.
- No source fetched for `observ`'s design (believed to be a Python port of Vue's reactivity, unverified).
- No primary source fetched for Python `list` method semantics or Java `Collection`/`List` naming; those statements are background knowledge.

## 8. Simplifying concessions: simple approaches, what each gives up, and when you don't need more

### Takeaway
Most shipped apps use one or more of these concessions, and several well-known systems are built on them on purpose:
- Backbone's "listen to `change`, call `render()`".
- Backbone's `reset` instead of granular add/remove.
- Preact's "replace the array" idiom.
- Lit's "re-render the template, the library updates only the dynamic parts".
- Turbo 8 and htmx's "re-render HTML and morph the DOM".

Each concession gives up one of four things: (1) DOM state preservation (focus, scroll, input, animation), (2) O(change) cost, (3) precise deltas for persistence and sync, or (4) glitch-free derived state. You usually only need more when lists are large (thousands of rows), when the DOM holds uncontrolled state, or when the change stream itself is the product: persistence logs, multi-user sync, undo. The user's List-delta persistence requirement is that last case. So the simple approaches are fine for the UI, but he still needs a delta stream for storage.

### Cited Findings
- **Concession A — coarse change event plus re-render the whole view (Backbone pattern).** Backbone's intro tells you to "bind your view's `render` function to the model's `"change"` event". The example uses `this.listenTo(this.model, "change", this.render)`. "The default implementation of render is a no-op", and you "Override this function with your code that renders the view template from model data" — [Backbone docs](https://backbonejs.org/)
- **Concession B — reset the list instead of granular deltas.** "Use reset to replace a collection with a new list of models … triggering a single "reset" event on completion … without triggering any add or remove events on any models". It is meant for when "you have so many models to change that you'd rather just update the collection in bulk". The docs' example uses it to bootstrap a collection on page load. The middle ground is `collection.set(models)`, a "smart" update that adds, merges and removes and then fires one `"update"` — [Backbone docs](https://backbonejs.org/); [Events catalog](https://backbonejs.org/#Events-catalog)
- **Concession C — replace the whole array on every change (immutable style with signals).** The Preact guide's todo example: "`todos.value = [...todos.value, { text: text.value }];`" and "`todos.value = todos.value.filter((t) => t !== todo);`". "A signal will only update if you assign a new value to it." For finer grain, the guide's Models section makes each item its own model with its own signals (`new TodoItemModel(text)`), and its `<For>` component renders "lists from signal arrays with automatic caching of rendered items" — [Preact: Signals guide](https://preactjs.com/guide/v10/signals/)
- **Concession D — coarse "something changed, re-render the component" with a smart template layer.** "Lit performs updates asynchronously so property changes are batched", and "Updates happen at microtask timing, which means they occur before the browser paints" — [Lit: Lifecycle](https://lit.dev/docs/components/lifecycle/). Lit "can re-render only the parts of template that have changed" — [Lit: Templates overview](https://lit.dev/docs/templates/overview/). A list with `map` keeps DOM nodes and reassigns values; `repeat` (keyed) is only needed "If updating the DOM nodes is more expensive than moving them" or when nodes have uncontrolled state. "In most cases, using loops or map is an efficient way" — [Lit: Lists](https://lit.dev/docs/templates/lists/)
- **Concession E — re-render HTML wholesale and morph the DOM (no client state graph).** Turbo 8: `<meta name="turbo-refresh-method" content="morph">`, after which "Turbo will only update the DOM elements that have changed, keeping the rest untouched". "Under the hood, Turbo uses the fantastic idiomorph library." Morphing "delivers better sensations because it keeps the screen state". For multi-user updates: "the server broadcasts a single general signal, and pages smoothly refresh with morphing" — [Turbo handbook: Page refreshes](https://turbo.hotwired.dev/handbook/page_refreshes). htmx's essays argue for this simplicity, e.g. "Complexity Budget", "Locality of Behavior (LoB)", "Why htmx Does Not Have a Build Step" and "When To Use Hypermedia?" — [htmx essays](https://htmx.org/essays/)
- **Concession F — positional (unkeyed) list updates.** Lit `map` reuses nodes by position. Solid separates `<For>` (by item identity; "its rendered node can be moved instead of recreated") from `<Index>` (positional) — [Lit: Lists](https://lit.dev/docs/templates/lists/); [Solid: For](https://docs.solidjs.com/reference/components/for)
- **Concession G — fire events per mutation, without batching or transactions.** This is what MobX `observe` does ("even inside a transaction `observe` will fire its listeners for each mutation") and what MST patches do ("don't respect transaction boundaries") — [MobX: intercept & observe](https://mobx.js.org/intercept-and-observe.html); [MST: Patches](https://mobx-state-tree.js.org/concepts/patches)
- **Concession H — store snapshots instead of deltas.** MST 9 made snapshots lazy, "computed on read" — [MST v9.0.0 release](https://github.com/mobxjs/mobx-state-tree/releases/tag/v9.0.0). tldraw's persistence splits snapshots into "`document` (shapes, pages, bindings) which you typically save to a server" and "`session` (camera, selection, UI state) which you keep per-user locally", and "Loading a snapshot replaces the current document" — [tldraw: Persistence](https://tldraw.dev/docs/persistence)

### Inferences
**What each concession costs and when it's enough** (synthesis of the findings above plus general engineering judgement):

| Concession | What you give up | Genuinely enough when… | Upgrade path |
|---|---|---|---|
| A. `change` → `render()` whole View (rebuild `.el` contents) | Focus, caret and scroll inside the View; CSS transitions; child View identity (children recreated); O(view size) work per change; risk of render storms if several `set`s happen in a row | Views are small (a card, a row, a form section); updates are user-paced; no focused inputs inside the re-rendered region | Batch per microtask (Lit-style `requestUpdate`); or render into a fresh node and morph (idiomorph/morphdom); or per-field bindings (signals/effects) |
| B. List `reset` → re-render all rows | Row DOM state and identity; O(n) per change; no record of what changed, so nothing to persist incrementally | Lists of tens to low hundreds of rows; changes arrive as whole snapshots anyway (server fetch, sort, filter); initial bootstrap | Keyed diff on reset (udomdiff ~0.5 KB, Lit `repeat`, idiomorph); or emit granular insert/remove/move for local edits and keep `reset` only for bulk loads |
| C. Replace array immutably (signal-of-array) | Every consumer of the array recomputes; no delta, so you must diff to get one; easy to accidentally mutate in place with no notification (alien-signals needs `trigger()` for that) | Small lists; functional style; you persist whole snapshots | Per-item signals or models inside the array (Preact Models pattern); keyed `For`/`mapArray` |
| D. Coarse component re-render with a template engine that patches only dynamic parts (Lit, uhtml) | Some wasted work re-evaluating unchanged expressions; with `map`, node state can attach to the wrong item after reorders | Almost always for UI; this is the mainstream default | Keyed `repeat` for reorderable or stateful rows; signals bound directly into template holes |
| E. Re-render HTML and morph (Turbo/htmx/idiomorph) | Client-side derived state and offline editing; per-change server round-trip; morph heuristics can mismatch without stable ids | Server is the source of truth; CRUD UIs; you broadcast "refresh" rather than deltas | Add ids for morph matching; move hot interactive parts to client components |
| F. Positional (unkeyed) list patching | Moves become many updates; node state stays at the position, not with the item | Append-only logs, static tables, lists without per-row DOM state | Key by `item.id` |
| G. Per-mutation sync events, no batching | Chatty network and storage; observers can see intermediate states (glitches); N renders for N `set`s | Local, synchronous, single-writer persistence (e.g. append to an IndexedDB log) | Coalesce per action or microtask into one patch array (Backbone's single `update`, tldraw transactions) |
| H. Persist full snapshots instead of deltas | Bandwidth and storage proportional to total size; harder merge and conflict resolution; no fine-grained undo or audit | Small documents; single-user; autosave on a debounce; "save" buttons | JSON-Patch-style op log (MST/keystone), with snapshots as periodic checkpoints |

**Recommended "simple but not painted into a corner" baseline for the user**:
1. Keep coarse events on `Item` (`change`, `change:key`), plus a microtask-batched `View.render()`. No signals are needed initially.
2. Give `List` granular events (`insert`/`remove`/`move`/`replace`, plus `reset` for bulk). They are cheap to emit at the mutation site, and they are needed anyway for persistence.
3. Bind lists by applying those events directly (insert/remove/move one row View). On `reset`, fall back to a keyed diff (udomdiff), or to plain re-render for small lists.
4. Persist by coalescing List and Item events per microtask into an op array, with snapshots as checkpoints.
5. Add signals later only if hand-wiring `on('change:x')` for derived values becomes error-prone. The `get`/`set` seam (§6) makes this a non-breaking change.

The concession to avoid is B or C *for persistence*. Reset-and-re-render is fine for pixels, but a persistence or streaming layer fed only "the list changed" must diff snapshots to recover deltas, which is harder than emitting them at the source.

### Gaps
- I found no measured thresholds (e.g. "full re-render is fine up to N rows") from an authoritative source. The "tens to low hundreds" figures above are judgement, not cited data.
- No primary source states the simplicity rationale for Turbo morphing beyond "keeps the screen state" and "broadcasts a single general signal". The htmx essays were listed by title but not read in full.

## 9. Named companies and products using the major libraries, and how

### Takeaway
Verified adopters, from official pages and npm dependency manifests:
- **Lit**: design systems at Adobe (Spectrum Web Components), IBM (Carbon), Google (Material Web), SAP (UI5), Esri (Calcite), ING (Lion), Cisco/Webex (Momentum), Red Hat (PatternFly Elements), Vaadin, Umbraco and Nord Health.
- **Backbone**: historically Trello, Airbnb, WordPress.com, Basecamp, Hulu, USA Today, Khan Academy, SoundCloud, Stripe and Walmart Mobile. Today it still underpins Jupyter widgets (ipywidgets).
- **@vue/reactivity** standalone: powers Alpine.js.
- **idiomorph**: used by 37signals' Turbo 8 and by htmx.
- **mobx + MST**: used by JBrowse 2, a genome browser, through a forked `@jbrowse/mobx-state-tree`.
- **mobx-keystone**: its Yjs/Loro bindings target collaborative apps, but I found no named company.
- **alien-signals**: Vue 3.6 and XState.
- **@preact/signals-core**: Lit (via `@lit-labs/preact-signals`) and DXOS.
- tldraw ships its own signals library (`@tldraw/state`).

### Cited Findings
**Lit (web-component base class, reactive properties, controllers)**
- lit.dev, under "Many of the world's most forward-looking organizations are building with Lit", lists Spectrum Web Components, Auro Design System, Momentum UI, Carbon Web Components, Lion Web Components, Pharos Design System, UI5 Web Components, Shoelace ("Components"), Hilla Framework, Clarity Core and others. The page does not itself name parent companies — [lit.dev](https://lit.dev/)
- The npm manifests confirm a direct `lit` dependency in:
  - `@spectrum-web-components/base` 1.12.5 ("The `SpectrumElement` base class as created by mixing `SpectrumMixin` onto `LitElement`"; Adobe) — [npm](https://www.npmjs.com/package/@spectrum-web-components/base)
  - `@carbon/web-components` 2.66.0 ("Web components for the Carbon Design System"; IBM) — [npm](https://www.npmjs.com/package/@carbon/web-components)
  - `@material/web` 2.5.0 ("Material web components"; Google) — [npm](https://www.npmjs.com/package/@material/web)
  - `@esri/calcite-components` 5.2.0 ("Web Components for Esri's Calcite Design System") — [npm](https://www.npmjs.com/package/@esri/calcite-components)
  - `@vaadin/component-base` 25.3.5 — [npm](https://www.npmjs.com/package/@vaadin/component-base)
  - `@lion/ui` 0.25.0 (ING's Lion) — [npm](https://www.npmjs.com/package/@lion/ui)
  - `@patternfly/elements` 5.0.0 (Red Hat) — [npm](https://www.npmjs.com/package/@patternfly/elements)
  - `@umbraco-cms/backoffice` 18.3.0 (the Umbraco CMS admin UI) — [npm](https://www.npmjs.com/package/@umbraco-cms/backoffice)
  - `@nordhealth/components` 5.4.4 — [npm](https://www.npmjs.com/package/@nordhealth/components)
  - `@momentum-design/components` 0.142.4 — [npm](https://www.npmjs.com/package/@momentum-design/components)
  - `@shoelace-style/shoelace` 2.20.1 — [npm](https://www.npmjs.com/package/@shoelace-style/shoelace)
  - How: each component extends `LitElement`, uses reactive properties, and gets batched microtask re-renders ([Lit lifecycle](https://lit.dev/docs/components/lifecycle/)).
- Lit + Preact signals: `@lit-labs/preact-signals` 1.0.3 depends on `@preact/signals-core ^1.3.0` ("Preact Signals integration for Lit") — [npm](https://www.npmjs.com/package/@lit-labs/preact-signals). `@lit-labs/signals` 0.3.0 integrates the TC39 polyfill — [npm](https://www.npmjs.com/package/@lit-labs/signals)

**Backbone (Model/Collection/events)**
- The backbonejs.org Examples list includes Trello, Airbnb, WordPress.com, Basecamp, Hulu, USA Today, Disqus (in "embedded widgets"), Khan Academy, SoundCloud Mobile, Foursquare, Bitbucket, Stripe, Walmart Mobile, Groupon Now!, Pandora, Delicious, Vox, Gawker Media, Quartz, Rdio, SeatGeek, Code School and others. The page gives no per-company detail in the portion read. "Backbone is an open-source component of DocumentCloud", "originally extracted from a Rails application" — [backbonejs.org](https://backbonejs.org/). These are historical examples (the 2010s), and I have no evidence of current use for most of them.
- Current use: `@jupyter-widgets/base` 6.0.12 ("Jupyter interactive widgets") depends on `backbone` 1.4.0 — [npm](https://www.npmjs.com/package/@jupyter-widgets/base). How (background knowledge, not fetched because the ipywidgets docs page was robots-blocked): each widget's browser-side model is a Backbone model, synced over Jupyter comms with Python traitlets attributes marked `sync=True`. This is a live Python-traitlets ↔ JS-Backbone observable bridge, directly relevant to the user's Python-analogy question.

**@vue/reactivity standalone**
- Alpine.js: "Alpine uses VueJS's reactivity engine under the hood to provide these functions" (`Alpine.reactive`/`Alpine.effect`) — [Alpine: Reactivity](https://alpinejs.dev/advanced/reactivity). `alpinejs` 3.17.5 depends on `@vue/reactivity ~3.5.40` — [npm: alpinejs](https://www.npmjs.com/package/alpinejs). This is the strongest precedent for using `@vue/reactivity` without Vue in a no-build, sprinkle-on-the-DOM library.

**alien-signals**
- The core algorithm was ported into Vue 3.6 (PR #12349) and into XState's atom architecture (PR #5250). It is used in Vue language-tools' `language-core` "for virtual code generation" — [alien-signals README, Adoption](https://github.com/stackblitz/alien-signals). uhtml 5 uses the WebReflection fork — [npm: uhtml](https://www.npmjs.com/package/uhtml)

**@preact/signals-core**
- Beyond Preact (`@preact/signals` 2.11.4 depends on `@preact/signals-core ^1.14.5` — [npm](https://www.npmjs.com/package/@preact/signals)), it is used by Lit's labs integration (above) and by DXOS: `@dxos/echo-signals` 0.8.3 is a "Plugable integration between ECHO and Signals libraries", depending on `@preact/signals-core` — [npm](https://www.npmjs.com/package/@dxos/echo-signals). ECHO is DXOS's local-first database, so this is an example of signals wired to a synced object store.

**MobX / MobX-state-tree**
- JBrowse 2 ("a pluggable, open-source platform for genome visualization") core packages `@jbrowse/core`, `@jbrowse/product-core` and `@jbrowse/app-core` 4.3.0 depend on `mobx ^6.15.3`, `mobx-react ^9.2.1` and `@jbrowse/mobx-state-tree ^5.6.0` (their own MST fork). They are still on MobX 6, not 7 — [npm: @jbrowse/core](https://www.npmjs.com/package/@jbrowse/core); [jbrowse.org](https://jbrowse.org/)
- The MST README says only that MobX "is used (along with MobX-State-Tree) by companies worldwide". The MST examples page lists demo apps (Bookshop, Boxes, TodoMVC) and no companies — [MST README (npm)](https://www.npmjs.com/package/mobx-state-tree); [MST examples](https://mobx-state-tree.js.org/intro/examples)
- Counter-signal: Infinite Red's Ignite React Native boilerplate was long known for shipping MST. Its current `ignite-cli` 11.5.0 boilerplate `package.json` has no `mobx` or `mobx-state-tree` dependency (checked in the npm tarball) — [npm: ignite-cli](https://www.npmjs.com/package/ignite-cli). The earlier MST default is background knowledge.

**mobx-keystone**
- Positioned for collaborative apps through the `mobx-keystone-yjs` and `mobx-keystone-loro` CRDT bindings (both 2.0.1, 2026-09-25) and the 2.4 serialization and remote-call API — [mobx-keystone README](https://www.npmjs.com/package/mobx-keystone). No named company adopters were found in the README or changelog.

**idiomorph / morphdom (DOM morphing)**
- 37signals / Turbo 8: the idiomorph README quotes Jorge Manrubia of 37signals: "We are indeed using idiomorph and we'll include it officially as part of Turbo 8 … started with morphdom, but eventually switched to idiomorph as we found it way more suitable" — [idiomorph README](https://github.com/bigskysoftware/idiomorph). The Turbo handbook confirms "Turbo uses the fantastic idiomorph library" for `turbo-refresh-method="morph"` page refreshes — [Turbo: Page refreshes](https://turbo.hotwired.dev/handbook/page_refreshes)
- htmx: "Idiomorph was created to integrate with htmx", via the `idiomorph/htmx` module — [idiomorph README](https://github.com/bigskysoftware/idiomorph). morphdom is used by the htmx 1.x `morphdom-swap` extension and by TS LiveView — [morphdom README](https://github.com/patrick-steele-idem/morphdom)

**tldraw (in-house signals + record store)**
- tldraw ships `@tldraw/state` (signals: atoms, lazy computeds, transactions, diff history) and `@tldraw/store` (depends on `@tldraw/state`), both at 5.6.0. The `tldraw` package and `@tldraw/editor` depend on `@tldraw/state` — [npm: @tldraw/state](https://www.npmjs.com/package/@tldraw/state); [npm: @tldraw/store](https://www.npmjs.com/package/@tldraw/store). How: editor state is "reactive", the store is "The reactive database holding all records", and `store.listen` diffs feed persistence and sync — [tldraw: Editor](https://tldraw.dev/docs/editor); [tldraw: Store](https://tldraw.dev/sdk-features/store)

**Svelte 5, Solid, Angular, Knockout**
- I found no primary source naming companies for these. knockoutjs.com lists no adopters — [knockoutjs.com](https://knockoutjs.com/)

### Inferences
- For a framework-free OO codebase, the most transferable precedents are:
  - Alpine (a no-build library using `@vue/reactivity` as an embedded engine);
  - tldraw (signals for reads, plus a record store that emits added/updated/removed diffs for sync);
  - DXOS ECHO (signals wired to a local-first object DB);
  - Jupyter widgets (Backbone-model events bridging to Python traitlets).
  Each of these keeps an explicit change-delta channel alongside or instead of pure signals, which supports the "events for deltas, signals for rendering" split in §6.
- Lit's adoption is concentrated in design systems (reusable components), not app-state management. Lit is evidence for "coarse reactive properties plus a batched re-render" (§8, concession D) working at large scale.

### Gaps
- The web-search budget ran out before I could verify widely repeated adopter claims: the Azure Portal on Knockout; Coinbase, Amazon or Microsoft on MobX; YouTube or Photoshop on Lit; companies on Valtio, Solid or Svelte 5. They are omitted rather than asserted.
- The "how" for the Backbone examples (Trello, Airbnb and others) is not described on backbonejs.org in the part read. Only the names are cited.
- Whether JBrowse plans to move to MobX 7 / MST 9 is unknown.
