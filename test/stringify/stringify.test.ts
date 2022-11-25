import { readFileSync } from "node:fs";
import * as Path from "node:path";

import { describe, expect, test } from "@jest/globals";

import { stringify } from "../../src/stringify";

describe("stringify", () => {
	test("undefined", () => {
		expect(stringify(undefined)).toBe("nil");
	});

	test("null", () => {
		expect(stringify(null)).toBe("nil");
	});

	test("string", () => {
		expect(stringify("test")).toBe(`"test"`);
	});

	test("number", () => {
		expect(stringify(123.456)).toBe("123.456");
	});

	test("function", () => {
		expect(stringify(() => 1)).toBe("nil");
	});

	test("array", () => {
		expect(stringify([1, 2, 3])).toBe(fromFile("array.txt"));
	});

	test("object", () => {
		expect(stringify({ a: 1, b: 2, c: 3 })).toBe(fromFile("object.txt"));
	});

	test("class", () => {
		class Test {
			public a = 1;
			private b = "str";
			#c = 3;
			public fn() {
				return 4;
			}
		}
		expect(stringify(new Test())).toBe(fromFile("class.txt"));
	});

	test("complex", () => {
		expect(
			stringify({
				undef: undefined,
				nul: null,
				str: "string",
				num: 1,
				arr: [2, "a", { a: 3 }],
				obj: { a: "a", b: 4, c: [] },
			})
		).toBe(fromFile("complex.txt"));
	});
});

function fromFile(name: string) {
	return readFileSync(Path.join(__dirname, "data", name), "utf-8");
}
