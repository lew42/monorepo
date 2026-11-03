import { div, small } from "../../../core/View/View.js";
import { maps, build_row } from "../../Mention/Mention.js";
import VoiceStage from "./VoiceStage.js";

/**
 * Things spoken of: every named class, module or page you mention, shown as a linked card the moment the words arrive.
 * No model, no cost: the names come from `things.json` (built from the folders by `ThingsIndex.mjs`) plus the Mention maps,
 * and are matched in the browser against the raw words. Say "where is Dictate" and `ux/Dictate` is on screen as you finish the sentence.
 *
 *   ThingsStage.find("open the Dictate widget. then Page")   // [{ name: "Dictate", entry, sentence }, ...] first mention first
 */
export default class ThingsStage extends VoiceStage {
	static key = "things";
	static label = "Things you mentioned";
	static fields = ["raw"];

	static index = null;     // name -> { url, icon, common? }, filled once things.json has loaded
	static views = new Set();
	static loading = fetch(new URL("things.json", import.meta.url)).then(r => r.json()).then(j => {
		ThingsStage.index = { ...j };
		for (const [name, e] of Object.entries(maps["#"] ?? {})) if (e.url) ThingsStage.index[name] = { ...e, common: ThingsStage.index[name]?.common };
		ThingsStage.views.forEach(v => v.draw());
	}).catch(() => {});   // no index: the stage just stays empty

	/** The words of a name as it would be spoken: "DesignTool" is also "design tool". */
	static pattern(name){
		const parts = name.replace(/\.md$/, "").split(/(?<=[a-z])(?=[A-Z])|[-_ ]/).filter(Boolean);
		return parts.map(w => w.replace(/\W/g, c => "\\" + c)).join("[-_ ]?");
	}

	static find(text, index = ThingsStage.index){
		if (!index || !text) return [];
		const sentences = String(text).split(/(?<=[.!?])\s+/), found = [];
		for (const [name, entry] of Object.entries(index)){
			if (!entry.url || name.length < 3) continue;
			const re = new RegExp("(?<![\\w/#@])" + ThingsStage.pattern(name) + "(?![\\w/])", entry.common ? "" : "i");   // a common word must be spoken with its capital
			const at = sentences.findIndex(s => re.test(s));
			if (at >= 0) found.push({ name, entry, sentence: sentences[at], at, pos: sentences[at].search(re) });
		}
		const seen = new Set();   // push-to-talk and PushToTalk are one spoken thing: the first mention wins
		return found.sort((a, b) => a.at - b.at || a.pos - b.pos).filter(t => { const k = t.name.toLowerCase().replace(/\W|_/g, ""); return !seen.has(k) && seen.add(k); });
	}

	get things(){ return ThingsStage.find(this.data.raw); }
	get ready(){ return this.things.length > 0; }
}

ThingsStage.View = class ThingsStageView extends VoiceStage.View {
	render(){ super.render(); ThingsStage.views.add(this); }

	body(){
		div.c("voice-things", () => this.stage.things.forEach(t => div.c("voice-thing", $t => {
			$t.el.append(build_row(t.name, { ...t.entry, class_card: t.entry.class_card ?? true }, "mention"));
			small.c("muted voice-thing-said", "“" + t.sentence.slice(0, 140) + "”");
		})));
	}
};
