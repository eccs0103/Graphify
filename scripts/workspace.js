// @ts-ignore
/** @typedef {import("./structure")} */

"use strict";

window.addEventListener(`beforeunload`, (event) => {
	archiveSettings.data = Settings.export(settings);
});

try {
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#board`)));
	const plane = new Plane(canvas, true);
	plane.axes = true;

	const divGraphsPanel = (/** @type {HTMLDivElement} */ (document.querySelector(`div#graphs-panel`)));

	const textareaEquationField = (/** @type {HTMLTextAreaElement} */ (document.querySelector(`textarea#equation-field`)));
	textareaEquationField.value = settings.expression;

	divGraphsPanel.hidden = settings.isGraphsPanelHidden;
	if (!divGraphsPanel.hidden)
		textareaEquationField.focus();

	const inputToggleGraphsPanel = (/** @type {HTMLInputElement} */ (document.querySelector(`input#toggle-graphs-panel`)));
	inputToggleGraphsPanel.checked = !settings.isGraphsPanelHidden;
	inputToggleGraphsPanel.addEventListener(`change`, (event) => {
		divGraphsPanel.hidden = !inputToggleGraphsPanel.checked;
		textareaEquationField.focus();
		settings.isGraphsPanelHidden = divGraphsPanel.hidden;
	});

	function evaluate() {
		plane.equations.forEach((equation) => {
			plane.erase(equation);
		});
		textareaEquationField.value.split(/\s*;\s*/).filter(part => part).forEach(async (part) => {
			try {
				// part = part.replace(/\^/g, (substring) => );
				const expression = Interpreter.assemble(Interpreter.tokenize(part));
				const equation = (/** @type {Equation} */ (eval(`x => ${expression}`)));
				plane.draw(equation);
				settings.expression = textareaEquationField.value;
			} catch (exception) {
				await Application.alert(exception instanceof Error ? exception.stack ?? `${exception.name}: ${exception.message}` : 'Invalid exception type.');
			}
		});
	}
	evaluate();
	textareaEquationField.addEventListener(`change`, evaluate);

	window.addEventListener(`keydown`, (event) => {
		if (event.key == `Tab`) {
			event.preventDefault();
			inputToggleGraphsPanel.checked = !inputToggleGraphsPanel.checked;
			divGraphsPanel.hidden = !inputToggleGraphsPanel.checked;
			textareaEquationField.focus();
			settings.isGraphsPanelHidden = divGraphsPanel.hidden;
		}
	});
} catch (exception) {
	Application.prevent(exception);
}