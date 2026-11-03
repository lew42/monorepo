# Source Class Design — Object Structure Proposal

## Core Class: `Source`

A `Source` represents one web page discovered by an agent, already converted to markdown and saved to the library. It is read from `index.jsonl` lines in `public/framework/sources/<topic>/` and carries all metadata needed for an agent to cite it.

### Properties

- **`url`** (string): The original URL where the page was found.
- **`markdown`** (string): Relative file path to the saved markdown file within `public/framework/sources/`.
- **`type`** (string): The page's category — one of `Source.Type` keys (e.g., `"article"`, `"documentation"`, `"code"`, `"reference"`, `"blog"`, `"specification"`).
- **`credibility`** (string or number): How authoritative the source is — one of `Source.Credibility` values (e.g., `"high"`, `"medium"`, `"low"`) or a numeric score (0–1).
- **`title`** (string, optional): The page's title or headline, for display and citation.
- **`topic`** (string, optional): The category folder name under `sources/` (inferred from markdown path if not explicit).
- **`fetched_at`** (ISO string, optional): When this source was discovered and added to the library.
- **`summary`** (string, optional): One-sentence summary of what this source covers.

### Methods

#### Constructor
```javascript
constructor(o) { Object.assign(this, o); }
```
Accepts a single object with properties matching the fields above.

#### Instance Methods

- **`validate()`** → `boolean`  
  Returns true if `url`, `markdown`, and `type` are all present and valid; false otherwise. Used during index load to catch malformed entries.

- **`cite()`** → `string`  
  Returns a formatted markdown citation string: `[Title](url)` if title exists, otherwise `url` alone. For inline attribution in an agent's output.

- **`file_url()`** → `string`  
  Resolves the markdown file to an absolute URL (from `import.meta`), so the agent can load the content.

#### Static Methods

- **`parse(line)`** → `Source` | `null`  
  Parses one JSON line from `index.jsonl` and returns a `Source` instance, or `null` if the line is malformed or missing required fields.

- **`from_file(markdown_path, metadata_obj)`** → `Source`  
  Creates a new `Source` given a markdown file path and an object with `url`, `type`, `credibility`, etc. Useful when saving a newly discovered page.

---

## Static Subclasses

### `Source.Type`

Enumerates valid page types. Each is a static property with:
- **`key`** (string): The type identifier (e.g., `"article"`).
- **`label`** (string): Human-readable name (e.g., `"Article"`).
- **`icon`** (string, optional): Icon name or emoji for display.

**Type keys:**
- `"article"` — Standalone articles, blog posts, news.
- `"documentation"` — Formal docs, API references, user guides.
- `"code"` — Source code, examples, gists, repositories.
- `"reference"` — Specs, standards, reference materials.
- `"discussion"` — Forum posts, issue threads, Q&A sites.
- `"whitepaper"` — Academic papers, research, in-depth analysis.

### `Source.Credibility`

Ranks how authoritative a source is. Each is a static property with:
- **`key`** (string): The credibility level (e.g., `"high"`).
- **`label`** (string): Human-readable label (e.g., `"High"`).
- **`score`** (number): Numeric value (e.g., 0.9 for high, 0.6 for medium, 0.3 for low).
- **`icon`** (string, optional): Icon or badge character.

**Credibility levels:**
- `"high"` — Official docs, canonical source, peer-reviewed, well-known authoritative publication.
- `"medium"` — Reputable blogs, established projects, secondary sources with good track records.
- `"low"` — Blog posts, forum replies, unvetted sources, personal opinions.
- `"unset"` — Not yet assessed (default if not provided).

---

## Usage Pattern (Example)

```javascript
// Reading from index.jsonl
const indexLine = '{"url":"https://example.com/article","markdown":"web/article-guide.md","type":"article","credibility":"high","title":"The Guide","topic":"web"}';
const source = Source.parse(indexLine);

// Accessing properties
if (source && source.validate()) {
  const citation = source.cite();
  const fileUrl = source.file_url();
  const rank = Source.Credibility[source.credibility]?.score ?? 0;
}

// Creating a new source after discovery
const newSource = Source.from_file(
  "web/new-article.md",
  { url: "https://...", type: "article", credibility: "high", title: "..." }
);
```

---

## Design Rationale

1. **Assign-based constructor** follows the framework's house style and keeps the class simple and open to extension.
2. **Static subclasses** (`Type`, `Credibility`) keep type and credibility enumerations organized and queryable without bloating the main class.
3. **Minimal properties** — only what an agent needs to cite and locate a source; optional fields allow lightweight entries.
4. **Static parse/from_file methods** handle the two main paths: reading from the index or creating a new entry.
5. **cite() and file_url()** methods provide the agent-facing API for attribution and content access.
6. **validate()** ensures data integrity when sources are loaded from the index.

