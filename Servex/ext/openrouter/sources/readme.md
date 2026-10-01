# Sources this research leans on

An index into the one source library at [`public/framework/sources/`](/framework/sources/) —
not a copy. Only the sources actually cited by an accepted conclusion in the harness research
(see [`snapshot.md`](../snapshot.md)), not everything the library holds for these three topics
(`openrouter`, `opencode`, `claude-agent-sdk`).

| id | title | domain | date fetched | cited by |
|---|---|---|---|---|
| [`claude-code-integration-guide-openrouter`](/framework/sources/openrouter/claude-code-integration-guide-openrouter.md) | Claude Code Integration Guide - OpenRouter | openrouter.ai | 2026-09-29 | `cjuqp`, `ckwc5`, `q0snn` |
| [`openrouter-faq`](/framework/sources/openrouter/openrouter-faq.md) | OpenRouter FAQ | openrouter.ai | 2026-09-28 | `c9vn5` (folded into `ah34p`) |

No `author` field: neither source page's frontmatter names one, so it's left off rather than
guessed.

## Cited but not yet in the library

The research also leans on several URLs the library doesn't have a markdown copy of yet. The one
the brief named as most load-bearing — the OpenRouter Claude Code integration guide above — is
now saved. The rest are cited by `contested`/`unknown` claims or academic papers, not by an
`accepted` conclusion on their own, so they were left unfetched rather than spending more on a
research round that's already closed (`public/framework/sources/readme.md`'s own cost warning):

- `https://openrouter.ai/docs/agent-sdk/overview` — cited by `cs3o9`, `cstbk`, `a4r7t`
- `https://www.npmjs.com/package/@openrouter/agent` — cited by `cstbk`, `a4r7t`
- `https://opencode.ai/docs/sdk/`, `https://ai-sdk.dev/providers/ai-sdk-harnesses/opencode`,
  `https://deepwiki.com/sst/opencode` — all cited by `ah7hc` (the opencode alternative)
- `https://docs.claude.com/en/docs/agent-sdk/permissions` — cited by `ceq98` (the PreToolUse fence)
- `https://arxiv.org/abs/2604.22891`, `https://arxiv.org/abs/2502.08788`,
  `https://arxiv.org/abs/2601.19921`, a Springer article — the cross-review academic backing
  (`crbjz`, `c0ptu`, `cjlpv`, `ad16o`)

If a later task needs one of these read closely rather than just cited, fetch it then — that's a
cheap, deliberate call at the point it's needed, not a blanket fetch now.
