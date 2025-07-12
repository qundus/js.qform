import type { FlatObject, NestedObject, UnflatObject } from "./_model";

export default function unflatten<T extends FlatObject<Record<string, unknown>>>(
	flat: T,
): UnflatObject<T> {
	const result: any = {};

	for (const [key, value] of Object.entries(flat)) {
		const parts = key.split(".");
		let current = result;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			if (i === parts.length - 1) {
				current[part] = value;
			} else {
				current[part] = current[part] || {};
				current = current[part];
			}
		}
	}

	return result;
}
