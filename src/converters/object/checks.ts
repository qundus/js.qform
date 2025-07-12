export function isPlainObject(obj: unknown): obj is Record<string, unknown> {
	return (
		typeof obj === "object" &&
		obj !== null &&
		Object.prototype.toString.call(obj) === "[object Object]" &&
		!(obj instanceof Date) &&
		!Array.isArray(obj)
	);
}
