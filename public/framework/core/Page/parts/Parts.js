import { Page } from "/app.js";
import { div } from "../../View/View.js";
import Part from "./Part.js";
import "./HeadingPart.js";
import "./TextPart.js";
import "./CardPart.js";

/* PartsPage: a Page whose body is its page.jsonl `content` list, drawn kind by kind.
   Everything else (storage, live tail, second tab) is the Page it extends. Change
   the list with add_part / move_part / remove_part: each one edits the list, the
   list appends the delta line, and every open tab redraws from its own tail. */
export default class PartsPage extends Page {

	static Part = Part;

	render_content(){
		const list = this.ensure_content();
		let $rows;
		const draw = () => list.forEach(part => this.draw_part(part));
		const box = div.c("parts flow", () => { $rows = div.c("parts-rows flow", draw); });
		["add", "remove", "move", "order", "change"].forEach(verb => list.on(verb, () => $rows.empty(draw)));
		return box;
	}

	// An item that is not a Part (plain data in the log) still shows its text.
	draw_part(part){
		return part instanceof Part ? part.draw() : Part.fallback(part);
	}

	add_part(data, after){ return this.ensure_content().add(data, after ? { after } : {}); }
	move_part(id, after){ return this.ensure_content().move(id, { after }); }
	remove_part(id){ return this.ensure_content().remove(id); }
}
