import type { Form } from "../../_model";

export function isKeyInFormFields<F extends Form.Fields, O extends Form.Options<F>>(
	fields: F,
	options: O,
	key: string | keyof F,
) {
	if (!(key in fields)) {
		if (options.onUpdateKeyNotFound === "warn") {
			console.warn("form: key ", key, " was not found in form keys!");
		}
		return false;
	}
	return true;
}
