The base stub resolves `false` — nowhere to delete from. Each backend overrides
it, and **the meaning of the resolved value is not the same across them**:

- `MemorySaver` / `LocalStorageSaver` — `true` means the item is gone, verified
  synchronously before the promise resolves.
- `FileSaver` — fire-and-forget. It sends the `rm` RPC and resolves `true` the
  moment the frame is sent, with nobody waiting on a reply. `true` here means
  *sent*, not *removed* — recorded as open work in `readme.md`.

**Usage** — not called by any current framework page (grep turned up none); the
three backends carry it forward for `core/Item`'s eventual "delete document" use.
