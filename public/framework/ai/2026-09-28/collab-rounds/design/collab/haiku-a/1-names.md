# haiku-a — phase 1 (names)

## Source class signature

The `Source` class holds one web page that an agent found, converted to markdown, and saved under `public/framework/sources/<topic>/`. It reads from and writes to `index.jsonl` files, so any agent can load a source quickly and cite it.

### Class name
**`Source`** — a single source of information, identified by its URL and topic.

### Properties (set via constructor with Object.assign)

- **`url`** *(string)* — the original URL of the page found
- **`kind`** *(Source.Kind)* — what type of source this is (documentation, GitHub code, article, blog post, etc.)
- **`authority`** *(Source.Authority)* — how credible or authoritative this source is on its topic (scale or enum)
- **`path`** *(string)* — the relative path to the markdown file within `public/framework/sources/`; typically `<topic>/<slug>.md`
- **`title`** *(string)* — the title or headline of the source, for display and citation

### Methods

- **`constructor(o)`** — standard assign pattern; copies all properties from the input object
- **`markdown()`** — return the path to the markdown file (same as the `path` property, as a method for consistency)
- **`cite()`** — return a short citation string suitable for inline reference (e.g., "Title by Source Kind [url]")
- **`isValid()`** — boolean; check that all required fields are present and well-formed (url is a valid URL, path points to a real file, kind is a known type)

### Static subclasses (parts)

**`Source.Kind`** — enum of source types
- Properties: `Documentation`, `GitHub`, `Article`, `Blog`, `Book`, `Paper`, `Video`, `Other`
- Each is a string constant; used in the `kind` property to identify the source type
- Could add methods like `isCode()` (true for GitHub) for filtering

**`Source.Authority`** — enum or scale for credibility
- Properties: `High`, `Medium`, `Low` (or numeric scale 1–5)
- Used in the `authority` property to indicate how trustworthy this source is for its topic
- Could add methods like `trusted()` to check if authority is high enough for critical use

### Design notes

- **No instance methods that read files** — keep `Source` lightweight; file I/O happens at the loader (index.jsonl reader), not on individual instances.
- **JSON-serializable** — all properties must survive JSON round-trip without loss, so `Source` instances can be stored directly in `index.jsonl`.
- **Small, composable methods** — `cite()` is simple enough to build a display string; `isValid()` is a check, not a repair.
- **The path is relative** — agents construct the full path when they need to load the markdown; `Source` only holds the relative path.

