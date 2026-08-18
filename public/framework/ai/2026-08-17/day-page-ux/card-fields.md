# The task card — every field, its range, and where it links

One card = one task dir (`ai/<date>/<slug>/`). `card.js`'s `manifest_card(t)` builds it from
`t` = `{ title, url, brief, files, m }`, where `m` is the merged `assign` object of that
dir's `task.jsonl`. Three regions: **who | what | figures**.

## who (left column)

| field | source | range of values | links to |
| --- | --- | --- | --- |
| state dot | `state(m)` → `.ai-dot` | `live` (pulsing) · `landed` (solid) · `idea` (faint) — from `landed_at` / `requested_at` | — (colour only) |
| **task name** | `t.title` (the dir name) | any slug, `ai-board-fix`, `vision-runner` | **`/framework/ai/<date>/<slug>/`** — and its `::after` spreads over the whole card, so *anywhere* on the card is this link |
| status | `status(t)` | `proposed` · `running since 5:53 PM` · `8:10 PM → 9:00 PM` | — |
| effort tag | `m.group` | any slug — `ai-log`, `vision`, `layout`, `web-ui`; absent = untagged | **`/framework/ai/effort/<group>/`** (the board filtered to that thread) |

## what (middle column)

| field | source | range of values | links to |
| --- | --- | --- | --- |
| headline | `m.outcome` ?? `m.request` ?? `t.brief` | one clamped line (Landed) or two (elsewhere); only shown when the task has **neither** steps nor a `now` — i.e. it *is* the answer | — |
| step bar | `progress(m)` → `m.steps` + `m.step` | N segments, 1–12 typical; `done` green, `now` orange-pulsing, rest grey. Running tasks only | — |
| step line | same | `4/6 Analyze pages; fix layout CSS` | — |
| now line | `m.now` ?? last agent without an outcome | free text — `dispatched`, `Cycle 3 — vision-after measuring…`; running only, hidden when identical to the step | — |
| **links pills** | `m.links[]` = `{url, label}` | 0–8 per task; label clipped at 14em, one line each | **whatever the task wrote** — a `.md` in its own dir, a `.png`, another task, a doc page, a live page |

## figures (right column)

| field | source | range of values | links to |
| --- | --- | --- | --- |
| spend | `m.cost_usd` else `m.tokens` (own, else summed over `m.agents`) | `$1.42 cost` · `2,067k tokens` | — |
| window | `m.window.after` | `0–100% of window` — the usage window at landing | — |
| agents | `m.agents[]` | `11/13 agents` while some lack an `outcome`, else `13 agents` | — |
| quiet | `quiet(m)` | `1h 26m quiet` — newest log line older than 30 min; running only | — |
| model | `m.model` | `opus-5` · `sonnet-5` · `fable-5` · `opus-5[1m]` | — |

## Not rendered on the card

`session_id` (the transcript key), `request` on a running task (deleted 2026-08-17 —
the step bar says more), `tab` (the VS Code window title — deleted, same day),
`chat_session_id`, `logs`/`actions`/`chats`/`shots` (the task page's Session tab),
`checklist`, `agents[].outcome` (the task page's agents table).

## The one rule

Every card is a link, and only three things inside it are *different* links: the
title (the whole card), the effort tag, and each deliverable pill. Everything else is
a number or a state. A field that is neither is noise — that test deleted `tab` and the
running card's `request`.
