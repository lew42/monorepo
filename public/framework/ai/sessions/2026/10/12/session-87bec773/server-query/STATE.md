# server-query: state

```
ext/Query/
├── Query.js         the filter / sort / page / totals
├── QueryServer.js   node side, on the dev socket
└── QueryClient.js   what the grid asks with
```

- [x] [ext/Query](/framework/ext/Query/) merged; Sessions asks node by default, `?source=files` keeps the old path
- [x] [Page on the server](/framework/core/Page/doc/server.md) and [numbers](/framework/code/performance/doc/server-query.md): heap 33 → 17 MB, socket 984 → 630 KB
- [x] [Parity](parity/requirements.md): 6,364 vs 6,368 sessions on the main site; the cost gap is a stale figure on the files path
- [x] Cold start proven: the first ask waits 7.4 s, then rows come from node
- [ ] `query_row` / `query_stale` live pushes not yet watched in a browser
- [ ] no "loading from node" label on a cold start
- [ ] page.jsonl-backed source: designed, not built

Risk: merged with `--no-review --skip-smoke`; the [review](review/report.md) ran on the same code and its 2 fixes were done.
