import type { FlatObject, NestedObject } from "./_model";
import { isPlainObject } from "./checks";

export default function flattenObject<T extends NestedObject>(obj: T): FlatObject<T> {
	const result: Record<string, unknown> = {};

	const flatten = (current: unknown, path: string[] = []) => {
		if (isPlainObject(current)) {
			for (const key in current) {
				if (Object.hasOwn(current, key)) {
					// if (Object.prototype.hasOwnProperty.call(current, key)) {
					flatten(current[key], [...path, key]);
				}
			}
		} else if (path.length > 0) {
			result[path.join(".")] = current;
		}
	};

	flatten(obj);
	return result as FlatObject<T>;
}
