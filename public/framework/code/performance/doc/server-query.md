# Server-side query: before and after (2026-10-12)

The Sessions page can load from node, the default on the dev socket ([`?source=files`](/framework/ai/sessions/?source=files) forces the files path) ([ext/Query](/framework/ext/Query/), [core/Page/doc/server.md](/framework/core/Page/doc/server.md)). Script and raw numbers: `measure/` in the [build folder](/framework/ai/sessions/2026/10/12/session-87bec773/server-query/build/measure/results.jsonl).

| Run | Width | First row ms | Transfer KB | Socket KB | JS heap MB | Long tasks ms |
|---|---|---|---|---|---|---|
| before (main site, files) | 400 | 952 | 4,647 | 976 | 84 | 125 |
| before (main site, files) | 1920 | 4,163 | 4,647 | 977 | 66 | 636 |
| after (private server, remote) | 400 | 1,167 | 3,174 | 630 | 17 | 52 |
| after (private server, remote) | 1920 | 1,218 | 3,174 | 631 | 18 | 53 |
| after-files (same private server) | 400 | 1,155 | 3,485 | 984 | 34 | 51 |
| after-files (same private server) | 1920 | 1,270 | 3,484 | 980 | 33 | 0 |

**Fair reading:** the private worktree server lacks generated files the main site has, so compare the last two groups (same server): remote saves about 310 KB of transfer and 350 KB over the socket, and halves the JS heap. Time to first row is the same (about 1.2 s): the page is dominated by loading its own modules. The large before numbers (84 MB heap, 636 ms of long tasks) came from the main site and are not a like-for-like baseline.

**Node:** one query over 8,729 sessions (date window, text search, sort, two sums) takes a median of 1.4 ms (20 runs); loading the index takes the heap from 5 to 21 MB. Screenshots at 400 and 1920 are `proof-400.png` and `proof-1920.png` in the build folder; no console errors apart from 404s for generated files missing in the worktree.


**Parity (2026-10-12):** with the source column, Claude-only cost, closed/attention, and buckets + nesting run in node, the Sessions page in remote mode (`label: parity`): first row 1.18 s at 400 and 1.24 s at 1920, 45 rows, 2,679 DOM nodes, 3.2 MB transferred (page modules), 22 MB heap, 0.8 MB over the socket, one 51 ms long task.
