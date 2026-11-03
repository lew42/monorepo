/* A page or a frame inside a tracked Figma file: a name, a size, a screenshot saved in the repo. */
export class FigmaNode {
	constructor(data, file){
		Object.assign(this, data);
		this.file = file;
	}
	get shot_url(){ return this.shot ? import.meta.resolve(`./data/${this.file.key}/${this.shot}`) : null; }
	get thumb_url(){ return this.shot ? import.meta.resolve(`./data/${this.file.key}/${this.shot.replace("shots/", "thumbs/").replace(/.png$/, ".jpg")}`) : null; }
	get built(){ return this.file.built.get(this.id); }
	get ratio(){ return this.w && this.h ? `${Math.round(this.w)} / ${Math.round(this.h)}` : "4 / 3"; }
	get figma_url(){ return `${this.file.url}?node-id=${this.id.replace(":", "-")}`; }
}
export default FigmaNode;
