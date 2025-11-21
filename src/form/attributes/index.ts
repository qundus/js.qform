import type { Form, FunctionProps } from "../../_model";

export function createAttributes<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormAddon<F, O>,
) {
	const { fields } = props;
	const result = {} as any;
	for (const key in fields) {
		const field = fields[key];
		Object.defineProperty(result, key, {
			get() {
				return field.store.get().attrs;
			},
		});
	}
	return result;
}
