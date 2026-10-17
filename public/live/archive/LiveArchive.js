import Live from "../Live.js";

/* /live/archive/: the old /live feed, kept. Same page class, reading archive/page.jsonl (a verbatim copy of /live's log, moved by LiveArchive.mjs). */
export default class LiveArchive extends Live {
	get log_url(){ return import.meta.resolve("./page.jsonl"); }
}
