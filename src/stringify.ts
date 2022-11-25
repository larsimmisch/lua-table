import { isFunction, isPlainObject } from "./utils";

export function stringify(data: unknown) {
	if (data === undefined || isFunction(data)) {
		return "nil";
	}
	return _stringify({ data, indent: 0, path: [] });
}

interface _stringifyArgs {
	data: unknown;
	indent: number;
	path: string[];
}
function _stringify({ data, indent, path }: _stringifyArgs) {
	if (data === null) {
		return "nil";
	}

	if (typeof data === "number" || typeof data === "boolean") {
		return data.toString();
	}

	if (typeof data === "string") {
		return `"${data}"`;
	}

	if (Array.isArray(data) || isPlainObject(data)) {
		const lines: string[] = [];

		if (Array.isArray(data)) {
			data.forEach((value: unknown, index) => {
				if (value !== undefined && !isFunction(value)) {
					lines.push(
						`[${index + 1}] = ${_stringify({ data: value, indent: indent + 1, path: [...path, index.toString()] })},`
					);
				}
			});
		} else {
			for (const [key, value] of Object.entries(data)) {
				if (value !== undefined && !isFunction(value)) {
					lines.push(`["${key}"] = ${_stringify({ data: value, indent: indent + 1, path: [...path, key] })},`);
				}
			}
		}

		if (lines.length === 0) {
			return "{ }";
		}

		return ["{", nl(indent + 1), lines.join(nl(indent + 1)), nl(indent), "}"].join("");
	}
	throw new Error(
		`Encountered unknown data type at path '${path.join(".")}' (${Object.prototype.toString.call(data)})`
	);
}

function nl(indent: number) {
	return "\n" + "\t".repeat(indent);
}
