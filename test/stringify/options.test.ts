import { describe, expect, test } from "@jest/globals";

import { stringify } from "../../src/stringify";

describe("stringify", () => {
	describe("options", () => {
		test("pretty (default)", () => {
			expect(stringify({ a: 1, b: { c: "str" } })).toBe('{\n\t["a"] = 1,\n\t["b"] = {\n\t\t["c"] = "str",\n\t},\n}');
		});

		test("pretty (false)", () => {
			expect(stringify({ a: 1, b: { c: "str" } }, { pretty: false })).toBe('{["a"] = 1,["b"] = {["c"] = "str",},}');
		});

		test("pretty (true)", () => {
			expect(stringify({ a: 1, b: { c: "str" } }, { pretty: true })).toBe(
				'{\n\t["a"] = 1,\n\t["b"] = {\n\t\t["c"] = "str",\n\t},\n}'
			);
		});

		test("pretty (\t)", () => {
			expect(stringify({ a: 1, b: { c: "str" } }, { pretty: "\t" })).toBe(
				'{\n\t["a"] = 1,\n\t["b"] = {\n\t\t["c"] = "str",\n\t},\n}'
			);
		});

		test("pretty (2)", () => {
			expect(stringify({ a: 1, b: { c: "str" } }, { pretty: 2 })).toBe(
				'{\n  ["a"] = 1,\n  ["b"] = {\n    ["c"] = "str",\n  },\n}'
			);
		});

		test("pretty (4)", () => {
			expect(stringify({ a: 1, b: { c: "str" } }, { pretty: 4 })).toBe(
				'{\n    ["a"] = 1,\n    ["b"] = {\n        ["c"] = "str",\n    },\n}'
			);
		});
	});
});
