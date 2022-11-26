import { describe, expect, test } from "@jest/globals";

import { stringify } from "../../src/stringify";
import { fromFile } from "../utils";

describe("stringify", () => {
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

		test("string (escaped quote)", () => {
			expect(stringify('test"string')).toBe(`"test\\"string"`);
		});

		test("string (newline)", () => {
			expect(stringify("test\nstring")).toBe(`"test\\nstring"`);
		});

		test("number", () => {
			expect(stringify(123.456)).toBe("123.456");
		});

		test("function", () => {
			expect(stringify(() => 1)).toBe("nil");
		});

		test("array", () => {
			expect(stringify([1, 2, "str"])).toBe(fromFile("array"));
		});

		test("object", () => {
			expect(stringify({ a: 1, b: 2, c: "str" })).toBe(fromFile("object"));
		});

		test("class", () => {
			class Test {
				public a = 1;
				private b = 2;
				c = "str";
				#d = 3;
				public fn() {
					return 4;
				}
			}
			expect(stringify(new Test())).toBe(fromFile("object"));
		});

		test("complex", () => {
			expect(
				stringify({
					undef: undefined,
					nul: null,
					str: "string",
					num: 1,
					arr: [2, "a", { a: 3 }],
					obj: { a: "a", b: 4, c: {} },
				})
			).toBe(fromFile("complex"));
		});
	});
});
