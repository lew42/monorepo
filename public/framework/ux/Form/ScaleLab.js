import View, { div, label, option, select, pre } from "../../core/View/View.js";
import Question from "./Question.js";
import "./Answer.js";

/**
 * ScaleLab: one Scale7 you can re-dress while you watch. Pick markers, input and step; the scale is
 * rebuilt with the same value, so you see that only the look changed, never what is stored.
 *   new ScaleLab()
 */
export default class ScaleLab extends View {

	static markers = ["numbers", "faces", "icons", "bars"];
	static inputs = ["buttons", "slider"];
	static steps = ["1", "0.5"];

	classify(){
		super.classify();
		this.ac("fm-lab");
	}

	render(){
		this.look = { markers: "numbers", input: "buttons", step: "1" };
		div.c("fm-look", () => {
			this.pick("markers", this.constructor.markers);
			this.pick("input", this.constructor.inputs);
			this.pick("step", this.constructor.steps);
		});
		this.stage = div.c("fm-lab-stage");
		this.json = pre.c("fm-json", "");
		this.draw();
	}

	pick(key, list){
		label.c("fm-pick", () => {
			div.c("fm-pick-name", key);
			select.c("fm-field", () => list.forEach(v => option(v).attr("value", v)))
				.on("change", e => { this.look[key] = e.target.value; this.draw(); });
		});
	}

	draw(){
		const before = this.question?.value ?? null;
		const { markers, input, step } = this.look;
		this.question = new Question({
			type: "T09", label: "How was the intro?", config: { markers, input, step: Number(step) },
		});
		this.stage.empty(this.question);
		this.question.value = before;
		const show = () => this.json.text(JSON.stringify(this.question.value));
		this.question.answer.on("change", show);
		show();
	}
}
