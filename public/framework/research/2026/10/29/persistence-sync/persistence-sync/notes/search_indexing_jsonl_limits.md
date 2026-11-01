# Search, Querying and Indexing over Append-Only JSONL Logs, and Where JSONL Stops Being Enough (as of Oct 2026)

Context: vanilla-JS framework (no TS, no bundler), Item/List/Page objects persisted as append-only JSONL delta logs (one log per Page), streamed over websockets, leaning toward Cloudflare (Durable Objects + SQLite, D1, R2). Also logs AI-agent sessions as JSONL. Needs cross-document search, autocomplete, queries, and indexes that stay in sync incrementally.

Note on sourcing quality: Cloudflare, SQLite, DuckDB, MiniSearch, Automerge, Figma, Langfuse, LangSmith and OpenTelemetry claims come from primary docs or engineering blogs. JS-library benchmark numbers and JSONL parse-throughput numbers come from secondary or anonymous sites and are flagged as such.

## 1. Ranking algorithms (TF-IDF, BM25, BM25F); when vectors/hybrid add value; "RAG is overkill" evidence and counter-evidence

### Takeaway
BM25 is the 1990s product of a lineage that starts with H.P. Luhn's term-frequency work at IBM (1957), continues with Karen Spärck Jones's inverse document frequency (1972), and ends with Robertson and Spärck Jones's probabilistic model, implemented in the Okapi system at City University London. It is still a strong baseline that is hard to beat, especially out-of-domain (BEIR). Vectors add value mainly when vocabulary differs between query and document (paraphrase), for multilingual or non-text data, and at large scale. Anthropic's own numbers show hybrid (BM25 + embeddings + reranker) beats either alone. They also say that for a corpus under about 200k tokens you should skip retrieval and put everything in the prompt. The "abandoned RAG" story the user remembers is most likely Boris Cherny's account of Claude Code dropping a vector index for agentic grep. That account is about grep, not BM25. I could not identify a specific video that pairs "abandoned vector DB" with "old IBM algorithm."

