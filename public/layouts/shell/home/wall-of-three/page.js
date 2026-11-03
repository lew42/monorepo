import { Page } from "/app.js";
import { design, derive } from "../../Design.js";
import { home } from "../page.js";

/* Home, with the wall's column count halved. One number. */
export const wallOfThree = derive(home, { wall: { count: 3 } });

export default new Page(design(wallOfThree, {
	meta: import.meta,
	title: "Wall of three",
	description: "The same six cards in three columns instead of six, so each card is twice as wide and carries twice the weight.",
	changed: "CHANGED one number: the wall's column count, from 6 to 3. Six cards still divide by three, so no row is ever short — the wall steps 1, 2 and then stops at 3 instead of going on to 6. The cards are about twice as wide, which turns a directory into a set of choices: three things a reader is meant to pick between rather than six things to scan.",
	children: "with-rail",
}));
