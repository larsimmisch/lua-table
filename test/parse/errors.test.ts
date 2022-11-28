import { describe, expect, test } from "@jest/globals";

import { parse } from "../../src/parse";

describe("parse", () => {
	describe("errors", () => {
		test("undefined", () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(() => parse(undefined)).toThrow(new Error("Input ist not a string"));
		});

		test("null", () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(() => parse(null)).toThrow(new Error("Input ist not a string"));
		});

		test("invalid input", () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(() => parse(5)).toThrow(new Error("Input ist not a string"));
		});

		test("empty input", () => {
			expect(() => parse("")).toThrow(new Error("Received empty input"));
		});

		test("only whitespace", () => {
			expect(() => parse("  \n\t")).toThrow(new Error("Unexpected end of input"));
		});

		test("invalid input", () => {
			expect(() => parse('{["a"]-1}')).toThrow(
				new Error(`Unexpected token '-' at position 6 (line 1:6) near '{["a"]-1}'`)
			);
		});

		test("cut-off input", () => {
			expect(() => parse('{["a"]=1')).toThrow(new Error("Unexpected end of input"));
		});
	});
});
