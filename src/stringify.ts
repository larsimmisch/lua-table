import { isFunction, isPlainObject } from "./utils";

export interface StringifyOptions {
	/**
	 * Configure pretty-print for result
	 *
	 * can be
	 * - string: will be used as indent
	 * - number: count of spaces used as indent
	 * - true: indent with tabs
	 * - false: disables pretty-print
	 *
	 * @defaultValue true
	 */
	pretty?: boolean | number | string;
}

/**
 * Stringify data to a lua-table\
 * See README for supported types of data
 *
 * @param data the data so stringify
 * @param options.pretty pretty-print the result (default true)
 *
 * @returns stringified lua-table
 */
export function stringify(data: unknown, options?: StringifyOptions) {
	if (data == undefined || isFunction(data)) {
		return "nil";
	}
	return _stringify({ data, lvl: 0, path: [], indent: getIndent(options?.pretty) });
}

function getIndent(pretty?: boolean | number | string): string | undefined {
	if (typeof pretty === "string") {
		return pretty;
	}
	if (typeof pretty === "number") {
		return " ".repeat(pretty);
	}
	if (pretty === false) {
		return undefined;
	}
	return "\t";
}

interface _stringifyArgs {
	data: unknown;
	lvl: number;
	path: string[];
	indent: string | undefined;
}
function _stringify({ data, lvl, path, indent }: _stringifyArgs) {
	if (data === null) {
		return "nil";
	}

	if (typeof data === "number" || typeof data === "boolean") {
		return data.toString();
	}

	if (typeof data === "string") {
		const str = data.replaceAll('"', '\\"').replaceAll("\n", "\\n");
		return `"${str}"`;
	}

	if (Array.isArray(data) || isPlainObject(data)) {
		const lines: string[] = [];

		if (Array.isArray(data)) {
			data.forEach((value: unknown, index) => {
				if (value !== undefined && !isFunction(value)) {
					lines.push(
						`[${index + 1}] = ${_stringify({ data: value, lvl: lvl + 1, path: [...path, index.toString()], indent })},`
					);
				}
			});
		} else {
			for (const [key, value] of Object.entries(data)) {
				if (value !== undefined && !isFunction(value)) {
					lines.push(`["${key}"] = ${_stringify({ data: value, lvl: lvl + 1, path: [...path, key], indent })},`);
				}
			}
		}

		if (lines.length === 0) {
			return "{ }";
		}

		return ["{", nl(indent, lvl + 1), lines.join(nl(indent, lvl + 1)), nl(indent, lvl), "}"].join("");
	}
	throw new Error(
		`Encountered unknown data type at path '${path.join(".")}' (${Object.prototype.toString.call(data)})`
	);
}

function nl(indent: string | undefined, lvl: number): string {
	if (indent === undefined) {
		return "";
	}
	return "\n" + indent.repeat(lvl);
}
