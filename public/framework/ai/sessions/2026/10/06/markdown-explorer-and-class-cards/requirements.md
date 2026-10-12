# Markdown Explorer, Command Characters & Class Card Views (2026-10-06)

Brief recorded verbatim from the owner's dictation on 2026-10-06.

---

## 1. The Markdown Explorer (`md/` Dynamic Path & Tab)

- **The Dynamic `md/` Path**:
  - Every page/module already has an `md/` subpath.
  - Upgrade `<module>/md/` so it operates as a full Markdown Explorer:
    - **Main Content Pane**: Renders the module's primary `readme.md`.
    - **Sidebar / Quick-Reference**: Lists all sub-markdown files (`doc/*.md`, sibling `.md` files) for quick scanning and instant jumping (`swap_link`).
  - **`md` Tab**: Expose an `md` tab on modules that have markdown files so readers and AIs can inspect the documentation hub directly.
  - **Authoring Benefit**: Enables AIs writing pure Markdown (without JavaScript) to create dynamic, interconnected documentation that is both served raw and rendered rich.

---

## 2. Command Characters & Mention Namespaces (`ext/Mention`)

- **Command Characters**:
  - `/` — **File System Paths**: Strictly 1:1 with the actual file system (`/framework/core/Page/`). No separate namespace or lookup alias; resolves directly to the disk/URL path.
  - `@` — **Actors**: Reserved for users and agents (`@owner`, `@mastermind`, `@minion-*`).
  - `#` — **Classes & Concepts**: Reserved for object-oriented classes and framework concepts (`#Page`, `#Item`, `#List`).
- **Visual Distinction & Color Schemes**:
  - Each kind gets a distinct icon + color theme so the reader learns what type of thing it is at a glance.
  - Class mentions get an upgraded framed icon and dark card surface (`.page-surface-dark`) so living classes visibly stand out from plain pages.

---

## 3. Class Documentation Page Architecture

- **Class Title Card**:
  - The class itself is represented by an icon item card (icon + class name), matching its inline mention form and tree navigator row.
- **No Claustrophobic Cards-within-Cards**:
  - Inside the class card, properties and methods are rendered as clean, unboxed icon items (avoiding nested boxes and borders).
- **Inheritance Hierarchy**:
  - The class's own methods appear first.
  - Inherited base class methods appear below it (e.g. `Page`'s methods first, followed by inherited `Item` methods).
- **Core API & Importance Weighting**:
  - The top of the card shows the **Core API** (the 5–7 most critical methods/properties).
  - Properties and methods are ranked by importance/usage weight (manually ranked in docs/metadata first).
