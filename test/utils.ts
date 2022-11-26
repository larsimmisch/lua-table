import { readFileSync } from "node:fs";
import * as Path from "node:path";

export function fromFile(name: string) {
	return readFileSync(Path.join(__dirname, "data", `${name}.txt`), "utf-8");
}
