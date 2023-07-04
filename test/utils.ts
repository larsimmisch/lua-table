import { readFileSync } from "fs";
import * as Path from "path";

export function fromFile(name: string) {
	return readFileSync(Path.join(__dirname, "data", `${name}.txt`), "utf-8");
}
