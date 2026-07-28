// A real file, fetched and highlighted by syntax.file() on this ext's page.
import { div, h1 } from "/app.js";

export default function greet(name = "world"){
	return div.c("greeting", () => h1(`Hello, ${name}!`));
}
