// @ts-ignore
/** @typedef {import("./modules/application")} */
// @ts-ignore
/** @typedef {import("./modules/archive")} */
// @ts-ignore
/** @typedef {import("./modules/animator")} */
// @ts-ignore
/** @typedef {import("./modules/color")} */

"use strict";

//#region Equation
/**
 * @callback Equation
 * @param {Number} x
 * @returns {Number} y
 */
//#endregion
//#region Graph
class Graph {
	/**
	 * @param {Equation} equation 
	 * @param {Color} color 
	 */
	constructor(equation, color) {
		this.#equation = equation;
		this.#color = color;
	}
	/** @type {Equation} */ #equation;
	get equation() {
		return this.#equation;
	}
	set equation(value) {
		this.#equation = value;
	}
	/** @type {Boolean} */ #active = true;
	get active() {
		return this.#active;
	}
	set active(value) {
		this.#active = value;
	}
	/** @type {Color} */ #color;
	get color() {
		return this.#color;
	}
	set color(value) {
		this.#color = value;
	}
}
//#endregion
//#region Plane
class Plane extends Animator {
	/**
	 * @param {HTMLCanvasElement} canvas 
	 * @param {Boolean} launch 
	 */
	constructor(canvas, launch = false) {
		super(canvas, launch);
		this.#grid = Math.min(canvas.width, canvas.height) / 11;
		window.addEventListener(`resize`, (event) => {
			this.#grid = Math.min(canvas.width, canvas.height) / 11;
		});
		this.renderer((context) => {
			//#region Clear
			context.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
			// #endregion
			//#region Axis
			const size = this.#grid / 32;
			if (this.#axes) {
				context.strokeStyle = Color.WHITE.toString();
				const rows = Math.floor((canvas.height / 2) / this.#grid);
				for (let index = -rows; index <= rows; index++) {
					context.beginPath();
					context.lineWidth = (index == 0 ? size / 2 : size / 8);
					context.moveTo(-canvas.width / 2, index * this.#grid);
					context.lineTo(canvas.width / 2, index * this.#grid);
					context.stroke();
				}
				const columns = Math.floor((canvas.width / 2) / this.#grid);
				for (let index = -columns; index <= columns; index++) {
					context.beginPath();
					context.lineWidth = (index == 0 ? size / 2 : size / 8);
					context.moveTo(index * this.#grid, -canvas.height / 2);
					context.lineTo(index * this.#grid, canvas.height / 2);
					context.stroke();
				}
			}
			//#endregion
			//#region Graph
			this.graphs.forEach((graph) => {
				if (graph.active) {
					context.fillStyle = graph.color.toString();
					for (let x = -canvas.width / 2; x < canvas.width / 2; x++) {
						const y = graph.equation(x / this.#grid) * this.#grid;
						context.beginPath();
						context.arc(x, -y, size / 2, 0, 2 * Math.PI);
						context.fill();
					}
				}
			});
			//#endregion
		});
	}
	/** @type {Number} */ #grid;
	/** @type {Boolean} */ #axes = false;
	get axes() {
		return this.#axes;
	}
	set axes(value) {
		this.#axes = value;
	}
	/** @type {Map<Equation, Graph>} */ #data = new Map();
	/** @readonly */ get equations() {
		return Object.freeze(Array.from(this.#data.keys()));
	}
	/** @readonly */ get graphs() {
		return Object.freeze(Array.from(this.#data.values()));
	}
	/**
	 * @param {Equation} equation 
	 */
	draw(equation) {
		const count = 8; //Math.max(8, this.#data.size);
		const graph = new Graph(equation, Color.viaHSL(this.#data.size % count * (360 / count), 100, 50));
		this.#data.set(equation, graph);
	}
	/**
	 * @param {Equation} equation 
	 */
	erase(equation) {
		this.#data.delete(equation);
	}
}
//#endregion
//#region Settings
/**
 * @typedef {{}} SettingsNotation
 */
class Settings {

}
//#endregion
//#region Metadata
// /** @type {Archive<SettingsNotation>} */ const archiveSettings = new Archive(`${Application.developer}\\${Application.title}\\Settings`, Settings.export(new Settings()));
// let settings = Settings.import(archiveSettings.data);
// document.documentElement.dataset[`theme`] = settings.theme;
//#endregion