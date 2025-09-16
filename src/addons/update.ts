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
	const { fields, $store, options } = props;
	return {
		values: <G extends Object>(
			values: G,
			paths?: Record<string, string | { value: string; key?: string }>,
		) => {
			if (values == null) {
				return;
			}
			$store.update(({ $next }) => {
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
					const field = fields[key as keyof typeof fields] as Field.Options<Field.Type>;
					const value = path == null ? values[key] : getDeepPath(values, path as string);
					valueInteraction(
						{
							key,
							field,
							options,
							$store,
						},
						{
							$form: $next,
							event: null,
							value,
						},
						{
							manualUpdate: true,
							preprocessValue: options?.preprocessValues ?? field.preprocessValue,
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
				return $next;
			});
		},
		conditions: <G extends Record<keyof F, Partial<Field.Condition>>>(conditions: G) => {
			if (conditions == null) {
				return;
			}
			$store.update(({ $next }) => {
				for (const key in conditions) {
					const condition = conditions[key];
					if (!isKeyInFormFields(fields, options, key) || condition == null) {
						continue;
					}
					$next.conditions[key] = mergeFieldConditions($next.conditions[key], condition);
				}
				return $next;
			});
		},
	};
}

// updateValues: (values) => {
// 	//
// 	if (typeof values === "undefined") {
// 		return;
// 	}
// 	const $form = { ...$store.get() };
// 	for (const key in values) {
// 		const value = values[key];
// 		const field = fields[key as keyof typeof fields] as Field.Options;
// 		if (!isKeyInFormFields(fields, options, key)) {
// 			continue;
// 		}
// 		const preprocessValue = options.preprocessValues ?? field.preprocessValue;
// 		valueInteraction(
// 			{
// 				key,
// 				field,
// 				options,
// 				$store: $store as any,
// 			},
// 			{
// 				$form,
// 				value,
// 				event: null,
// 			},
// 			{ manualUpdate: true, preprocessValue },
// 		);
// 	}
// 	$store.set($form);
// },
