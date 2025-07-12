import type { Fields, Options } from "../_model";

export default function isKeyInFields<F extends Fields>(
	fields: F,
	key: string | keyof F,
	options: Options<F>,
) {
	if (!(key in fields)) {
		if (options.onUpdateKeyNotFound === "warn") {
			console.warn("form: key ", key, " was not found in form keys!");
		}
		return false;
	}
	return true;
}
