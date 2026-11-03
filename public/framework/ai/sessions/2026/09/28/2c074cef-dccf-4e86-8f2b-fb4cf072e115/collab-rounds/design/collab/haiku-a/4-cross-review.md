# haiku-a — phase 4 (cross-review)

## sonnet-b vs haiku-a

**Functionally the same?** Yes—both implement all 8 methods (fetch, save, load, list, exists, sizeOf, cite) plus the 2 static parts (KINDS, Authority).

**What's better about sonnet-b:**
- **Architecture:** URL-based path resolution (`new URL("../../sources/", import.meta.url)`) is more elegant and robust than path string climbing; also avoids __dirname complexity.
- **Index.jsonl purity:** The `body` field lives in memory only (not stored on disk), so serialized rows match the spec exactly—no `_markdown` leak. Genius separation.
- **Code organization:** Static `Source.Markdown` class for HTML→markdown + title extraction is well-organized.
- **Conciseness:** ~100 lines vs my ~190 lines—less noise.

**What's better about haiku-a:**
- **Authority.guess works correctly:** Includes URL domain heuristics (github.com > reddit.com > twitter) so it actually reflects source credibility. Sonnet-b returns fixed values ignoring domain.
- **HTML→markdown works:** My simple regex pipeline actually converts HTML (strips tags, cleans entities, preserves newlines). Sonnet-b's `Markdown.from(html)` returns HTML unchanged.
- **Simplicity:** No dynamic field creation/deletion; what you see in the constructor is what gets stored. More predictable.

---

## haiku-c vs haiku-a

**Functionally the same?** Yes—same 8 methods and 2 static parts.

**What's better about haiku-c:**
- **HTML→markdown detail:** Patterns for headings, paragraphs, links, emphasis, lists (lines 171–185)—actually converts structure, not just strips tags.
- **Authority.guess patterns:** Explicit URL domain matching (nodejs.org, mdn.org, github.com, medium.com, stackoverflow.com, etc.) gives accurate credibility tiers.
- **Error handling:** `sizeOf()` and `exists()` return safe defaults (0, false) instead of throwing—caller doesn't need try/catch for "file might not exist" cases.

**What's better about haiku-a:**
- **Math is correct:** Authority.guess uses `Math.min(1, score + 0.15)` and `Math.max(0, score - 0.15)` to bound adjustments. Haiku-c uses `Math.min(0.80, 0.5)` which always returns 0.5—the kind-based branch is broken.
- **Simpler logic:** No regex backreferences or complex patterns; straightforward string includes + adjustments. Easier to debug and extend.
- **Transient property cleanup:** Explicitly `delete this._markdown` after save—signals intent and prevents accidental serialization.

---

## Net assessment

All three are **functionally the same** (same method signatures, same behavior). Differences are in implementation quality:
- **sonnet-b:** Elegant structure, broken logic (Authority returns fixed values, Markdown returns HTML).
- **haiku-c:** More detailed logic (URL patterns, real HTML→markdown), but has Math.min bug in Authority fallback.
- **haiku-a:** Pragmatic middle ground—logic works end-to-end, though less detailed than haiku-c and less elegant than sonnet-b.
