import { Page } from "/app.js";
import "./kinds.js";   // the one list of part types

/* Shim: PartsPage is retired (2026-10-12). Page.render_content_list() now draws each
   part through its class's View, so a plain Page is a "parts page". This file stays
   so a page.jsonl `"class": ".../Parts.js"` line still works; it also loads the kinds
   (PageHeading, PageText, PageCard), which register themselves by import. The old
   add_part / move_part / remove_part are the content List's add / move / remove. */
export default class PartsPage extends Page {}   // empty on purpose: the loader wants a subclass
