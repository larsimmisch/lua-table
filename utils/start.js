const luaTable = require("..");

const res = luaTable.stringify({
	str: 'str"ing',
	num: -123.456,
	arr: [1, 2, { entry: 3 }],
	obj: {
		a: 1,
		b: 2,
	},
});

// const data = `{1, 2}`;
// const res = luaTable.parse(data, { sparseArray: false });

console.log(res); // eslint-disable-line no-console
