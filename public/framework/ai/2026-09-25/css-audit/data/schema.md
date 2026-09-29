# Audit data schema (one JSON file per module: data/<slug>.json)

```json
{
  "module": "framework/ai2",
  "paths": ["framework/ai2"],            // public/-relative dirs this file covers (children included)
  "lines": { "css": 1713, "jsBlocks": 0 }, // css files + css`` blocks inside .js files in those paths
  "clusters": [
    { "id": "card-shell", "file": "framework/ai2/ai2.css", "from": 12, "to": 60, "lines": 49,
      "verdict": "DUPLICATE|GENERALIZE|KEEP|DELETE",
      "target": "existing class/token (with framework.css:LINE) | new component name + where it lives | '' for KEEP",
      "evidence": "proof: what matched, or the grep that shows unused; KEEP = one reason",
      "saves": 40 }
  ],
  "totals": { "DUPLICATE": 0, "GENERALIZE": 0, "KEEP": 0, "DELETE": 0 },   // sum of lines per verdict
  "proposal": "3-6 plain sentences: how to reduce this module, what to reuse, what to build once.",
  "generalize": [ { "name": "progress-bar", "wouldReplace": ["path:line", "..."] } ],
  "risk": "low|medium|high — one line why"
}
```
Every cluster's lines must add up to the module's total lines (account for all of it). Valid JSON only; verify with `node -e "JSON.parse(require('fs').readFileSync(f))"`.
