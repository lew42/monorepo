# cms-thinking — the data-layer think-through

## The ask, verbatim

> let's lean into Cloudflare apis. spawn some minions to explore cloudflare apis, like D1,
> durableobjects, and provides UI for creating and managing these services. let's turn this
> framework into a real CMS. maybe we need a local sqlite db? I like the idea of using git-only
> deploys. maybe json and jsonl are best for git-based data? if we wanted wordpress-like
> features, maybe using a cloud D1 for local dev could be best? although, that's not available
> on a plane, for example. aren't there some local cloudflare systems? think through the various
> options. we don't really want to lock in to any system.

## Scope

1. **The think-through** — an options matrix honestly weighed for this repo, landing on an
   adapter seam rather than a service. → [`/imagine/cms/thinking/`](/imagine/cms/thinking/)
2. **The smallest CMS slice, working** — in-browser editing of one real page's content,
   persisted through an existing dev-server seam, with the git-only deploy told concretely.
   → [`/imagine/cms/edit/`](/imagine/cms/edit/)
3. **The service-management UI** — a MOCK, each screen labelled with the `npx wrangler` command
   behind it. No live calls. → [`/imagine/cms/services/`](/imagine/cms/services/)

## Fences honoured

- Files: `public/imagine/cms/**` and this task dir. **`Server/` untouched** — no new plugin was
  needed, because `rpc:write` already does the job (`git status Server` is clean).
- No cloud calls, no credentials, no npm dependency, no dev-server restart, nothing committed.
- The one line that is NOT mine to write: `"cms"` in `/imagine/page.js`'s `children:`.
