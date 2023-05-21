// @ts-ignore
/** @typedef {import("./structure")} */

"use strict";

try {
	const canvas = (/** @type {HTMLCanvasElement} */ (document.querySelector(`canvas#board`)));
	const plane = new Plane(canvas, true);
	plane.axes = true;

	const divGraphsPanel = (/** @type {HTMLDivElement} */ (document.querySelector(`div#graphs-panel`)));
	const inputToggleGraphsPanel = (/** @type {HTMLInputElement} */ (document.querySelector(`input#toggle-graphs-panel`)));
	divGraphsPanel.hidden = !inputToggleGraphsPanel.checked;
	inputToggleGraphsPanel.addEventListener(`change`, (event) => {
		divGraphsPanel.hidden = !inputToggleGraphsPanel.checked;
	});

	const textareaEquationField = (/** @type {HTMLTextAreaElement} */ (document.querySelector(`textarea#equation-field`)));
	textareaEquationField.value = `x => x * Math.pow(2, Math.sin(x + 2 * Math.PI * plane.impulse(1000)));`;
	const input = Application.search.get(`input`);
	if (input) {
		textareaEquationField.value = input;
	}
	function draw() {
		plane.equations.forEach((equation) => {
			plane.erase(equation);
		});
		const input = textareaEquationField.value;
		const parts = input.split(/\s*;\s*/);
		parts.filter(part => part).forEach(async (part) => {
			try {
				const equation = (/** @type {Equation} */ (eval(part)));
				if (typeof equation !== 'function' || equation.length !== 1) {
					throw new SyntaxError('Invalid equation syntax. Equation must be (x: Number) => Number type;');
				}
				plane.draw(equation);
			} catch (exception) {
				await Application.alert(exception instanceof Error ? exception.stack ?? `${exception.name}: ${exception.message}` : 'Invalid exception type.');
			}
		});
	}
	draw();
	textareaEquationField.addEventListener(`change`, (event) => {
		draw();
	});
} catch (exception) {
	Application.prevent(exception);
}
