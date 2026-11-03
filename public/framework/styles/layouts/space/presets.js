/**
 * Nine starting points, as text — nine of the shapes the rail spends a directory
 * each on, and every name here IS a directory: /framework/styles/layouts/<name>/.
 * A preset is a string, because that is the whole claim this page makes.
 *
 * Ordered by how much frame they carry — one column, then rails, then panes —
 * so reading down the row is itself the lesson.
 */
export const PRESETS = {

	// the layout every other one departs from: a bar, one reading column, a footer
	document: `full fill flex v
  > topbar
  pad flow measure --measure:52em flex-1 scroll
    > hero
    > sections 5
  > footer`,

	// two rails and an article, re-flowing on the row's own width
	docs: `full fill flex v
  > topbar
  flex gap wrap flex-1 scroll
    basis pad --basis:15em > menu
    pad flow fluid > sections 5
    basis pad --basis:13em stick > toc
  > footer`,

	// six regions — and the nested column is what a rail beside a rail cannot say
	shell: `full fill flex v
  > topbar
  flex gap flex-1 scroll
    basis pad scroll --basis:14em > menu
    flex v flex-1
      > toolbar
      pad flow fluid scroll > sections 4
    basis pad --basis:13em stick > toc
  > footer`,

	// list · detail — two INDEPENDENT scrollers, which is the whole shape
	split: `full fill flex v
  > toolbar
  flex gap flex-1 scroll
    basis pad scroll --basis:26em > rows 12
    pad flow fluid scroll > sections 3`,

	// three panes, three widths, one row that sheds them in order
	mail: `full fill flex v
  > toolbar
  flex gap flex-1 scroll
    basis pad scroll --basis:14em > menu
    basis pad scroll --basis:22em > rows 10
    pad flow fluid scroll > sections 4`,

	// two walls, one `--column` each: numbers at 8em, panels at 12em
	dashboard: `full fill flex v
  > topbar
  pad flex v gap flex-1 scroll
    > tiles 8
    > cards 6`,

	// full-bleed bands, each holding its own content
	landing: `full fill flex v
  > topbar
  flex v flex-1 scroll
    > hero
    pad > cards 6
    pad > tiles 12
  > footer`,

	// a filter rail beside a wall that re-counts its own columns
	gallery: `full fill flex v
  > toolbar
  flex gap wrap flex-1 scroll
    basis pad --basis:13em > menu
    pad fluid scroll > tiles 16`,

	// the one wall whose children are RAGGED — `notes` is the only part that is
	masonry: `full fill flex v
  > topbar
  flex gap wrap flex-1 scroll
    basis pad --basis:13em > menu
    pad masonry fluid scroll --column:14em > notes 14`,
};

export default PRESETS;
