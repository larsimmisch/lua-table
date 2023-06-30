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
	/**
	 * Allow tables with string and numeric keys.
	 *
	 * Javascript object can only be indexed with string, so this can't be converted 1:1.
	 * - true: Convert keys that are parseable as number to number, leave non-numbers as string
	 * - false: Leave all keys as string
	 *
	 * @defaultValue false
	 *
	 * Options `nonPositiveIntegerKeys` can be used to define which numbers are allowed as keys
	 */
	mixedKeyTypes?: boolean;
	/**
	 * Allow numeric table keys that are not positive integers.\
	 * This option only influences the output if `mixedKeyTypes` is true.
	 *
	 * - true: Every key parseable as number will be converted to number
	 * - false: Only positive integers will be converted to number, other keys will be left as string
	 *
	 * @defaultValue false
	 */
	nonPositiveIntegerKeys?: boolean;
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
	return _stringify({
		data,
		lvl: 0,
		path: [],
		indent: getIndent(options?.pretty),
		mixedKeyTypes: options?.mixedKeyTypes,
		nonPositiveIntegerKeys: options?.nonPositiveIntegerKeys,
	});
}

interface _stringifyArgs {
	data: unknown;
	lvl: number;
	path: string[];
	indent: string | undefined;
	mixedKeyTypes: boolean | undefined;
	nonPositiveIntegerKeys: boolean | undefined;
}
function _stringify({ data, lvl, path, indent, mixedKeyTypes, nonPositiveIntegerKeys }: _stringifyArgs) {
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

	const space = indent == undefined ? "" : " ";

	if (Array.isArray(data) || isPlainObject(data)) {
		const lines: string[] = [];

		if (Array.isArray(data)) {
			data.forEach((value: unknown, index) => {
				if (value !== undefined && !isFunction(value)) {
					lines.push(
						`[${index + 1}]${space}=${space}${_stringify({
							data: value,
							lvl: lvl + 1,
							path: [...path, index.toString()],
							indent,
							mixedKeyTypes,
							nonPositiveIntegerKeys,
						})}`
					);
				}
			});
		} else {
			for (const [key, value] of Object.entries(data)) {
				if (value !== undefined && !isFunction(value)) {
					const tableKey = stringifyTableKey({ key, mixedKeyTypes, nonPositiveIntegerKeys });
					lines.push(
						`[${tableKey}]${space}=${space}${_stringify({
							data: value,
							lvl: lvl + 1,
							path: [...path, key],
							indent,
							mixedKeyTypes,
							nonPositiveIntegerKeys,
						})}`
					);
				}
			}
		}

		if (lines.length === 0) {
			return `{${space}}`;
		}

		return [
			"{",
			nl(indent, lvl + 1),
			lines.join(`,${nl(indent, lvl + 1)}`),
			indent == undefined ? "" : ",",
			nl(indent, lvl),
			"}",
		].join("");
	}
	throw new Error(
		`Encountered unknown data type at path '${path.join(".")}' (${Object.prototype.toString.call(data)})`
	);
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

function nl(indent: string | undefined, lvl: number): string {
	if (indent === undefined) {
		return "";
	}
	return "\n" + indent.repeat(lvl);
}

function stringifyTableKey({
	key,
	mixedKeyTypes,
	nonPositiveIntegerKeys,
}: {
	key: string;
	mixedKeyTypes: boolean | undefined;
	nonPositiveIntegerKeys: boolean | undefined;
}): string {
	if (!mixedKeyTypes) {
		return `"${key}"`;
	}
	const numKey = Number(key);
	if (!Number.isFinite(numKey)) {
		return `"${key}"`;
	}
	if (nonPositiveIntegerKeys || (Number.isInteger(numKey) && numKey > 0)) {
		return key;
	}
	return `"${key}"`;
}
