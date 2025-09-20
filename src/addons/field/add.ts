import type { Field, Form, FunctionProps } from "../../_model";

export type FieldAddonAdd<_S extends Field.Setup, _O extends Form.Options> = {
	validation(): (func: Field.Validate) => (() => void) | null;
};
export function fieldAddAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonAdd<S, O> {
	const { setup } = props;
	return {
		validation() {
			return (func: Field.Validate) => {
				if (func == null || typeof func !== "function") {
					return null;
				}
				let idx = null as number | null;
				if (setup.validate == null) {
					setup.validate = func;
				} else if (Array.isArray(setup.validate)) {
					idx = setup.validate.push(func);
					idx--;
				} else {
					setup.validate = [setup.validate, func];
					idx = 1;
				}
				return () => {
					if (typeof setup.validate === "function") {
						setup.validate = null;
					} else {
						if (setup.validate != null) {
							setup.validate = setup.validate.filter((_item, index) => index !== idx);
							if (setup.validate.length <= 0) {
								setup.validate = null;
							}
						}
					}
				};
			};
		},
	};
}
