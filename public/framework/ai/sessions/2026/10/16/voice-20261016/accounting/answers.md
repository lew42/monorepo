# Accounting: answers, 2026-10-16

Each answer was measured by a script. The full write-up, with evidence, is in [doc/answers-full.md](doc/answers-full.md).

| Question | Verdict |
|---|---|
| Q1 the agent logs | It is every agent since `049fcea4d` (10-13), not a sample. It is a separate event log, not a copy of the transcript. It was missing from the readme; that is fixed now. |
| Q2 the three counters | Keep Digest/Audit. Delete the registry `cost` and the AISession snapshot's tally. |
| R10 the running total | One derived `cost` line per session, cached in `index.json`. |
| R11 the rename | 757 files, about 160 code files, in four commits. |
| R12 slug = id | Only 26 of 580 match today. Rule: the folder name is the agent id. |
| R13 the Session class | `Session extends Item` and has a page. |
| R14 one record | Scrap 7 copies (below). |

## Q2. The three counters

| Counter | Reads | Fault | Verdict |
|---|---|---|---|
| Registry `cost` | the SDK's cost, summed every turn | sums a total that is already cumulative: 2.85x to 16x too high | delete |
| AISession snapshot | the end of the transcript, remembering the last 40 messages | can count a message twice | delete its tally |
| Digest / Audit | the whole transcript, each message once | the two agree, 559 of 559 | keep |

## R11. The rename {#r11}

```
757  day-level task.jsonl  → session.jsonl    (session logs)
876  deeper task.jsonl     → unchanged        (tasks)
157  code files · 200 docs · 16 skills name the file
```

## R12. Folder name and agent id {#r12}

| Of 580 folders | Count |
|---|---|
| Name = id | 26 |
| `role-` + name | 425 |
| Other | 129 |

## R13. The Session class {#r13}

```
class Session extends Item      // runs in node; Page imports View and cannot
  static file = "session.jsonl"
  page → page.jsonl, in the same folder
```

## R14. Copies to scrap {#r14}

| Copy | Size |
|---|---|
| `agent-<id>.jsonl` (Servex) | 3,019 files, 158 MB |
| registry `cost` / `turns` | one field on each agent's row |
| remote door chat copies | small |
| prompt-relay `Prompt` items | 184 MB, of which 180 MB is a copy |
| `.claude/prompts` | 6.1 MB |
| `owner-prompts` + `words` | 8 MB in git |
| reply-relay chat lines | 84 KB |

⚠️ A cloud session has no transcript on this PC, so its MCP log is the record, not a copy.
