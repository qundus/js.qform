import type { Form } from "../../_model";
import { createField } from "../../field";

export function prepareFields<
	I extends Form.FieldsIn,
	F extends Form.Fields<I>,
	O extends Form.Options<F> | undefined,
>(inn: I | undefined, options: O | undefined) {
	const fields = {} as F;
	for (const key in inn) {
		const fieldFactoryIn = inn[key];
		const field = createField(key, fieldFactoryIn, options);
		fields[key] = field as any;
	}
	return fields;
}
