export function isFunction(data: unknown) {
	return Object.prototype.toString.call(data) === "[object Function]";
}

export function isObject(data: unknown) {
	return Object.prototype.toString.call(data) === "[object Object]";
}

export function isPlainObject(data: unknown): data is Record<string, unknown> {
	if (data == undefined || !isObject(data)) {
		return false;
	}
	if (data.constructor === undefined) {
		return true;
	}
	if (!isObject(data.constructor.prototype)) {
		return false;
	}
	return true;
}
