import Live from "../Live.js";

/* /live/archive/: the old /live feed, kept. Same page class, reading archive/page.jsonl (a verbatim copy of /live's log, moved by ArchiveMove.mjs). */
/* The archive shows the old part-live cards as the text they were; only /live draws live data. */
class ArchiveCard extends Live.Card { static live = {}; }

export default class LiveArchive extends Live {
	static Card = ArchiveCard;
	get empty_text(){ return "The archive is empty. node public/live/archive/ArchiveMove.mjs --apply fills it from /live."; }
	get log_url(){ return import.meta.resolve("./page.jsonl"); }
}
