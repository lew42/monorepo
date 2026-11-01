# Replay lab — press a button, reload, and see what the real Item, Task and Store bring back and what they run a second time

Open it at [/framework/core/Item/replay/](/framework/core/Item/replay/). Four examples (start a task that spawns an agent; show, hide, toggle and drag a layer; +1 in two tabs; ask an AI for a summary). Every press goes to two columns at once: **saved as changes** (the method runs, the Store saves the `set` lines it made) and **saved as calls** (`item.act("start")` runs it and saves `{start:{}}`). **Reload the page** rebuilds a fresh object from each column's saved lines and says whether it matches, and how many agents or AI calls happened again.

The classes are the real ones. Only the outside world (an agent spawner, an AI) and the disk are faked, so the page works on a static host: nothing posts to `/api/item` and nothing opens a socket.

## Files

```
page.js              the page: `new ReplayLab()`
ReplayLab.js         the page view: the short answer, the four tabs (#task #layer #counter #ai), the rules and the differences
LabExampleView.js    one example drawn: buttons, two columns (live object, saved lines, after-reload box), drag
LabExample.js        one example's state, no DOM: two columns, press, reload, diffs, verdict
 TaskExample.js  LayerExample.js  CounterExample.js  DocExample.js     each: its class, buttons, keys to compare, drawing, lesson text
LabColumn.js         one way of saving ("changes" or "calls"): a tape, a live tab, the last reload
LabTape.js           a saved log in memory (the stand-in for task.jsonl); LabTape.Store is the real Store opened from and flushed into it
LabWorld.js          the fake outside world: spawn_agent(), ask_ai(), counted
LabTask.js  LabLayer.js  LabCounter.js  LabDoc.js    the real Task / Item with one verb each (start spawns, summarize asks)
replay.css           styles, every class `core-item-replay-*`
```

## How a press goes (all real except the two fakes)

1. `LabTape.open(Class, {write: true})` calls the real `Class.open(url)`. `LabTape.Store` is a real `Store` whose `open()` reads the tape and whose `flush()` writes to it, so `Item.open` does everything else itself: `root_from`, `store.attach(host)`, replay, `replay_end`.
2. A press is `item[verb]()` (changes) or `item.act(verb, args)` (calls). The Store listens for the `delta` event, nests the line, queues it, and one microtask later `LabTape.save` stamps it (`by`, `ts`, as the item tool does) and keeps it.
3. Another tab is a second `tape.open(Class, {tab: "tab B", write: true})`. After both press, the first tab hears the other's line through `store.read(...)`, the live tail's own path.
4. **Reload** is one more `tape.open(Class)` with no write. `LabWorld.mark()` / `since()` counts what the world did while it was built.

## What it found (the page lists these; the tests pin them)

- Replaying a saved call runs the method again, so the lab's `start()` spawns again. Replaying change lines never calls a method.
- No replaying flag sits on the item. `Store.replaying` is true on that store while it replays (page load); `Store.replay_depth` is above 0 while any store or `Item.replay` replays, and nothing is saved then; `Task` also sets a private `_applying`.
- A running `Task`'s clock is saved data: `start()` saves `ran_since` with the state and `pause`/`stop`/`complete` save `ran_ms`, so change lines and replayed calls both keep the time. A line saved before `ran_since` existed has no `ran_since`: the task loads with its banked time only.
- Two tabs through `act()` cancel out on a toggle and keep both clicks on +1; through `set` it is the other way round.
- `Item.replay(lines)` and `Item.open(url)` build a plain Item differently: `replay-vs-open.test.mjs` fails on purpose, nothing is fixed.

## Tests

- `node ../replay.test.mjs` — characterization tests, all pass today ([replay.test.mjs](../replay.test.mjs)).
- `node ../replay-vs-open.test.mjs` — fails on purpose ([replay-vs-open.test.mjs](../replay-vs-open.test.mjs)).

## Watch out

- `LabTask.Store` (and the other Lab classes') is set to `LabTape.Store`; a new Lab class needs the same line or `Class.open` goes to the network.
- `LabTape.sources` and `Store.instances` keep one entry per open; it is a lab, not a long-running app.
- The two option boxes set statics (`LabTask.skip_when_replaying`, `LabDoc.skip_when_replaying`), which are global to the page.
