# log — how objects write down what they do (ideas, not built)

The owner's direction (2026-10-05, dictated; the session page of VS Code tab 60d9def6 has the full words): **any object can log anything, and when something breaks, the log shows the program's flow, object by object.** Today these are notes for later; nothing here is built yet.

## Ideas
- **Every object can log.** Anything you would `console.log` (a value, a condition, a step) can go to the object's log instead, so a failure on the phone, where there is no console, still leaves a trail.
- **Where it lands, by default:** a persistent object writes to its page's `log.jsonl` (next to `page.jsonl`); any object can be pointed at its own file instead. It should work without remembering to configure it.
- **Actions:** a method can be logged as an action. "Triggered by an event" and "triggers an event" are two different things and may need two systems.
- **Server and client:** a page that fails to load on the phone should leave a line from the browser and from the server.
- **Size:** logs grow; a compaction step can fold old lines (a log may not compact the same way a page's state does).
- **Batching writes:** append many lines in one write, not one write per line. `Item.Store` already batches per tick (all of one tick's lines go in one `FsFile.append` call); a setting for "how often we write" (e.g. every 250 ms) would extend that to logs and busy pages.

## First user
Dictate: the mic, the connection to Whisper and each Whisper answer, with timings (task [voice-pipeline](/framework/ai/2026-10-04/voice-pipeline/)).

## To-do
- A `Log` class (folder = file = class name) and a decision on its line shape, after voice-pipeline shows what it actually needs.
