const luaTable = require("..");

// const table = luaTable.stringify({
// 	str: "string",
// 	num: -123.456,
// 	arr: [1, 2, { entry: 3 }],
// 	obj: {
// 		a: 1,
// 		b: 2,
// 	},
// });

const table = luaTable.stringify({ a: 1, b: "str" });

console.log(table); // eslint-disable-line no-console
