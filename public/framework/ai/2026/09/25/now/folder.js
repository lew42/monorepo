// Draws a real folder on the card: the tree, and the highlighted source of the file you click.
import files from "../../../../../ext/files/files.js";

export default function folder(page, $box, { url, names }){
	$box.append(() => { files({ url: location.origin + url }, names, { route: false }); });
}
