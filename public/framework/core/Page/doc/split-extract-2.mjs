// Step 2 of doc/split-plan.md: moves PageChildren / Reader / Listing / Prefs out of Page.class.js into own files. Scripted, not retyped.
import fs from "node:fs";
const dir = new URL("..", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const src = fs.readFileSync(dir + "Page.class.js", "utf8").split("\n");
const at = (re, from = 0) => { const i = src.findIndex((l, n) => n >= from && re.test(l)); if (i < 0) throw new Error("no " + re); return i; };
const children0 = at(/^\/\/ The shim:/), reader0 = at(/^\/\/ `Item\.Store` for a page\.jsonl/), listing0 = at(/^\/\/ What listing\(\) answers/);
const track0 = at(/^\/\/ Opt-in instance tracking/), prefs0 = at(/^\/\/ Fallback store when localStorage/), end0 = at(/^export default Page;/);
const block = (a, b) => src.slice(a, b).join("\n").replace(/\n+$/, "") + "\n";

let children = block(children0, reader0);
let reader = block(reader0, listing0);
let listing = block(listing0, track0);
let prefs = block(prefs0, end0);

children = children.replace("class PageChildren extends Map", "export default class PageChildren extends Map");
reader = reader.replace("Page.Reader = class PageLogReader extends Item.Store", "export default class PageLogReader extends Item.Store")
	.replace("if (!dev) return this.load();", "if (!this.constructor.dev) return this.load();")
	.replace(/\n};\n$/, "\n}\n// ⚠ Localhost only, the gate dev/Socket keeps. (doc/watch-out.md)\nPageLogReader.dev = [\"localhost\", \"127.0.0.1\"].includes(location.hostname) || location.hostname.endsWith(\".localhost\");\n");
listing = listing.replace("Page.Listing = class PageListing {", "export default class PageListing {\n\n\tstatic CHILD = /^([^/]+)\/page\.(jsonl|js)$/;\n\tstatic key_of = name => name.split(\"/\")[0];")
	.replace("const latest = new Map();", "const { CHILD, key_of } = this, latest = new Map();")
	.replace(/\n};\n$/, "\n}\n");
// the class body's own blank line after the header would double up; tidy
listing = listing.replace("key_of = name => name.split(\"/\")[0];\n\n\n", "key_of = name => name.split(\"/\")[0];\n\n");
prefs = prefs.replace(/^\/\/ Fallback store[^\n]*\n(?:const memory[^\n]*\n)?let warned[^\n]*\n\n/m, "")
	.replace(/\/\/ ⚠ ONCE a session[\s\S]*?\n}\n\n/, "")
	.replace("Page.Prefs = class PagePrefs {", "export default class PagePrefs {\n\n\t// Fallback store when localStorage will not take a save (private mode, full quota): memory for the session. (doc/method/prefs.md)\n\tstatic memory = new Map();\n\tstatic warned = false;\n\n\t// ⚠ ONCE a session, not once a write: a run saves on every move, and a console\n\t//   filling with the same line is a console nobody reads.\n\tstatic warn(key, error){\n\t\tif (this.warned) return;\n\t\tthis.warned = true;\n\t\tconsole.warn(`prefs(${key}) — localStorage is unavailable (${error.name}); this session is kept in memory only.`);\n\t}")
	.replace("catch (error){ warn(key, error); return false; }", "catch (error){ this.warn(key, error); return false; }")
	.replace("memory.get(this.key())", "PagePrefs.memory.get(this.key())").replace("memory.set(this.key(), data)", "PagePrefs.memory.set(this.key(), data)").replace("memory.delete(this.key())", "PagePrefs.memory.delete(this.key())")
	.replace(/\n};\n$/, "\n}\n");
reader = `import Item from "../Item/Item.js";\n\n` + reader;

fs.writeFileSync(dir + "Children.js", children);
fs.writeFileSync(dir + "Reader.js", reader);
fs.writeFileSync(dir + "Listing.js", listing);
fs.writeFileSync(dir + "Prefs.js", prefs);

const rest = [...src.slice(0, children0), "Page.Reader = PageLogReader;", "Page.Listing = PageListing;", "Page.Prefs = PagePrefs;", "", ...src.slice(track0, track0 + 3), ...src.slice(end0)];
fs.writeFileSync(dir + "Page.class.js", rest.join("\n"));
console.log({ children: children.split("\n").length, reader: reader.split("\n").length, listing: listing.split("\n").length, prefs: prefs.split("\n").length });
