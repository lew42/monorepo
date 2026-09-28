# Cross-Review — Source Implementations

## haiku-a vs. haiku-c

**Functionally the same?** Yes. Both implement all required methods and properties identically.

**What is better about haiku-a:**

1. **Title extraction is more robust.** Has `extractTitle()` with three fallback patterns: `<title>`, then `<h1>`, then `og:title` meta tag. Mine only tries the title tag. haiku-a will recover a title from more pages in the wild.

2. **Private property convention.** Uses `_markdown` (underscore prefix) instead of just `markdown`. This signals "this is internal/transient" and follows the framework's pattern for private members.

3. **Authority.guess() is clearer.** Uses simple if-else with `includes()` checks rather than complex multiline regexes. It's easier to read and modify — if a new domain becomes a problem, a single `includes()` line is obvious.

4. **HTML-to-markdown in a separate function.** Keeps `convertHtmlToMarkdown()` outside the class where it can be reused or swapped for a library import later. Mine is inlined in the class.

5. **mdPath generation is deterministic.** Uses `domain + timestamp` format, which is collision-free and reproducible. Mine uses URL basename, which could collide.

## sonnet-b vs. haiku-c

**Functionally the same?** Yes, with one better design choice.

**What is better about sonnet-b:**

1. **Path resolution using URL constructor.** `new URL("../../sources/", import.meta.url)` is ESM-native and cleaner than `fileURLToPath` + `path.resolve()`. No need to compute `__dirname`; the URL class handles it.

2. **Best code organization.** Static helper classes (`Source.Authority`, `Source.Markdown`) are the cleanest OO design. This follows the framework's "parts as static subclasses" principle better than inline functions or methods.

3. **fileUrl() helper method.** Provides a single source of truth for resolving markdown file paths. My `sizeOf()` and `exists()` both recompute the path; sonnet-b's `fileUrl()` makes that testable and reusable.

4. **slugFor() method for deterministic mdPath.** Generates a readable slug from the URL (e.g., `github-com-user-repo.md`). This is better than my URL-basename approach and less collision-prone than haiku-a's timestamp.

5. **Reuses list() in load().** DRY principle: `load()` calls `list()` and filters, rather than duplicating the index-reading logic.

6. **simpler Authority.guess().** Kind-first logic with fixed scores. More maintainable and less likely to have bugs than complex regex patterns.

7. **Markdown as a separate static class.** `Source.Markdown.from(html)` and `Source.Markdown.titleOf(html)` are clearer than helper functions outside the class, and the placeholder signals "this is a stub for a real library."

8. **Body property handling is explicit.** Deletes the body from the object before appending to index.jsonl: `delete row.body`. Mine and haiku-a use the object as-is but delete the property after, which is less explicit.

## haiku-a vs. sonnet-b

**Functionally the same?** Yes.

**What is better about haiku-a:**

- Title extraction with og:title fallback is more robust than sonnet-b's stub.

**What is better about sonnet-b:**

- Everything else. Code organization, path resolution, mdPath generation, helper methods, DRY principle.

## Summary

**Functionally, all three work.** They differ in code style, robustness, and maintainability.

**Best overall:** sonnet-b. It has the cleanest design (URL constructor, static helper classes), the most maintainable Authority logic, and better separation of concerns with `fileUrl()` and `Markdown` classes.

**Best single feature:** haiku-a's title extraction with fallbacks (og:title, h1 tag). This alone would make pages without a `<title>` tag still get useful titles.

**My implementation's strengths:** More comprehensive Authority scoring with specific domain patterns, and explicit inline documentation. My weaknesses: complex regex patterns (harder to maintain), less clear code organization, and a less deterministic mdPath generation.
