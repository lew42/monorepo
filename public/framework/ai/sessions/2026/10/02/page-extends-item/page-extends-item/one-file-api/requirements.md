# Minion C — one file API: only `FsFile` talks to the socket's `write` and `append`

Load the `minion` skill first, then the `code` skill.

**The owner's words (2026-10-02, via vscode-mastermind):** "ONE file API. Today 13 modules call dev/Socket/Socket.js directly, through two RPCs … After FsFile.append lands: 1. Make FsFile (append/write) the ONLY thing that calls the socket's write and append. Migrate all those callers to `new FsFile({path}).append(line)` or the item's store. 2. Have Append.js accept one shape: an array of objects. 3. Leave whole-file write only for non-log files (source edits, uploads). 4. Add a grep check in the review for `async_rpc("append"` and `async_rpc("write"` outside FsFile. This is the last step of your task, after Page extends Item works."
Parent brief: [../requirements.md](../requirements.md). Decisions: [../task.jsonl](../task.jsonl).
Before you start: read `ext/filesystem/FsFile.js` (minion B gave it `append` and a lazy `store`), `core/Item/Store.js`, and B's `page-on-item/task.jsonl`.

**Work ONLY in the worktree** `C:\Code\lew42\worktrees\page-extends-item` (branch `worktree/page-extends-item`, server http://localhost:59417/). Commit after each finished piece, by exact path.

## The callers (census by the task mastermind, 2026-10-02; re-grep before you start)

The grep: `async_rpc("append"|"write"`, plus `request({ method: "append" | "write" })` and helpers such as `ask(socket, "write", …)`, across public/, excluding ai/20*.

| append (a line to a .jsonl) | write (a whole file) |
|---|---|
| ai/v/3/page.js:141 | ext/Saver/FileSaver.js:27 (Item's whole-JSON save; stays a write) |
| ai2/inbox.js:405, 416 | ext/filesystem/FsFile.js:87 (the one allowed caller) |
| ext/AITask/decisions.js:187, rank.js:61 | ai/v/new.js:40 |
| ext/Ask/reply.js:72 | ext/DesignTool/audit/twin.js:98, 114 (a read-modify-write of a .jsonl: it MUST become append) |
| ext/Chat/Mic.js:751 | imagine/cms/edit/page.js:113, cms/json/json.js:182 |
| ext/drawer/tabs/settings.js:84 (`request`) | imagine/paging/make/made.js:254, real.js:392–393 |
| ux/Content/ContentModule.js:60 (`request`) | imagine/stream/stream.js:206 |
| ux/Dictate/Dictate.js:654, 819, 835 | core/Page/generator/export.js:304, 309 (`ask`) |
| ux/Dictate/variants/v1/Dictate.js:482, 575 | dev/Socket/Socket.js:463 (its own `write` helper: find its callers) |
| imagine/cms/json/json.js:157, importance/importance.js:139 | |
| imagine/paging/make/made.js:360, stream/stream.js:183 | |
| layouts/browse/verdicts.js:94 | |
| core/Item/Store.js (A's append: route it through FsFile) | |

## Deliverables
1. **FsFile is the only caller.** Every caller above goes through `new FsFile({path}).append(line)`, `FsFile.write(text)`, or an Item's store.
   - Give FsFile what the callers need, as small seams. For example, `append` takes one object or an array of objects (still ONE RPC call), and returns true or false. If a caller needs `FsFile.for(path)` or a static `FsFile.append(path, line)`, add it once.
   - Store's batched flush calls the FsFile, not the socket.
   - Keep each caller's behaviour, including any catch, fallback or warning.
   - FileSaver may keep a whole-file write, but through `FsFile.write`.
2. **`Server/plugins/SocketServer/Append.js` accepts one shape: an array of objects.** Refuse anything else with `"append refused: lines must be an array of objects"`, and keep the `.jsonl`-under-public/ gate.
   - This lands in the SAME merge as the migration, so no caller is left sending a string.
   - A Server/ change goes live only after a dev server restart. Restart the worktree's own server through Servex (`restart_server`) and prove it there. Say in your log that main needs a restart after the merge.
3. **Whole-file write is only for non-log files** (source edits, uploads, saved JSON). `FsFile.write` refuses a `.jsonl` path with a warning that points to `append`.
   - `twin.js` becomes appends. Both of its files are logs. If it relies on a header line, write that header once when the file is new (an append onto an empty file).
4. **A grep check in the review.** Add a check to `Server/review.mjs` (or the smoke and merge gate it runs; read it first and pick the one place) that fails when `async_rpc("append"`, `async_rpc("write"`, `method: "append"` or `method: "write"` appears outside `ext/filesystem/FsFile.js` and `dev/Socket/` in public/ (excluding ai/20*).
   - Document the check in one line in `ext/filesystem/readme.md` and in the review doc it belongs to.
5. **Prove it.**
   - The grep check passes on the branch.
   - Plant a stray `async_rpc("append"` in a scratch copy and the check fails.
   - Headless, zero console errors, on each of: `/framework/ai/v/3/`, `/framework/ai2/`, `/framework/ext/AITask/`, `/framework/ux/Content/`, `/framework/ux/Dictate/`, `/framework/ext/DesignTool/`, `/imagine/stream/`, `/imagine/cms/`, `/layouts/browse/`, and `/framework/core/Item/live/`.
   - One real append through the new path lands one line: the live demo's Add, and one other caller.
   - The Append RPC refuses a string line.

6. **LiveList tests that also teach** (the owner, via vscode-mastermind, 2026-10-02: "a small handful of LiveList tests that also TEACH. Each test is a few lines of plain code proving one behaviour … and reads as an example on the page. Put them beside the class and show them on its page.")
   - Write `core/List/LiveList.examples.js` beside the class. It exports an array of about 6 `{title, run}` entries, where `run()` is a few plain lines that throw on failure. Cover:
     - add after
     - remove
     - move
     - order
     - each event fires with its line shape
     - replay rebuilds the same list (record the lines, replay them into a fresh list, compare `toJSON()`)
   - Write each `run` the way you'd want a newcomer to copy it: real names, no helpers beyond a one-line `check(cond, msg)`.
   - Show them on `/framework/core/List/` (core/List/page.js): one row per example, with its title, its source (`run.toString()`, highlighted the way the site shows code), and a live pass or fail from running it in the page.
   - Make `item-core/test.mjs` import and run the same examples in node, so one set of examples is both the docs and the test.
   - **Runner decision (made by the mastermind):** `/framework/ai/tests/` is the model-eval library (`AITest`, page.jsonl runs judged per model), not a code test runner, so it doesn't fit. The examples array plus a tiny loop is the runner. Say in one line in `core/List/readme.md` where the examples live.
   - Prove it: node passes; the List page at 400 and 1920 shows each example green; make one example fail and check that the page shows it red.

## Rules
- Keep every existing page working. Nothing writes off localhost.
- Every Node spawn sets `windowsHide: true`. Stop anything you start. Scratch scripts are `pei-c-*.mjs` in the session scratchpad.
- Log decisions and caveats in your task.jsonl as they happen.
- End your turn with a one-screen summary: callers moved (count), the check, test results, and anything not done.
