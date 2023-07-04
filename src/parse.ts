import { analyzeKeys, errMsg, isNumber, isWhiteSpace } from "./utils";

export interface ParseOptions {
	/**
	 * Define how empty tables are parsed
	 *
	 * Empty lua table could be an empty array or an empty object. This can't be determined by the parser.
	 * - "object": parse empty tables as empty objects
	 * - "array": parse empty tables as empty arrays
	 *
	 * @defaultValue "object"
	 */
	emptyTables?: "object" | "array";
	/**
	 * Allow boolean keys in tables
	 *
	 * Javascript object can only be indexed with string, so this can't be converted 1:1
	 * - true: convert boolean keys to string
	 * - false: throw error if boolean keys are encountered
	 *
	 * @defaultValue false
	 */
	booleanKeys?: boolean;
	/**
	 * Allow tables with string and numeric keys
	 *
	 * Javascript object can only be indexed with string, so this can't be converted 1:1
	 * - true: convert numeric keys to string, if string keys are present
	 * - false: throw error, if table with mixed key types is encountered
	 *
	 * @defaultValue false
	 */
	mixedKeyTypes?: boolean;
	/**
	 * Allow numeric table keys that are not positive integers
	 *
	 * Numeric keys should be array indices, this is not possible, if numeric keys are floats or <= 0
	 * - true: convert tables with non-positive-integers keys to objects, keys are converted to strings
	 * - false: throw error, if non-positive-integers keys are encountered
	 *
	 * @defaultValue false
	 */
	nonPositiveIntegerKeys?: boolean;
	/**
	 * Allow sparse arrays
	 *
	 * Sparse arrays behave different in lua and javascript\
	 * - true: Parse sparse arrays as sparse arrays
	 * - false: throw error if input contains sparse array
	 *
	 * @defaultValue true
	 */
	sparseArray?: boolean;
}

/**
 * Parse stringified lua-table
 *
 * @param input string containing lua-table
 * @param options.emptyTables parse empty tables as object or array (Default object)
 * @param options.booleanKeys allow boolean keys in tables
 * @param options.mixedKeyTypes allow tables with string and numeric keys
 * @param options.nonPositiveIntegerKeys allow numeric keys that are not positive integers
 * @param options.sparseArray allow sparse arrays (default true)
 *
 * @returns parsed data. type depends on given input
 *
 * @throws if input can't be parsed an error is thrown. Error message contains the reason for pasing failure
 */
export function parse(input: string, options?: ParseOptions): unknown {
	const parser = new Parser(input, options);
	return parser.parse();
}

class Parser {
	input: string;
	pos: number;
	options: ParseOptions;

	constructor(input: string, options?: ParseOptions) {
		this.input = input;
		this.pos = 0;
		this.options = options ?? {};
	}

	public parse(): unknown {
		if (typeof this.input !== "string") {
			throw new Error(errMsg.notString());
		}
		if (this.input.length === 0) {
			throw new Error(errMsg.empty());
		}
		this.skipWhiteSpace();
		if (this.isEnd()) {
			throw new Error(errMsg.end());
		}
		const value = this.tryValue();
		if (value === undefined) {
			throw new Error(this.invalidMessage());
		}
		this.skipWhiteSpace();
		if (!this.isEnd()) {
			throw new Error(this.invalidMessage());
		}
		return value;
	}

	isEnd() {
		return this.pos >= this.input.length;
	}

	currentChar() {
		return this.input.charAt(this.pos);
	}

	invalidMessage() {
		if (this.isEnd()) {
			return errMsg.end();
		}
		const surround = this.input.slice(Math.max(0, this.pos - 10), this.pos + 10);
		return errMsg.invalid(this.currentChar(), this.pos, this.getLinePos(), surround);
	}

	getLinePos() {
		let line = 1;
		let col = 0;
		let i = 0;
		while (i < this.pos) {
			if (this.input.charAt(i) === "\n") {
				line++;
				col = 1;
			} else {
				col++;
			}
			i++;
		}
		return { line, col };
	}

	tryValue() {
		let value: unknown;
		value = this.tryString();
		if (value === undefined) {
			value = this.tryNumber();
		}
		if (value === undefined) {
			value = this.tryBoolean();
		}
		if (value === undefined) {
			value = this.tryNil();
		}
		if (value === undefined) {
			value = this.tryTable();
		}
		return value;
	}

	tryTable(): unknown {
		if (this.currentChar() !== "{") {
			return undefined;
		}
		this.pos++;

		const arrEntries: unknown[] = [];
		const entries = new Map<string | number, unknown>();
		while (!this.isEnd()) {
			this.skipWhiteSpace();
			if (this.currentChar() === "}") {
				this.pos++;
				return this.finalizeTable(arrEntries, entries);
			}
			let key = this.tryValue();
			if (key === undefined) {
				key = this.tryLiteral();

				if (key === undefined) {
					throw new Error(this.invalidMessage());
				}
			}
			this.skipWhiteSpace();
			if (this.currentChar() === ",") {
				this.pos++;
				this.skipWhiteSpace();
				arrEntries.push(key);
			}
			else if (this.currentChar() === "=") {
				this.pos++;
				this.skipWhiteSpace();
				const value = this.tryValue();
				if (key === undefined) {
					arrEntries.push(value);
				}
				else {
					if (typeof(key) == 'number') {
						arrEntries[key] = value;
					}
					else if (typeof(key) == 'boolean') {
						arrEntries[key ? 1 : 0] = value;
					}
					else if (typeof(key) == 'string') {
						entries.set(key, value);
					}
					else {
						throw new Error(this.invalidMessage());
					}
				}
				this.skipWhiteSpace();
				if (this.currentChar() === ",") {
					this.pos++;
					this.skipWhiteSpace();
				}
			}
		}
		throw new Error(errMsg.end());
	}

