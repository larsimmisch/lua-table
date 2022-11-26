import { describe, expect, test } from "@jest/globals";

import { parse } from "../../src/parse";

describe("parse", () => {
	describe("errors", () => {
		test("undefined", () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(() => parse(undefined)).toThrow("Input ist not a string");
		});

		test("null", () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(() => parse(null)).toThrow("Input ist not a string");
		});

		test("invalid input", () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			expect(() => parse(5)).toThrow("Input ist not a string");
		});

		test("empty input", () => {
			expect(() => parse("")).toThrow("Received empty input");
		});

		test("only whitespace", () => {
			expect(() => parse("  \n\t")).toThrow("Unexpected end of input");
		});

		test("invalid input", () => {
			expect(() => parse('{["a"]-1}')).toThrow("Unexpected token '-' at position 6");
		});

		test("cut-off input", () => {
			expect(() => parse('{["a"]=1')).toThrow("Unexpected end of input");
		});
	});
});