### Cited Findings
**Lineage**
- Hans Peter Luhn (IBM) published "A Statistical Approach to Mechanized Encoding and Searching of Literary Information" in the *IBM Journal of Research and Development*, vol. 1 no. 4, pp. 309–317 (1957). It covers statistical analysis of a document collection for machine literature searching. Title variants differ between sources. — [History of Information](https://www.historyofinformation.com/detail.php?id=752); PDF at [Stanford](https://linguist289.stanford.edu/luhn57.pdf)
- "Karen Spärck Jones (1972) conceived a statistical interpretation of term-specificity called Inverse Document Frequency (idf)", in "A Statistical Interpretation of Term Specificity and Its Application in Retrieval", *Journal of Documentation*, 1972. "Variations of the tf–idf weighting scheme were often used by search engines as a central tool in scoring and ranking a document's relevance given a user query." A 2015 survey found 83% of text-based recommender systems in digital libraries used tf-idf (Wikipedia tags this [verify]). — [Wikipedia: tf–idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)
- BM25 rests on the probabilistic retrieval framework developed in the 1970s–80s by Stephen E. Robertson, Karen Spärck Jones and others. "Okapi" is the name of the first system to use it, the Okapi IR system at City University London (1980s–1990s). Key papers: "Okapi at TREC-3" (1994) and "Okapi at TREC-7" (1998); 2009 monograph by Robertson and Zaragoza. BM25 and its variants "represent TF-IDF-like retrieval functions." — [Wikipedia: Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25)
- BM25F treats a document as several fields ("streams", e.g. title, body, anchor text) with per-field weights, saturation and length normalization. BM25+ fixes how standard BM25 unfairly penalizes long documents that do match the query (one extra parameter, default 1.0). — [Wikipedia: Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25)

**How BM25 works, in plain terms** (as described by Anthropic): BM25 is a lexical ranking function for exact word or phrase matches. It extends TF-IDF in two ways: it normalizes for document length, and it caps how much repeating a term can raise the score (saturation). TF-IDF itself measures how important a word is to a document relative to the whole collection. — [Anthropic, Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval)

**Hybrid evidence (Anthropic, Contextual Retrieval)**
- Top-20 retrieval failure rate (1 − recall@20), baseline 5.7%. Contextual Embeddings: 3.7% (−35%). Contextual Embeddings + Contextual BM25: 2.9% (−49%). Adding reranking: 1.9% (−67%). The reranker takes the top 150 candidates and keeps 20. Passing 20 chunks to the model worked better than 10 or 5. BM25 results are merged with embedding results through rank fusion. — [Anthropic](https://www.anthropic.com/news/contextual-retrieval)
- "If your knowledge base is smaller than 200,000 tokens (about 500 pages)", include it in the prompt and skip RAG; prompt caching makes this cheaper. Contextualizing chunks is a one-time cost of $1.02 per million document tokens. — [Anthropic](https://www.anthropic.com/news/contextual-retrieval)

**BEIR benchmark (Thakur et al. 2021)**
- Covers 18 datasets, 9 tasks and 10 systems, scored by nDCG@10. BM25 is "a robust baseline". Neural models beat it in-domain (MS MARCO) by 7–18 points, but BM25 often wins zero-shot, and dense retrievers often fall well behind under domain shift. BM25 + cross-encoder rerank generalized best (beat BM25 on 16 of 18 datasets) but costs more than 350 ms per query. Sparse retrieval ran at about 20–25 ms on CPU. — [alphaXiv summary of BEIR, arXiv 2104.08663](https://alphaxiv.org/overview/2104.08663v4)

**"RAG is overkill" / agentic grep**
- Boris Cherny (Anthropic, Claude Code): early Claude Code used RAG over a codebase index built with off-the-shelf tools. "Eventually, we landed on just agentic search as the way to do things… It outperformed everything else by a lot. By a lot. This was surprising." He describes the evidence as "just 'vibes' – internal vibes. There are some internal benchmarks also, but mostly vibes." Agentic search means letting the agent run as many glob/grep cycles as it needs, "at the cost of latency and tokens". His reasons for dropping the index: it drifts out of sync with the code, and stored indexes are a security concern. Article dated May 27, 2025; it links to a YouTube video. — [OfficeChai](https://officechai.com/ai/claude-researcher-explains-how-agentic-search-performed-better-than-rag-for-code-generation/)
- Akita (Apr 6, 2026), "Is RAG Dead?": for most chat-with-your-docs cases, a lexical filter (grep or BM25) plus a large context window beats a vector-DB stack. His reasoning: the reader model is now strong, so the retriever can favor broad recall; lexical misses are easy to debug; the index is always fresh because nothing needs re-embedding. He cites LaRA (ICML 2025; 2,326 test cases, 11 LLMs), which found "no silver bullet". He claims, from reading leaked Claude Code source, that its memory uses a MEMORY.md index, topic files and grep over transcripts, with no vector DB (this is not verified from official sources). — [akitaonrails.com](https://akitaonrails.com/en/2026/04/06/rag-is-dead-long-context/)
- Counter-evidence from the same article. Vectors still help with: very large corpora; vocabulary mismatch (a user writes "my wifi's down" while the docs say "loss of connectivity at the physical layer"); non-text data; strict ~100 ms latency with small input budgets; compliance and audit. LaRA found RAG wins on dialogue and generic queries. — [akitaonrails.com](https://akitaonrails.com/en/2026/04/06/rag-is-dead-long-context/)
- "Vectorless RAG" (Jul 2026): route each query to a BM25, SQL, knowledge-graph, long-context or dense lane, then fuse the results. BM25 + dense with reciprocal rank fusion is the "Best ROI" step before adding rerankers, which run on the top 50–200 candidates. The article claims hybrid reaches 78–86% recall@10 versus 60–71% for a single retriever, but gives no source or method, so treat these figures as weak. — [mer.vin](https://mer.vin/2026/07/vectorless-rag-explained-when-to-skip-embeddings-and-route-hybrid-retrieval-in-2026/)

### Inferences
- The "IBM, decades-old" detail the user remembers probably blends two things: Luhn's 1957 IBM term-frequency work (the root of TF-IDF) and Okapi BM25 (City University London, 1990s; not IBM). The "dropped vector DB and got better, faster results" argument most closely matches the Claude Code / Cherny story (agentic grep). Many 2025–26 posts echo it, often adding BM25 as the stronger form of "grep".
- For his corpora (Pages of short Items, and agent session logs full of identifiers, file paths, function names and error strings), lexical ranking is likely the right default, because exact-token matches dominate. Vectors earn their cost only if he often searches by paraphrase ("that time I fixed the flaky websocket thing") and lexical search misses.
- A practical upgrade path is: BM25 alone → BM25 with field weights (task title > prompt > response) → add embeddings only for the session-summary field, fused with RRF → reranker last.

### Gaps
- I could not find the specific video (abandoning RAG for a "decades-old IBM" ranking algorithm). Searches surfaced the Cherny/Claude Code video (via OfficeChai) and many blog echoes, but none mention IBM.
- The exact BM25 formula and the default k1/b values did not survive Wikipedia extraction. Commonly cited defaults (k1 ≈ 1.2–2.0, b ≈ 0.75) are from general knowledge, not verified here.

## 2. Tools usable from his stack (JS libs, SQLite FTS5 incl. Cloudflare, servers, Cloudflare managed search, CLI scanning)

### Takeaway
SQLite FTS5 is available on every SQLite he might touch: Durable Object SQLite, D1, node:sqlite and better-sqlite3. Cloudflare's docs explicitly list the FTS5 module for both DO and D1, and D1 export refuses databases that contain virtual tables. In the browser or in Node without a bundler, MiniSearch (BM25+, discard/replace/vacuum, JSON serialization, autoSuggest) is the most direct fit. Orama adds richer features and binary persistence; FlexSearch is fastest and has persistent DB adapters. Lunr is stale. Fuse.js is fuzzy matching, not ranked full-text search. Cloudflare AI Search (formerly AutoRAG) went GA Oct 1, 2026, with hybrid search and usage billing from Nov 1, 2026.

### Cited Findings
**SQLite FTS5 (official doc)**
- `bm25()`: lower values are better matches. The result is negated so that `ORDER BY bm25(ft)` sorts best first. Optional per-column weights such as `bm25(email, 10.0, 5.0)` give BM25F-style field weighting. — [SQLite FTS5](https://sqlite.org/fts5.html)
- Trigram tokenizer: matches any substring and can accelerate `LIKE`/`GLOB`. "Substrings consisting of fewer than 3 unicode characters do not match any rows when used with a full-text query." With `case_sensitive=1`, only GLOB is accelerated. — [SQLite FTS5](https://sqlite.org/fts5.html)
- `prefix='2 3'` builds dedicated 2- and 3-character prefix indexes. A prefix query is written `term*` with the asterisk outside quotes. — [SQLite FTS5](https://sqlite.org/fts5.html)
- Table modes:
  - Contentless (`content=''`): stores only the index.
  - Contentless-delete (`content='', contentless_delete=1`; SQLite ≥ 3.43.0): supports DELETE, INSERT OR REPLACE and UPDATE.
  - External content (`content='t1', content_rowid='a'`): "the user must keep the index in sync", usually with triggers. Insert: `INSERT INTO fts_idx(rowid,b,c) VALUES(new.a,new.b,new.c)`. Delete: `INSERT INTO fts_idx(fts_idx,rowid,b,c) VALUES('delete',old.a,old.b,old.c)`. Update: the delete, then the insert. "The FTS5 table must be updated first (so that the content table row is still available to it)."
  — [SQLite FTS5](https://sqlite.org/fts5.html)
- Maintenance commands:
  - `'rebuild'` discards the index and rebuilds it from the content table (not available for contentless tables).
  - `'optimize'` merges all b-trees into one.
  - `'merge'` does incremental merging.
  - `automerge` (default 4) controls background merging. When `crisismerge` (default 16) is reached, all b-trees on a level are merged at once, which can make a single write slow.
  - `highlight()` and `snippet()` (token limit 1–64) produce excerpts.
  — [SQLite FTS5](https://sqlite.org/fts5.html)

**FTS5 on Cloudflare (verified directly from Cloudflare docs)**
- D1 "supports a subset of SQLite extensions": the "FTS5 module" (including `fts5vocab`), the JSON extension and math functions. — [D1 SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/)
- D1 export: "Export is not supported for virtual tables, including databases with virtual tables." The documented workaround is to drop the virtual tables, export, then recreate them. "A running export will block other database requests." `wrangler d1 execute --file` accepts files up to 5 GiB. — [D1 import/export](https://developers.cloudflare.com/d1/best-practices/import-export-data/)
- D1 limits:
  - Database size: 10 GB on Paid, 500 MB on Free.
  - Databases per account: 50,000 on Paid, 10 on Free.
  - Max row, string or BLOB: 2 MB. Max SQL statement: 100 KB.
  - Queries per Worker invocation: 1,000 on Paid, 50 on Free.
  - Time Travel retention: 30 days on Paid, 7 on Free.
  — [D1 limits](https://developers.cloudflare.com/d1/platform/limits/index.md)
- Durable Object SQLite supports "a subset of SQLite extensions", listing the "FTS5 module" (including `fts5vocab`). "Writing data to SQLite virtual tables also counts towards rows written." "Every row update of an index counts as an additional row." Point-in-time restore covers the past 30 days. Cursors should be "fully consume[d]… synchronously before the next await"; a cursor resumed after an await may see rows that changed in the meantime. — [DO SQLite storage API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
- DO limits:
  - Storage per object: 10 GB (the FAQ says 1 GB on Free, which conflicts with the limits table).
  - Account storage: unlimited on Paid, 5 GB on Free.
  - Max row, string or BLOB: 2 MB. Max SQL statement: 100 KB. Max columns: 100.
  — [DO limits](https://developers.cloudflare.com/durable-objects/platform/limits)

**FTS5 in Node**
- `node:sqlite` includes "FTS5, JSON functions, R*Tree, sessions/changesets". Availability by version:
  - 22.5–22.12: needs `--experimental-sqlite`.
  - 22.13+: no flag needed, but prints an experimental warning.
  - 24.15.0+, 25.7.0+ and 26+: Release Candidate (Stability 1.2), no warning.
  better-sqlite3 and @photostructure/sqlite also support FTS5 and JSON. — [photostructure library comparison](https://photostructure.github.io/node-sqlite/documents/library-comparison.html)
- The official Node v22.15 docs mark `node:sqlite` as Stability 1.1 ("Active development") and document `allowExtension`/`loadExtension()` (v22.13.0). They do not list compile options. — [Node.js v22.15 sqlite docs](https://nodejs.org/download/release/v22.15.0/docs/api/sqlite.html)
- better-sqlite3's default compile options include `SQLITE_ENABLE_FTS3`, `FTS4`, `FTS5`, `JSON1` and `RTREE`. The source is a docs mirror listing an old bundled SQLite (3.29.0); current releases bundle newer SQLite. — [better-sqlite3 compilation doc (mirror)](https://cdn.jsdelivr.net/npm/better-sqlite3-prebuilt@1.0.2/docs/compilation.md)

**JS libraries**
- MiniSearch API:
  - Indexing: `add`, `addAll`, and `addAllAsync` (chunked).
  - Removal: `remove(document)` needs the full original document; "The document to remove must NOT have changed between indexing and removal, otherwise the index will be corrupted." `discard(id)` needs only the ID and marks the document as discarded; `vacuum()` (batchSize 1000, batchWait 10 ms) or `autoVacuum` cleans up later. `replace(doc)` is discard plus add.
  - Search: `autoSuggest()` does prefix search on the last term. Options include `prefix: true`, `fuzzy: 0.2`, `boost: {title: 2}`, and `combineWith` AND/OR/AND_NOT.
  - Serialization: `toJSON()`, `loadJSON(json, sameOptions)`, and `loadJSONAsync()` (batched, non-blocking).
  — [MiniSearch API docs](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html)
- MiniSearch changelog: v5.0.0 switched scoring to BM25+; v6.0.0 added the `bm25` parameter option plus `discard`, `discardAll`, `replace` and vacuuming; v7.0.0 added `loadJSONAsync`; the latest listed is v7.2.0 (`stringifyField` option). The changelog gives no dates. — [MiniSearch CHANGELOG (7.2.0)](https://cdn.jsdelivr.net/npm/minisearch@7.2.0/CHANGELOG.md)
- Orama: `persist(db, format)` / `restore(format, data)` in json, binary (MessagePack, the default), dpack, or seqproto (fastest restore). A 10,000-document DB takes about 5.2 MB as JSON, 2.8 MB binary, 2.1 MB dpack and 1.8 MB seqproto. Runs in Node or the browser. The restore format must match, there is no built-in versioning, and for DBs over 100 MB the docs suggest seqproto or incremental loading. — [Orama data-persistence docs (Mintlify mirror)](https://www.mintlify.com/oramasearch/orama/plugins/data-persistence)
- FlexSearch 0.8 persistent adapters: IndexedDB (browser), Redis, SQLite, Postgres, MongoDB and ClickHouse. "Auto-Commit is enabled by default and will process changes asynchronously in batch"; set `commit:false` and call `await index.commit()` for manual batching. `.export()`/`.import()` remain for in-memory indexes. There is no migration tool. — [FlexSearch persistent.md (0.8.2)](https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.8.2/doc/persistent.md)
- Comparative numbers (secondary; PkgPulse, Mar 9, 2026; Feb 2026 npm averages; benchmarks labeled "approximate"):

  | Library | npm/week | Bundle | Index notes | Approx. query time |
  |---|---|---|---|---|
  | Fuse.js | ~1.1M | ~4 KB | No persistent index; rebuilt on each `new Fuse` | ~800 ms at 10K docs × ~500 words |
  | FlexSearch | ~600K | ~6 KB | Exports JSON | ~5 ms exact, ~3 ms prefix; ~15 ms at 100K docs (vs ~2000 ms for Fuse); no typo tolerance |
  | Orama | ~150K | ~22 KB | Live insert/update/remove | ~8 ms exact, ~4 ms prefix, ~6 ms fuzzy |

  — [PkgPulse](https://www.pkgpulse.com/guides/fusejs-vs-flexsearch-vs-orama-client-side-search-2026)
- Lunr: an Apr 18, 2026 Hugo forum thread says Lunr.js "hasn't had any action in 6 years"; suggested replacements are Pagefind, FlexSearch and Fuse. — [Hugo Discourse](https://discourse.gohugo.io/t/re-hugo-search-tools-lunrjs-appears-abandoned/57022)
- Pagefind: indexes the built HTML after the site build, splitting the index into ordered chunks so a query loads only the relevant ones. Full-text search across all of MDN loads "under 300KB total, including the Pagefind library itself"; typical sites load "closer to 100KB". It is built for static sites and re-indexes on each build. — [CloudCannon: Introducing Pagefind](https://cloudcannon.com/blog/introducing-pagefind/)

**Servers (for scale context)**
- Typesense (C++) "holds its entire index in RAM" and is GPL-3.0. Meilisearch (Rust) uses a memory-mapped LMDB store on disk and is MIT. Both offer typo tolerance, search-as-you-type, vector/hybrid search and managed clouds. The article is undated ("2026") and has no benchmarks. — [dev.to/pickuma](https://dev.to/pickuma/typesense-vs-meilisearch-in-2026-self-hosted-search-compared-5em3)
- Quickwit joined Datadog (Jan 9, 2025). Quickwit and a major tantivy update were to be relicensed under Apache 2.0, and the team said it would be "heads down building a new product with Datadog" (a maintenance-risk signal for Quickwit). — [Quickwit blog](https://quickwit.io/blog/quickwit-joins-datadog)

**Cloudflare managed search**
- AI Search reached GA on Oct 1, 2026. New instances default to hybrid search, which "combines semantic vector retrieval with full-text matching". Sources are websites and R2. "Usage-based billing begins on November 1, 2026." Embedding and reranking calls are included in AI Search pricing. Multimodal embedding models are supported. Text, code and OCR'd PDFs can be up to 10 MiB; other formats up to 4 MiB. — [Cloudflare changelog](https://developers.cloudflare.com/changelog/post/2026-10-01-ai-search-generally-available/)
- AI Search pricing (secondary, ppc.land, Oct 5, 2026):
  - Ingestion $0.75 per 1M tokens (images +$0.50 per 1M).
  - Storage $2.00 per GB-month.
  - Semantic or hybrid queries $0.75 per 1k; full-text queries $0.10 per 1k.
  - Free each month: 5M ingestion tokens, 10 GB storage, 1,000 semantic and 1,000 full-text queries.
  - Formerly AutoRAG (open beta April 2025). It "combines Workers AI, Vectorize, R2, and Browser Run into a fully managed index and retrieval pipeline."
  — [ppc.land](https://ppc.land/cloudflare-ai-search-starts-billing-november-1-at-0-75-per-million-tokens/)
- Vectorize pricing:
  - Workers Free includes 30M queried dimensions per month and 5M stored dimensions.
  - Workers Paid includes the first 50M queried dimensions per month (then $0.01 per million) and the first 10M stored dimensions (then $0.05 per 100M).
  - Example: 10,000 vectors × 768 dimensions with 30,000 queries per month costs about $0.31/month.
  - No charge for CPU, memory, active hours or number of indexes.
  — [Vectorize pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)

**CLI / scan-the-files tools**
- DuckDB: `read_ndjson` and `read_ndjson_auto` are aliases for `read_json` with newline-delimited format, and `read_json` auto-detects the format. "Multiple files can be read at once by providing a glob or a list of files." `sample_size` defaults to 20480 (set −1 to scan everything). `maximum_object_size` defaults to 16,777,216 bytes. Also: `union_by_name` and `ignore_errors` (NDJSON only); `COPY` defaults to NDJSON. — [DuckDB JSON loading](https://duckdb.org/docs/1.4/data/json/loading_json)

### Inferences
- Because FTS5 exists in both DO SQLite and D1, he can use a single schema and query dialect from Node (local dev) to production. The D1 export restriction does not matter if the JSONL log stays the source of truth: export the base tables, or simply rebuild the FTS index from the log.
- On DO billing, every FTS5 write counts toward rows written, and the FTS shadow tables multiply the rows touched. Batching index updates (one transaction per debounce window) cuts cost.
- Per-DO limits (10 GB, 2 MB per row) are far above what one Page's index needs. Cross-Page search needs either a global index (D1, or a dedicated "search index" DO) or a fan-out query.
- MiniSearch fits his no-bundler constraint well: one ESM file, no dependencies, BM25+, autoSuggest, and `replace`/`discard` keyed by ID, which matches "upsert by item id". Avoid `remove(doc)` unless the exact original document is kept.

### Gaps
- Not verified this session: MiniSearch, uFuzzy and Lunr bundle sizes and download counts; uFuzzy maintenance status; the Elasticsearch/OpenSearch and Meilisearch/Typesense versions and pricing; Cloudflare AI Search rates on the official Limits & pricing page (only the secondary source was read).
- Whether D1 or DO SQLite enables the FTS5 trigram tokenizer and `contentless_delete` depends on their SQLite version, which these docs don't state.

## 3. Keeping indexes in sync with an append-only log (projections, high-water marks, idempotent upserts, rebuild)

### Takeaway
Treat every index as a derived projection of the log. Store a checkpoint (the last applied sequence number) with the index, apply only newer entries, make each apply an idempotent upsert keyed by item ID, batch the writes, and keep "rebuild from the log" as the always-available recovery path, ideally blue-green. Figma's checkpoint-plus-journal recovery is the clearest real-world model of this.

### Cited Findings
- Figma's multiplayer service:
  - It keeps file state in memory and "periodically writes the state of the file to storage every 30 to 60 seconds" as a compressed checkpoint in S3, replicated across regions.
  - The journal (DynamoDB) is "asynchronously written to as multiplayer accepts incoming changes". Each change gets a per-file incrementing sequence number, and each checkpoint records the sequence number current when it was written. The journal is written about every 0.5 s.
  - Recovery: load the latest checkpoint, then apply journal entries with higher sequence numbers (goal "<1s of data loss").
  - It "persists 95% of changes within ~600ms" and handles more than 2.2B changes per day.
  — [Figma: Making multiplayer more reliable](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- Blue-green projection rebuild: build the new projection in parallel, catch it up from the log, verify it against the old one at the swap point, subscribe it to the live stream, then switch reads. For read-your-writes, either have the UI wait for the projection to catch up, or have the write model return a provisional "pending" state. — [tessl event-sourcing-tests reference](https://tessl.io/registry/testland/event-sourcing-tests/files/references/rebuild-swap-and-read-your-writes.md)
- SQLite FTS5 external-content tables are kept in sync by triggers (delete-old, then insert-new), and `'rebuild'` regenerates the index from the content table. — [SQLite FTS5](https://sqlite.org/fts5.html)
- FlexSearch persistent indexes batch changes by default (auto-commit, async). Manual mode: `commit:false`, then `await index.commit()`. — [FlexSearch persistent.md](https://cdn.jsdelivr.net/gh/nextapps-de/flexsearch@0.8.2/doc/persistent.md)
- MiniSearch supports `replace` (discard plus add by ID) and lazy `vacuum`/`autoVacuum` for incremental maintenance, and `toJSON`/`loadJSON` for snapshotting the index. — [MiniSearch API](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html)
- Langfuse moved from update-based event merging to inserts, and later to immutable rows. It keeps a materialized view with truncated input/output for list and search views. — [Langfuse: ClickHouse at agent scale](https://langfuse.com/resources/engineering/clickhouse-at-agent-scale)
- cc-conversation-search, a Claude Code history indexer, runs its `index` step ("instant, no AI calls") just before every search. It scans `~/.claude/projects/`, keeps an `index_queue` table for batches, and supports `--days N` or `--all`. — [cc-conversation-search](https://github.com/akatz-ai/cc-conversation-search)
- Cloudflare safety nets: DO SQLite point-in-time recovery covers 30 days; D1 Time Travel covers 30 days (Paid) or 7 days (Free). — [DO SQLite API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/); [D1 limits](https://developers.cloudflare.com/d1/platform/limits/index.md)

### Inferences
- Concrete recipe for his DOs, one per Page:
  - Keep `index_state(log_id, last_seq)` in the same SQLite database as the FTS table.
  - On each debounce tick (e.g. 250 ms–2 s, or N entries), read log entries with seq > last_seq. Fold them into the latest state per item ID, so only the final version of each item is indexed.
  - Write the FTS rows (delete-then-insert by rowid, or INSERT OR REPLACE on a contentless_delete table) and update `last_seq` in one transaction.
  - Because the checkpoint and the index commit atomically, a crash can never leave them out of step. Re-applying a range is harmless because upserts by ID are idempotent.
- For the cross-Page global index (D1 or a search DO), each Page DO pushes (page_id, item_id, seq, text) batches. The global index stores `last_seq` per page_id and ignores anything at or below it.
- Use a monotonic per-log seq rather than timestamps as the high-water mark; Figma's design shows why. If seq numbers already exist in the JSONL deltas, the index needs nothing else.
- Recovery path: drop the index, replay all JSONL (snapshot plus tail), and swap. Keep this script tested, because it is also the D1-export workaround and the schema-migration path.
- In the browser, a MiniSearch index can be persisted with `toJSON` together with its `last_seq`. On load, restore it and apply only the tail.

### Gaps
- I did not fetch a primary EventStoreDB/Kurrent doc on checkpointed catch-up subscriptions; only search snippets surfaced. Marten and Kurrent projection docs would strengthen this section.

## 4. Autocomplete (prefix indexes, tries, FTS5 prefix, trigram, edge n-grams; latency)

### Takeaway
For autocomplete within a Page or a user's corpus, FTS5 prefix queries backed by `prefix='2 3'` indexes are the simplest server-side option. Trigram adds substring matching (3 or more characters). MiniSearch `autoSuggest`, FlexSearch and Orama prefix search run in single-digit milliseconds on the client.

### Cited Findings
- FTS5: `prefix='2 3'` builds dedicated prefix indexes; queries use `term*`. The trigram tokenizer matches any substring and indexes LIKE/GLOB, but fewer than 3 characters matches nothing. — [SQLite FTS5](https://sqlite.org/fts5.html)
- MiniSearch `autoSuggest()` returns suggested queries sorted by score, doing prefix search on the last term and combining terms with AND by default. Fuzzy and prefix options can be combined. — [MiniSearch API](https://lucaong.github.io/minisearch/classes/MiniSearch.MiniSearch.html)
- Approximate client-side prefix query times at 10K docs: FlexSearch ~3 ms, Orama ~4 ms; Fuse.js ~800 ms for comparable queries (secondary, labeled approximate). — [PkgPulse](https://www.pkgpulse.com/guides/fusejs-vs-flexsearch-vs-orama-client-side-search-2026)
- Typesense and Meilisearch both provide search-as-you-type and typo tolerance out of the box. — [dev.to/pickuma](https://dev.to/pickuma/typesense-vs-meilisearch-in-2026-self-hosted-search-compared-5em3)
- Akita cites ~100 ms as a "strict latency" budget for search. — [akitaonrails.com](https://akitaonrails.com/en/2026/04/06/rag-is-dead-long-context/)

### Inferences
- Suggested layering:
  - Client-side MiniSearch over the current Page's Items for instant results (no network).
  - FTS5 prefix query in the Page DO for that Page's full history.
  - Global D1 FTS5 (or a search DO) for cross-Page results, debounced about 100–150 ms after typing stops.
  - Trigram only where users type mid-word fragments (file paths, identifiers in agent logs).
- Edge n-grams (Elasticsearch-style) do the same job as FTS5 prefix indexes; tries and radix trees are what in-memory libraries use internally. I believe MiniSearch uses a radix tree, but this was not verified from the docs this session.

### Gaps
- No authoritative source fetched for typical autocomplete latency budgets (the often-quoted figures are ~100 ms total, ~50 ms server), for MiniSearch's internal radix tree, or for Elasticsearch edge_ngram behavior.

## 5. JSONL limits and compaction policy (scan speeds, when to move querying to SQLite/DuckDB, non-destructive compaction, what others keep vs discard)

### Takeaway
JSONL works well as the log: streaming keeps memory flat, it appends cheaply, and grep and DuckDB can read it. As a query engine it fails, because every query is a full scan through JSON.parse. Keep JSONL (or snapshot plus tail segments) as the source of truth and move querying to SQLite/FTS5 (per DO or D1) or DuckDB once queries need sub-100 ms response over more than a few tens of MB, or need joins and aggregations. Most systems' "compaction" (Kafka compaction, the Redis AOF rewrite) destroys history. To keep it, archive old segments (e.g. to R2) before compacting the hot copy, as Figma does with checkpoints plus a journal, or as Automerge does with snapshots that still contain the full change history.

### Cited Findings
- JSONL parse throughput (weak source: anonymous, single runs on an M1, ~500-byte records, Node 20):
  - Node `JSON.parse` on the whole file: ~48k records/s (~24 MB/s). readline + `JSON.parse`: ~55k records/s (~27 MB/s). `ndjson` stream: ~81k records/s (~40 MB/s).
  - Python json: 72k records/s; orjson: 244k records/s. Go with 1 goroutine: 313k records/s; with 10 goroutines: ~2.38M records/s. jq: ~45k records/s.
  - Decompression: gzip −6 ~125 MB/s, zstd −3 ~333 MB/s.
  - Memory stays roughly constant (5–12 MB) when streaming, whereas a JSON array needs about 5–6× the file size in memory.
  - Gives no threshold for switching to a database.
  — [jsonl-rest.pages.dev](https://jsonl-rest.pages.dev/performance/)
- DuckDB reads NDJSON globs directly with auto-detection and `ignore_errors`, so it can query a folder of JSONL logs with SQL without importing them. — [DuckDB JSON loading](https://duckdb.org/docs/1.4/data/json/loading_json)
- Langfuse: "Substring search over payloads is a full scan." Multi-megabyte payloads don't scan faster on bigger hardware, so they adopted ClickHouse text indexes with token matching and a truncated-payload materialized view. — [Langfuse](https://langfuse.com/resources/engineering/clickhouse-at-agent-scale)

**What other systems keep vs discard**
- Kafka log compaction keeps at least the latest value per key per partition, indefinitely, and preserves offsets; the active segment is not compacted. A tombstone (null value) removes a key after `delete.retention.ms` (default 24 h). `min.compaction.lag.ms` keeps recent messages uncompacted. Time/size retention deletes "regardless of their content." What is lost: intermediate states per key and deleted keys, so the topic stops being a complete timeline. With tiered storage, segments already moved to remote storage are not compacted. — [Conduktor](https://conduktor.io/glossary/kafka-log-compaction-explained)
- Redis 7 multi-part AOF: a base file (RDB or AOF format), incremental files, and a manifest that is "the authoritative record". A rewrite produces a new base and "the old incremental files are removed", so only the current state survives. — [OneUptime](https://oneuptime.com/blog/post/2026-03-31-redis-multi-part-aof-70/view)
- automerge-repo: each change is saved as an incremental chunk. "Occasionally" the repo combines all stored changes into a snapshot chunk and deletes only the incremental chunks it loaded, which "is what makes it safe to use concurrently." Keys: `[docId, "snapshot"|"incremental", heads-or-hash]`. — [Automerge storage](https://automerge.org/docs/reference/under-the-hood/storage/)
- Figma: S3 checkpoints every 30–60 s plus a DynamoDB journal with sequence numbers, so the latest state = checkpoint + newer journal entries. All journal changes are checkpointed within 30 minutes to meet the cross-region replication target. The post does not say how long journal entries are kept. — [Figma blog](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- Cloudflare: DO SQLite point-in-time restore covers 30 days; D1 Time Travel covers 30 days (Paid) or 7 (Free). These are recovery windows, not long-term history. — [DO SQLite API](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/); [D1 limits](https://developers.cloudflare.com/d1/platform/limits/index.md)
- Compression of a 100 MB JSONL test file: gzip −6 → 12.4 MB, zstd −3 → 11.2 MB, xz → 7.2 MB (weak source). — [jsonl-rest.pages.dev](https://jsonl-rest.pages.dev/performance/)

### Inferences
- Rough thresholds, my estimate scaled from the weak benchmark (a fast Node path may run several times faster):
  - At ~25–40 MB/s, a 10 MB Page log parses in well under a second. That is fine to replay once on DO wake.
  - A 1 GB session-log archive takes on the order of 30 s per full scan. That is too slow for interactive search but fine for a nightly DuckDB or ripgrep job.
  - Move to an index once (a) a log exceeds roughly 10–50 MB, (b) cold-start replay hurts, or (c) you need cross-file search under 100 ms.
  - ripgrep is typically much faster than JSON.parse because it never parses the JSON. A grep pre-filter followed by parsing only the matching lines is a cheap middle ground.
- Non-destructive compaction policy for Page logs:
  1. Seal the current segment at seq N.
  2. Write snapshot@N, recording its base seq the way Figma's checkpoints do.
  3. Upload the sealed segment(s) and the snapshot to R2 under immutable keys, e.g. `pages/{id}/seg-{fromSeq}-{toSeq}.jsonl.zst`.
  4. Only after the upload is confirmed, drop the segment from the hot DO.
  5. The hot store holds snapshot@N + the tail. R2 holds the full history.
  6. Retention tiers: hot (DO: snapshot + tail), warm (R2 segments, zstd), optional cold (Infrequent Access).
  This is Figma's checkpoint + journal pattern combined with Automerge's "delete only what you've merged" rule.
- What is lost by snapshot-only compaction (the Kafka/Redis style): per-field edit history, who changed what and when, undo beyond the snapshot, the ability to rebuild a projection with new semantics (e.g. re-tokenize old text), audit trails, and time-travel debugging. Archiving segments before compaction keeps all of this. The only cost is R2 storage, and the archive is also the data source for rebuilding any future index.

### Gaps
- No high-quality, reproducible Node JSONL benchmark was found; the only figures come from an anonymous site. Measuring locally on his own logs is advised.
- Redis `auto-aof-rewrite-percentage`/`min-size` defaults weren't confirmed. EventStoreDB/Kurrent scavenging behavior wasn't fetched.

## 6. Searching AI agent session logs (Claude Code, Cursor, Langfuse, LangSmith, Helicone, OpenTelemetry GenAI)

### Takeaway
Session storage varies widely: plain JSONL (Claude Code), an opaque SQLite key-value blob store (Cursor), ClickHouse with text indexes (Langfuse), and metadata-keyed threads (LangSmith). OpenTelemetry's GenAI conventions (now in a separate repository) define the fields worth indexing: `gen_ai.conversation.id`, agent ID and name, operation name, tool name, and token usage including cache tokens. The common working approach to "finding past work" is to keep the raw logs and build a small FTS5 index over extracted, truncated text plus structured metadata, refreshed incrementally before each search.

### Cited Findings
- Claude Code stores sessions at `~/.claude/projects/{project}/{session}.jsonl`. The cc-conversation-search tool indexes them into SQLite FTS5 (`~/.conversation-search/index.db`, with tables `messages`, `conversations`, `message_summaries_fts` and `index_queue`). It stores full user messages but only the first 500 and last 200 characters of assistant messages, preserves the conversation tree via `parent_uuid`, and filters by `--since`/`--until`/`--days`. — [cc-conversation-search](https://github.com/akatz-ai/cc-conversation-search)
- Cursor stores chats in SQLite `state.vscdb` (macOS: `~/Library/Application Support/Cursor/User/globalStorage/state.vscdb`; reported at ~1.5 GB). The `cursorDiskKV` table maps text keys to BLOB values: `composerData:UUID` for conversations and `bubbleId:UUID:UUID` for messages. Because modern conversations split messages into bubble records, a `LIKE` search on `composerData` misses text. "UUID ordering is NOT chronological"; use ROWID. The format may change with Cursor updates. — [cursor-conversations-mcp research notes](https://glama.ai/mcp/servers/@vltansky/cursor-conversations-mcp/blob/e15492520e0e7518a8cac8a884453ce2528d9b4e/docs/research.md)
- Langfuse:
  - All traces, observations and scores have been in ClickHouse since v3 (Dec 2024). Tables are sorted by project and time with monthly partitions and skip indexes.
  - A 2026 "observations-first" design uses one wide, mostly immutable table with `user_id` and `session_id` denormalized onto every observation.
  - Full-text search "uses ClickHouse text indexes", is token-based, and the v2 API rejects substring "contains" queries on input/output.
  - Scale: about 60% of Cloud observations arrived via OpenTelemetry (Mar 2026); agent traces can contain 2,000+ spans.
  — [Langfuse engineering](https://langfuse.com/resources/engineering/clickhouse-at-agent-scale)
- LangSmith groups traces into threads by the metadata key `session_id` or `thread_id` (UUID v7 recommended). The key must be set on all runs, including child runs. The Threads view shows first input, last output, turns, P50/P99 latency, tokens, cost and feedback. "Thread filters look through all runs and surface a thread if at least 1 run matches the filter." — [LangSmith threads](https://docs.langchain.com/langsmith/threads)
- OpenTelemetry GenAI attributes (registry entries marked "Deprecated: moved to the OpenTelemetry GenAI semantic conventions repository"; operation-name values are Development status):
  - Session and agent: `gen_ai.conversation.id`, `gen_ai.agent.id`, `gen_ai.agent.name`.
  - Operation: `gen_ai.operation.name` (`chat`, `invoke_agent`, `execute_tool`).
  - Usage: `gen_ai.usage.input_tokens`, `output_tokens`, `cache_read.input_tokens`, `cache_creation.input_tokens`, `reasoning.output_tokens`.
  - Tools: `gen_ai.tool.name`, `gen_ai.tool.call.id`.
  - Content: `gen_ai.input.messages`/`output.messages` ("likely to contain sensitive information").
  - Model: `gen_ai.provider.name`, `gen_ai.request.model`.
  — [OTel gen-ai attribute registry](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/); moved notice at [gen-ai-spans](https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans) pointing to https://github.com/open-telemetry/semantic-conventions-genai

### Inferences
- Index schema for his agent sessions, one row per session plus one row per turn or task:
  - Structured columns: `session_id` (≈ `gen_ai.conversation.id`), `agent_name`, `project`, `started_at`/`ended_at`, `model`, `input_tokens`/`output_tokens`/`cache_read_tokens`, `cost`, `outcome` (success/fail/abandoned), `task_ids`, `files_touched[]`, `tools_used[]`, `pr_or_commit`.
  - FTS columns weighted via `bm25(fts, w1, w2, …)`: `task_title` (highest), `user_prompts`, `final_summary`, `files_touched` (trigram for path fragments), `assistant_text_truncated` (lowest).
  - Following Langfuse and cc-conversation-search, index truncated assistant text and keep full payloads in the JSONL. Search results link back to (file, line or seq).
- A post-session "summary line" (task, outcome, files, one-paragraph summary) appended to the JSONL is the highest-leverage search field. It is also the one place embeddings might pay off later, since searches for past work are often paraphrased.
- Naming his own JSONL fields after OTel GenAI attributes now makes later export to Langfuse, LangSmith or any OTel backend trivial.

### Gaps
- Helicone's session storage and search were not researched (no source fetched).
- Claude Code's official docs on history and the `/resume` search weren't fetched; the path comes from a third-party tool's README.

## 7. Simplifying concessions, and named adopters

### Takeaway
Most of his needs can be met in stages without vectors or a search server: (a) scan the JSONL with ripgrep or DuckDB on demand; (b) rebuild a MiniSearch index on startup or restore it from a JSON snapshot plus the tail; (c) one FTS5 table per Page DO, plus a global D1 FTS5 table fed by per-page high-water marks. Each stage gives up something specific: latency, freshness, cross-document reach or semantic matching. Each is enough well into the tens of thousands of items.

### Cited Findings
- Claude Code: agentic glob/grep search with no index was judged better than RAG, "at the cost of latency and tokens", and avoids index staleness and security issues. — [OfficeChai/Cherny](https://officechai.com/ai/claude-researcher-explains-how-agentic-search-performed-better-than-rag-for-code-generation/)
- Anthropic: below ~200k tokens, put the whole corpus in the prompt and skip retrieval. — [Anthropic](https://www.anthropic.com/news/contextual-retrieval)
- cc-conversation-search: a just-in-time FTS5 index refreshed before each search, with no AI calls, over Claude Code's JSONL. — [GitHub](https://github.com/akatz-ai/cc-conversation-search)
- Langfuse: ClickHouse plus text indexes at petabyte scale, after leaving Postgres. — [Langfuse](https://langfuse.com/resources/engineering/clickhouse-at-agent-scale)
- Figma: S3 checkpoints plus a DynamoDB journal with sequence numbers. — [Figma](https://www.figma.com/blog/making-multiplayer-more-reliable/)
- Cursor: SQLite key-value blobs, which are hard to search. — [cursor-conversations-mcp](https://glama.ai/mcp/servers/@vltansky/cursor-conversations-mcp/blob/e15492520e0e7518a8cac8a884453ce2528d9b4e/docs/research.md)
- Hugo community: moving off Lunr toward Pagefind, FlexSearch or Fuse. — [Hugo Discourse](https://discourse.gohugo.io/t/re-hugo-search-tools-lunrjs-appears-abandoned/57022)
- Datadog acquired Quickwit (Tantivy-based log search). — [Quickwit](https://quickwit.io/blog/quickwit-joins-datadog)
- Cloudflare AI Search packages Workers AI + Vectorize + R2 + Browser Run as managed hybrid search (secondary source). — [ppc.land](https://ppc.land/cloudflare-ai-search-starts-billing-november-1-at-0-75-per-million-tokens/)

### Inferences
**Concession A: scan on demand (ripgrep/jq/DuckDB over JSONL). No index at all.**
- Gives up: ranking (unless done in DuckDB SQL), autocomplete, and sub-second latency on large archives. It works only where the files live (local or Node; not inside a DO without loading data from R2).
- Gains: zero sync bugs, always fresh, and the right tool for agents (the Claude Code pattern).
- Enough for: personal agent-session archives up to roughly hundreds of MB, and ad-hoc analytics (DuckDB: tokens and cost per day, failed tasks).

**Concession B: MiniSearch rebuilt on startup** (or `loadJSON` of a snapshot, then apply the tail past `last_seq`).
- Gives up: memory (the whole index in RAM), startup time as the corpus grows, and multi-user and cross-device sharing. Also the BM25 corpus statistics cover only what is loaded.
- Gains: one ESM file, no bundler, BM25+, fuzzy and prefix search, autoSuggest, field boosts.
- Enough for: one user's workspace, roughly tens of thousands of Items in the browser or a Node process (estimate).

**Concession C: one FTS5 table per Page DO, with no global index.**
- Gives up: cross-document search, unless the app fans out to many DOs. BM25 IDF is also computed per Page, so scores are not comparable across Pages.
- Gains: index updates in the same transaction as the log append; atomic `last_seq`; 30-day PITR.
- Enough for: in-Page search and autocomplete.
- Add a global D1 (or "search DO") FTS5 table fed by batched per-page deltas once cross-Page search matters. D1 Paid allows 10 GB per database. Remember D1 export needs the FTS table dropped first, or just rebuild it from the log.

**Concession D: no vectors.**
- Gives up: paraphrase and vocabulary-mismatch recall, and multilingual and multimodal search.
- Mitigations: field-weighted BM25, trigram on paths and identifiers, LLM-written session summaries, and query expansion by an LLM at search time.
- When it's no longer enough: if he repeatedly fails to find sessions he knows exist because he can't recall the words, add Vectorize (pennies at this scale) or AI Search over summaries only, fused with BM25 via RRF.

**Overall:** the JSONL log stays the source of truth, every index is disposable and rebuildable, and indexes are versioned by `(schema_version, last_seq)`. That lets him change tokenizers or ranking later at no risk, which is the main reason to keep history non-destructively.

### Gaps
- I found few named production adopters for MiniSearch, Orama or FlexSearch with wiring details. Another researcher's notes (`adopters_and_pairings.md` in the same folder) may cover this.
- No source quantified when per-DO fan-out search becomes impractical. The concession thresholds above are my estimates, not measurements.
