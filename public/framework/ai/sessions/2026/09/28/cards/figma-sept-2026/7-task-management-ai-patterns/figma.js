import { View } from "/app.js";
import { compare } from "../compare.js";

// The Figma comparison, on its own so the three views sharing this card
// (view.js, details.js, ai.js) don't each embed the same screenshot —
// this one placement, last, shows it once for the whole section. Uses the
// group's shared `compare()` helper (review finding 8) instead of its own copy.
export default class Default extends View {

	render(){
		compare(new URL("figma.png", import.meta.url).href, "Figma: Task Management & AI Patterns section");
	}
}
