import { describe, expect, test } from "@jest/globals";

import { parse } from "../../src/parse";

describe("parse", () => {
	describe("options", () => {
		test("booleanKeys (default)", () => {
			expect(() => parse("{[true]=1}")).toThrow(
				new Error("Unexpected token 't' at position 2 (line 1:2) near '{[true]=1}'")
			);
		});

		test("booleanKeys (false)", () => {
			expect(() => parse("{[true]=1}", { booleanKeys: false })).toThrow(
				new Error("Unexpected token 't' at position 2 (line 1:2) near '{[true]=1}'")
			);
		});

		test("booleanKeys (true)", () => {
			expect(parse("{[true]=1}", { booleanKeys: true })).toEqual({ true: 1 });
		});

		test("emptyTables (default)", () => {
			expect(parse("{}")).toEqual({});
		});

		test("emptyTables (object)", () => {
			expect(parse("{}", { emptyTables: "object" })).toEqual({});
		});

		test("emptyTables (array)", () => {
			expect(parse("{}", { emptyTables: "array" })).toEqual([]);
		});

		test("mixedKeyTypes (default)", () => {
			expect(() => parse('{[1]=1,["a"]=2}')).toThrow(
				new Error("Encountered table mith mixed key types and options.mixedKeyTypes is not true")
			);
		});

		test("mixedKeyTypes (false)", () => {
			expect(() => parse('{[1]=1,["a"]=2}', { mixedKeyTypes: false })).toThrow(
				new Error("Encountered table mith mixed key types and options.mixedKeyTypes is not true")
			);
		});

		test("mixedKeyTypes (true)", () => {
			expect(parse('{[1]=1,["a"]=2}', { mixedKeyTypes: true })).toEqual({ "1": 1, a: 2 });
		});

		test("nonPositiveIntegerKeys - 0 (default)", () => {
			expect(() => parse("{[0]=1}")).toThrow(
				new Error(
					"Encountered numeric key which is not a positive integer and options.nonPositiveIntegerKeys is not true"
				)
			);
		});

		test("nonPositiveIntegerKeys - 0 (false)", () => {
			expect(() => parse("{[0]=1}", { nonPositiveIntegerKeys: false })).toThrow(
				new Error(
					"Encountered numeric key which is not a positive integer and options.nonPositiveIntegerKeys is not true"
				)
			);
		});

		test("nonPositiveIntegerKeys - 0 (true)", () => {
			expect(parse("{[0]=1}", { nonPositiveIntegerKeys: true })).toEqual({ "0": 1 });
		});

		test("nonPositiveIntegerKeys - float (default)", () => {
			expect(() => parse("{[1.23]=1}")).toThrow(
				new Error(
					"Encountered numeric key which is not a positive integer and options.nonPositiveIntegerKeys is not true"
				)
			);
		});

		test("nonPositiveIntegerKeys - float (false)", () => {
			expect(() => parse("{[1.23]=1}", { nonPositiveIntegerKeys: false })).toThrow(
				new Error(
					"Encountered numeric key which is not a positive integer and options.nonPositiveIntegerKeys is not true"
				)
			);
		});

		test("nonPositiveIntegerKeys - float (true)", () => {
			expect(parse("{[1.23]=1}", { nonPositiveIntegerKeys: true })).toEqual({ "1.23": 1 });
		});

		test("sparseArray (default)", () => {
			expect(parse("{1, [3]=2}")).toEqual([1, undefined, 2]);
		});

		test("sparseArray (false)", () => {
			expect(() => parse("{1, [3]=2}", { sparseArray: false })).toThrow(
				new Error("Encountered sparse array and options.sparseArray is false")
			);
		});

		test("sparseArray (true)", () => {
			expect(parse("{1, [3]=2}", { sparseArray: true })).toEqual([1, undefined, 2]);
		});
	});
});
