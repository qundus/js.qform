import type { Field, Form, FunctionProps } from "../_model";
import { isKeyInFormFields } from "../form/checks/is-key-in-form-fields";
import { valueInteraction } from "../interactions/value";
import { mergeFieldConditions } from "../methods/merge-field-conditions";

function getDeepPath(obj: any, _path: string) {
	const path = _path.split(".");
	const len = path.length;
	for (let i = 0; i < len; i++) {
		// @ts-ignore
		obj = obj[path[i]];
	}
	return obj;
}

export type AddonUpdate<F extends Form.Fields, O extends Form.Options<F>> = {
	update: ReturnType<typeof updateAddon<F, O>>;
};
export function updateAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.Addon<F, O>,
) {
	const { setups: fields, $store, options } = props;
	return {
		values: <G extends Object>(
			values: G,
			paths?: Record<string, string | { value: string; key?: string }>,
			configs?: { preprocess?: boolean },
		) => {
			if (values == null) {
				return;
			}
			// const form = $store.get();
			for (const _key in values) {
				let path = paths?.[_key];
				let key = _key;
				if (path != null) {
					if (typeof path !== "string") {
						// @ts-ignore
						key = (path.key ?? _key) as string;
						path = path.value;
					}
				}
				if (!isKeyInFormFields(fields, options, key)) {
					continue;
				}
				const field = fields[key as keyof typeof fields] as Field.Setup<Field.Type>;
				const value = path == null ? values[key] : getDeepPath(values, path as string);
				const preprocessValue =
					configs?.preprocess ?? options?.preprocessValues ?? field.preprocessValue;
				valueInteraction(
					{
						key,
						setup: field,
						options,
						$store,
					},
					{
						event: null,
						value,
					},
					{
						preprocessValue,
						manualUpdate: true,
					},
				);
				// TODO: check if vanilla elements are updating properly
				// if (typeof document !== "undefined") {
				// 	const el = document.getElementsByName(key);
				// 	if (el != null) {
				// 		// el.value = next.values[key];
				// 	}
				// }
			}
		},
		conditions: <G extends Record<keyof F, Partial<Field.Condition>>>(conditions: G) => {
			if (conditions == null) {
				return;
			}
			const form = $store.get();
			for (const key in conditions) {
				const prevCondition = form.conditions[key];
				const userCondition = conditions[key];
				if (!isKeyInFormFields(fields, options, key) || userCondition == null) {
					continue;
				}
				const next = mergeFieldConditions(prevCondition, userCondition);
				$store.setKey(`conditions[${key}]`, next as any);
			}
		},
	};
}
