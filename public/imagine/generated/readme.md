# Generated — page trees, written out

Where the [page generator](/framework/core/Page/generator/) lands a tree it drew. Each
subdirectory is a **real module**: one directory per page, an ordinary `page.js` in each, and
nothing imported from the generator. Browse one and it is a columns tree; open its files and
there is nothing generated about them.

## Use

Roll or type a tree in the generator, name it, press **Export**. It appears here.

Then edit it. That is the point — an export is a scaffold: the shape is right, the `md()` lines
are placeholders, and `children:` is a real declaration you can add to.

## Watch out

- **`page.js` here is REWRITTEN by the export.** Its `children:` line is the only record that a
  tree was exported, so anything else you write in this file survives only until the next
  export. Everything inside a `<name>/` directory is yours.
- **Deleting a tree is two steps** — remove its directory *and* its name from `children:`.
  Nothing crawls, so a directory nobody names does not exist; a name with no directory 404s.
- **An export never overwrites.** A second export under a name that is already here is refused
  with a line under the button, not merged.
- Dev only: the writer is the dev server's `rpc:write`. On the static site the control is
  disabled and says why.

## More

- How a tree becomes files, word by word:
  [`core/Page/generator/readme.md`](/framework/core/Page/generator/readme/) — and the record,
  [`doc/decisions.md`](/framework/core/Page/generator/doc/decisions.md) (wave 8).
- The arrangement is core's: [`core/Page/doc/columns.md`](/framework/core/Page/doc/columns.md).
