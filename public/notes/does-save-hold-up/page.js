import { md } from "/app.js";
import { NotesNote } from "../note.js";

/* Layout (the five): main region under /notes/, plain page grid. The photo takes `wide`;
   prose keeps the measure. Own layout: `.md` flow. Two regions (crumbs, content), no
   children. Preview: the photo thumb.

   Nothing is built. The left page is four questions about a persistence API and the right
   page is a full sheet of pencil drawings — neither is an interface. Saying so in one line
   is what the brief asks for when a note describes nothing buildable. */

export default new NotesNote({
	meta: import.meta,
	title: "Does .save() hold up?",
	icon: "save",
	description: "Thing, Thing.List, and a proxy that saves.",

	content(){
		this.crumbs();
		this.shot();

		md(`## What the page says

**The left page names the stack in one line.** Two storage backends on the left, one
question in the middle, two classes on the right:

> \`FileSystem\` · \`SQL\`  →  **Data?** · **Store?**  →  \`Thing\` · \`Thing.List\`

Then it tests the API that already exists against it:

> Does the \`.save()\` → \`saver.save()\` hold up?
> → for arbitrary json, sure
> → maybe it's fine?

> Serializing structured data to SQL would take practice.

And the idea that would make all of it automatic:

> \`Thing.Proxy\` → Can handle **all** reactivity? ☑ Saving ☑ Sensing ☑ Loading?
>
> The proxy could use complex objects to configure? ↳ **for SQL, it should always be
> class-based**

That last line is the decision on the page: an arbitrary JSON blob can be saved by a
generic saver, but the moment the destination is SQL there has to be a class that knows the
shape.

**The right page is drawing, not writing.** At the top, \`Big Space Balloons?\` with a
balloon captioned *Float in space?*, and two lines under it — *Everyone should still wear
masks…?* and ☑ *You'd need a helmet, in case it depressurizes?* Below that the sheet fills
with airship, rotor and fan contraptions: a cigar-shaped hull with propellers at both ends,
a stand, a drum, a bladed fan seen face-on, and a set of small stubby bodies labelled
**Heli**.`);

		md(`## What it points at

- [core/Item](/framework/core/Item/) — \`Thing\` and \`Thing.List\` under the names this site
  actually gave them. An Item is one record with a \`.save()\`; a List is the collection.
- [ext/Saver](/framework/ext/Saver/) — the \`saver.save()\` half. The note asks whether one
  generic saver holds up for everything; Saver is the version that shipped, and its own
  page says where it stops.
- [core/List](/framework/core/List/) — the list end of the pair, which is where the
  \`Thing.List\` question gets answered in code.
- [The data decision](/imagine/platform/decisions/data/) — the record that rules on
  filesystem versus SQL for real: git files for curated content, a database the day a
  stranger writes, one Durable Object per live surface. "FileSystem / SQL → Data? Store?"
  is that record's first line, three weeks early.
- [Doodles](/notes/doodles/) — the drawings on the right page belong to the notebook's own
  drawing collection, catalogued there. They are kept whole in the photo above rather than
  cropped out of it.`);

		md(`**Nothing here is buildable.** The left page is an API being questioned, and the
questions are already answered by \`core/Item\` and \`ext/Saver\` — a demo would only restate
them. The right page is drawing. So this note is a transcription and a set of links.`);
	}
});
