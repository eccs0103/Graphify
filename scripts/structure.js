// @ts-ignore
/** @typedef {import("./modules/application")} */
// @ts-ignore
/** @typedef {import("./modules/archive")} */
// @ts-ignore
/** @typedef {import("./modules/animator")} */
// @ts-ignore
/** @typedef {import("./modules/color")} */

"use strict";

//#region Token
/** @enum {String} */ const TokenType = {
	/** @readonly */ number: `number`,
	/** @readonly */ operator: `operator`,
	/** @readonly */ identifier: `identifier`,
};
class Token {
	/**
	 * @param {TokenType} type 
	 * @param {String} value 
	 */
	constructor(type, value) {
		this.#type = type;
		this.#value = value;
	}
	/** @type {TokenType} */ #type;
	/** @readonly */ get type() {
		return this.#type;
	}
	/** @type {String} */ #value;
	/** @readonly */ get value() {
		return this.#value;
	}
}
//#endregion
//#region Interpreter
class Interpreter {
	static #memory = new Map(Object.getOwnPropertyNames(Math).map((key) => [key, `Math.${key}`]));
	static {
		Interpreter.#memory.set(`x`, `x`);
		Interpreter.#memory.set(`impulse`, `plane.impulse`);
		Interpreter.#memory.set(`pulse`, `plane.pulse`);
		Interpreter.#memory.set(`bounce`, `plane.bounce`);
	}
	/**
	 * @param {String} expression 
	 */
	static tokenize(expression) {
		const tokens = [];
		const regex = /\s*([()+\-*\/,])|(\d+(?:\.\d+)?)|([a-zA-Z_]\w*)\s*/g;
		for (let match; (match = regex.exec(expression));) {
			if (match[1]) {
				tokens.push(new Token(TokenType.operator, match[1]));
			} else if (match[2]) {
				tokens.push(new Token(TokenType.number, match[2]));
			} else if (match[3]) {
				tokens.push(new Token(TokenType.identifier, match[3]));
			}
			//else throw new SyntaxError(`Invalid token type: '${match[4]}'.`);
		}
		return tokens;
	}
	/**
	 * @param {Array<Token>} tokens
	 */
	static assemble(tokens) {
		return tokens.map((token) => {
			if (token.type == TokenType.number) {
				return token.value;
			} else if (token.type == TokenType.operator) {
				const gap = /[+\-*\/]/.test(token.value);
				return `${gap ? ` ` : ``}${token.value}${gap ? ` ` : ``}`;
			} else if (token.type == TokenType.identifier) {
				const result = Interpreter.#memory.get(token.value);
				// return (result !== undefined) ? result : token.value;
				if (result === undefined) {
					throw new SyntaxError(`Invalid identifier: '${token.value}'.`);
				}
				return result;
			} else throw new TypeError(`Invalid token type: '${token.type}'.`);
		}).join(``);
	}
}
//#endregion
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
						const y = (() => {
							try {
								return graph.equation(x / this.#grid) * this.#grid;
							} catch {
								return NaN;
							}
						})();
						context.beginPath();
						context.arc(x, -y, size / 2, 0, 2 * Math.PI);
						context.fill();
					}
				}
			});
			//#endregion
			// Application.debug(this.FPS.toFixed());
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
 * @typedef SettingsNotation
 * @property {String} [expression]
 * @property {Boolean} [isGraphsPanelHidden]
 */
class Settings {
	/**
	 * @param {SettingsNotation} source 
	 */
	static import(source) {
		const result = new Settings();
		if (source.expression !== undefined) result.#expression = source.expression;
		if (source.isGraphsPanelHidden !== undefined) result.#isGraphsPanelHidden = source.isGraphsPanelHidden;
		return result;
	}
	/**
	 * @param {Settings} source 
	 */
	static export(source) {
		const result = (/** @type {SettingsNotation} */ ({}));
		result.expression = source.#expression;
		result.isGraphsPanelHidden = source.#isGraphsPanelHidden;
		return result;
	}
	constructor() {
		this.#expression = `x * pow(2, sin(x + 2 * PI * impulse(1000)));\n`;
		this.#isGraphsPanelHidden = true;
	}
	/** @type {String} */ #expression;
	get expression() {
		return this.#expression;
	}
	set expression(value) {
		this.#expression = value;
	}
	/** @type {Boolean} */ #isGraphsPanelHidden;
	get isGraphsPanelHidden() {
		return this.#isGraphsPanelHidden;
	}
	set isGraphsPanelHidden(value) {
		this.#isGraphsPanelHidden = value;
	}
}
//#endregion
//#region Metadata
/** @type {Archive<SettingsNotation>} */ const archiveSettings = new Archive(`${Application.developer}\\${Application.title}\\Settings`, Settings.export(new Settings()));
let settings = Settings.import(archiveSettings.data);
// document.documentElement.dataset[`theme`] = settings.theme;
//#endregion