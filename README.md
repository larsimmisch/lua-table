# lua-table

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
	- [stringify](#stringify)

Stringify data to a string containing a lua table

## Installation
`npm install @kilcekru/lua-table`

## Usage

```javascript
import { stringify } from "@kilcekru/lua-table";

const table = stringify({a: 1, b: "str"});

console.log(table);
/*
{
	["a"] = 1,
	["b"] = "str",
}
*/
```

## API

### stringify
```typescript
stringify(data: unknown): string;
```

Stringifies data to a lua-table.

Supported types of data:
- undefined
- null
- string
- number
- object (also nested)
- array (also nested)
- class instance (also nested)

Functions will be ignored and treated like undefined.  
Unsupported types (e.g. Date) will throw an Error.