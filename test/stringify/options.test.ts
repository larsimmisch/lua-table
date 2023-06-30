import { describe, expect, test } from "@jest/globals";

import { stringify } from "../../src/stringify";

describe("stringify", () => {
	describe("options", () => {
		test("pretty (default)", () => {
			expect(stringify({ a: 1, b: { c: "str" } })).toBe('{\n\t["a"] = 1,\n\t["b"] = {\n\t\t["c"] = "str",\n\t},\n}');
		});

		test("pretty (false)", () => {
			expect(stringify({ a: 1, b: { c: "str" } }, { pretty: false })).toBe('{["a"]=1,["b"]={["c"]="str"}}');
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

		test("mixedKeyTypes (default)", () => {
			expect(stringify({ "1": 1, a: 2 }, { pretty: false })).toEqual('{["1"]=1,["a"]=2}');
		});

		test("mixedKeyTypes (false)", () => {
			expect(stringify({ "1": 1, a: 2 }, { pretty: false, mixedKeyTypes: false })).toEqual('{["1"]=1,["a"]=2}');
		});

		test("mixedKeyTypes (true)", () => {
			expect(stringify({ "1": 1, a: 2 }, { pretty: false, mixedKeyTypes: true })).toEqual('{[1]=1,["a"]=2}');
		});

		test("nonPositiveIntegerKeys (default)", () => {
			expect(stringify({ "0": 1, "1": 2, "-1": 3, "3.14": 4 }, { pretty: false, mixedKeyTypes: true })).toEqual(
				'{["0"]=1,[1]=2,["-1"]=3,["3.14"]=4}'
			);
		});

		test("nonPositiveIntegerKeys (false)", () => {
			expect(
				stringify(
					{ "0": 1, "1": 2, "-1": 3, "3.14": 4 },
					{ pretty: false, mixedKeyTypes: true, nonPositiveIntegerKeys: false }
				)
			).toEqual('{["0"]=1,[1]=2,["-1"]=3,["3.14"]=4}');
		});

		test("nonPositiveIntegerKeys (true)", () => {
			expect(
				stringify(
					{ "0": 1, "1": 2, "-1": 3, "3.14": 4 },
					{ pretty: false, mixedKeyTypes: true, nonPositiveIntegerKeys: true }
				)
			).toEqual("{[0]=1,[1]=2,[-1]=3,[3.14]=4}");
		});
	});
});
