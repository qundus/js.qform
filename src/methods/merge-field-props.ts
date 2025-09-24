import { Field, type Form } from "../_model";

export function mergeFieldProps<P extends Record<string, any>, S extends Record<string, any>>(
	fieldProps: S | undefined,
	formProps: P | undefined,
	_strat: Form.Options<any>["propsMergeStrategy"] | undefined,
) {
	const strat = _strat ?? "none";
	if (formProps == null && fieldProps == null) {
		return null;
	}
	if (strat === "none") {
		return fieldProps;
	}
	if (strat === "form-override") {
		return {
			...fieldProps,
			...formProps,
		};
	}
	return {
		...formProps,
		...fieldProps,
	};
}
