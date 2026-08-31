import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "The Ancient Astronaut Hypothesis",
	description: "Von Daniken to Sitchin: extraterrestrials as the builders of antiquity. The methodological critique, and why it still sells 50+ years later.",
	icon: "science",

	content(){
		md(`## Claim
Extraterrestrials visited Earth in antiquity and directly created or taught early civilizations, later remembered as gods. Erich von Daniken's *Chariots of the Gods* (1968) popularized it via a tour of monuments — pyramids, the Nazca Lines, Stonehenge — asking "coincidence?" of their scale or alignment. Zecharia Sitchin later extended it into a specific mythology: the Sumerian Anunnaki as literal astronauts, read out of his own translations of cuneiform texts.

## Evidence
None that survives scrutiny of its sourcing. The case rests entirely on reinterpreting existing monuments and texts rather than any new physical find.

## Assessment
The methodological critique is not "we disagree with the interpretation" — it's that the translations themselves are wrong. [Specialist critiques](https://www.hallofmaat.com/aa/the-return-of-ancient-astronauts-zecharia-sitchin-rekindles-an-old-pseudoscience/) find Sitchin's Anunnaki-as-astronauts reading rests on disputed, non-standard translations of Sumerian, not a competing reading of accepted ones. Mainstream Assyriologists, Sumerologists and anthropologists reject the translations outright, and the [hypothesis is widely categorized as pseudoarchaeology](https://en.wikipedia.org/wiki/Zecharia_Sitchin) — interpreting the past while rejecting standard evidentiary method rather than engaging it.

Why it persists anyway: [Stephan Blum and Stefan Baumann, *The Conversation*, March 17 2026](https://theconversation.com/why-some-people-still-believe-that-aliens-shaped-ancient-civilisations-277993), name three drivers — *proportionality bias* (extraordinary achievements feel like they need extraordinary causes), institutional distrust ("universities, museums and academic journals are often portrayed as gatekeepers"), and economics (pseudoscientific media is highly profitable; rigorous archaeology is not). Von Daniken's rhetorical trick of framing claims as questions lets an audience feel they reached the conclusion themselves. The History Channel's *Ancient Aliens* has run 15 seasons, functioning as the theory's main distribution channel largely independent of its reception in archaeology departments.

## Implications if true
Direct extraterrestrial contact in antiquity, with technology transfer, would be one of the largest findings in human history — and would demand the same evidentiary weight as any other extraordinary claim. It has never received a physical artifact that clears that bar.

## What would settle it
A physical artifact or text, authenticated and independently dated, unambiguously depicting or recording extraterrestrial contact or technology predating any plausible human origin — verified by epigraphers and archaeologists outside the proponent community. Every cited example (Nazca, pyramid alignments, Sumerian tablets) already has a mainstream, non-extraterrestrial explanation that fits the wider evidence base.

**Credence: fringe.**`);
	},
});