	tryKey(): string | number | undefined {
		let key: string | number | undefined;
		if (this.currentChar() !== "[") {
			key = this.tryLiteral();
		}
		else {
			this.skipWhiteSpace();
			key = this.tryString();
			if (key == undefined) {
				key = this.tryNumber();
			}
			if (key == undefined && this.options.booleanKeys) {
				key = this.tryBoolean()?.toString();
			}
			if (key == undefined) {
				throw new Error(this.invalidMessage());
			}
			this.skipWhiteSpace();
			if (this.currentChar() !== "]") {
				throw new Error(this.invalidMessage());
			}
		}

		if (key === undefined) {
			throw new Error(this.invalidMessage());
		}

		return key;
	}

	tryLiteral(): string | undefined {
		const start = this.pos;
		while (++this.pos < this.input.length) {
			const char = this.currentChar();

			// we need to bail out if we see a comma
			if (isWhiteSpace(char) || char === ',') {
				return this.input.slice(start, this.pos);
			}
		}

		return this.input.slice(start);
	}

	tryString(): string | undefined {
		const quote = this.currentChar();
		if (quote !== '"' && quote !== "'") {
			return undefined;
		}
		const start = this.pos + 1;
		let escaped = false;
		while (++this.pos < this.input.length) {
			if (escaped) {
				escaped = false;
				continue;
			}
			const char = this.currentChar();
			if (char === "\\") {
				escaped = true;
				continue;
			}
			if (char === quote) {
				this.pos++;
				return this.input
					.slice(start, this.pos - 1)
					.replaceAll('\\"', '"')
					.replaceAll("\\'", "'")
					.replaceAll("\\n", "\n")
					.replaceAll("\\t", "\t");
			}
		}
		throw new Error(errMsg.end());
	}

	tryNumber(): number | undefined {
		let char = this.currentChar();
		if (char !== "." && char !== "-" && !isNumber(char)) {
			return undefined;
		}
		let pos = this.pos;
		let decimal = char === ".";
		while (++pos < this.input.length) {
			char = this.input.charAt(pos);
			if (char === "." && !decimal) {
				decimal = true;
			} else if (!isNumber(char)) {
				const num = Number.parseFloat(this.input.slice(this.pos, pos));
				if (Number.isNaN(num)) {
					return undefined;
				}
				this.pos = pos;
				return num;
			}
		}
		const num = Number.parseFloat(this.input.slice(this.pos, pos));
		if (Number.isNaN(num)) {
			return undefined;
		}
		this.pos = pos;
		return num;
	}

	tryBoolean(): boolean | undefined {
		if (this.input.slice(this.pos, this.pos + 4) === "true") {
			this.pos += 4;
			return true;
		}
		if (this.input.slice(this.pos, this.pos + 5) === "false") {
			this.pos += 5;
			return false;
		}
		return undefined;
	}

	tryNil(): null | undefined {
		if (this.input.slice(this.pos, this.pos + 3) === "nil") {
			this.pos += 3;
			return null;
		}
		return undefined;
	}

	/** skip whitespace and also comments */
	skipWhiteSpace() {
		while (this.pos < this.input.length) {
			const char = this.currentChar();
			if (isWhiteSpace(char)) {
				this.pos++;
			} else if (this.input.slice(this.pos, this.pos + 2) === "--") {
				if (this.input.slice(this.pos + 2, this.pos + 4) === "[[") {
					this.pos += 4;
					while (!this.isEnd() && this.input.slice(this.pos, this.pos + 2) !== "]]") {
						this.pos++;
					}
					this.pos += 2;
				} else {
					this.pos += 2;
					while (!this.isEnd() && this.currentChar() !== "\n") {
						this.pos++;
					}
					this.pos++;
				}
			} else {
				return;
			}
		}
	}

	finalizeTable(arrEntries: unknown[], entries: Map<string | number, unknown>): unknown[] | Record<string, unknown> {
		arrEntries.forEach((v, i) => entries.set(i + 1, v));
		const keys = [...entries.keys()];
		const { hasStringKey, hasNumKeys, hasNonArrayNumKeys } = analyzeKeys(keys);

		if (hasNonArrayNumKeys && !this.options.nonPositiveIntegerKeys) {
			throw new Error(errMsg.nonPosIntKeys());
		}

		if (hasStringKey) {
			if (hasNumKeys && !this.options.mixedKeyTypes) {
				throw new Error(errMsg.mixed());
			}
			return Object.fromEntries(entries.entries());
		} else {
			if (!hasNumKeys) {
				return this.options.emptyTables === "array" ? [] : {};
			}
			if (hasNonArrayNumKeys) {
				return Object.fromEntries(entries.entries());
			}
			const arr: unknown[] = [];
			entries.forEach((v, i) => {
				if (typeof i === "string") {
					throw new Error(errMsg.error());
				}
				arr[i - 1] = v;
			});
			if (this.options.sparseArray === false) {
				for (let i = 0; i < arr.length; i++) {
					if (arr[i] == undefined) {
						throw new Error(errMsg.sparse());
					}
				}
			}
			return arr;
		}
	}
}
