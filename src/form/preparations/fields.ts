import type { Form } from "../../_model";
import { createField } from "../../field";

export function prepareFields<
	I extends Form.FieldsIn,
	F extends Form.Fields<I>,
	O extends Form.Options<F> | undefined,
	G extends Form.Store<any, any>,
>(inn: I | undefined, options: O | undefined, formStore: G | undefined) {
	const fields = {} as F;
	for (const key in inn) {
		const fieldFactoryIn = inn[key];
		const field = createField(key, fieldFactoryIn, options, formStore);
		fields[key] = field as any;
	}
	return fields;
}
