import { div, span, a, form, input, textarea, button, select, option } from "../../core/View/View.js";
import { start, available } from "../Ask/Ask.js";

/* Start work from the board. The server scaffolds the task dir and spawns the
   session; everything after that arrives through the task's own log, so there
   is no progress to render here — the card appears on the board and moves on
   its own. Absent off localhost rather than broken: there is no dev server to
   spawn anything, and the board is otherwise a static page. */

const MODELS = [["sonnet", "Sonnet"], ["opus", "Opus"], ["haiku", "Haiku"]];

export function compose(efforts = []){
	if (!available()) return;

	return div.c("ai-compose surface pad measure start", () => form.c("flex v gap", $form => {
		const $prompt = textarea.c("ai-compose-input")
			.attr("placeholder", "What should Claude work on?").attr("rows", "3");

		let $name, $effort, $model, $go, $said;

		div.c("flex gap v-center wrap", () => {
			$name = input.c("ai-compose-name").attr("placeholder", "name (optional)");
			$effort = select.c("ai-compose-effort", () => {
				option("— loose —").attr("value", "");
				efforts.filter(e => e.slug).forEach(e => option(e.title).attr("value", e.slug));
			});
			$model = select.c("ai-compose-model", () =>
				MODELS.forEach(([value, label]) => option(label).attr("value", value)));
			$go = button.c("ai-compose-go", "Start").attr("type", "submit");
			$said = span.c("muted");
		}).style("--gap", ".5em");

		const go = async () => {
			const prompt = $prompt.el.value.trim();
			if (!prompt || $go.el.disabled) return;

			$go.el.disabled = true;
			$said.el.textContent = "starting…";
			try {
				const { url, slug } = await start(prompt, {
					name: $name.el.value.trim() || undefined,
					group: $effort.el.value || undefined, model: $model.el.value });
				$prompt.el.value = $name.el.value = "";
				$said.empty(() => { span("started "); a.c("ai-link", slug).href(url); });
			} catch (e){
				$said.el.textContent = e.message;
			} finally {
				$go.el.disabled = false;
			}
		};

		$form.on("submit", e => { e.preventDefault(); go(); });

		// Ctrl/⌘+Enter sends, the way every other compose box does.
		$prompt.on("keydown", e => (e.metaKey || e.ctrlKey) && e.key === "Enter" && go());
	}).style("--gap", ".5em"));
}

export default compose;
