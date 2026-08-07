import { div } from "/app.js";
import { box, lines } from "../parts.js";

export default () => {
	div.c("grid gap auto", () => {
		for (let i = 1; i <= 6; i++) box("Card " + i, () => lines(1));
	});
};
