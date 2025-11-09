import type { Field, Form, FunctionProps } from "../../_model";
import { isKeyInFormFields } from "../../form/checks/is-key-in-form-fields";
import { mergeFieldProps } from "../../methods/merge-field-props";

function getDeepPath(obj: any, _path: string) {
	const path = _path.split(".");
	const len = path.length;
	for (let i = 0; i < len; i++) {
		// @ts-ignore
		obj = obj[path[i]];
	}
	return obj;
}

export type FormAddonUpdate<F extends Form.Fields, O extends Form.Options<F>> = ReturnType<
	typeof formUpdateAddon<F, O>
>;
export function formUpdateAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormAddon<F, O>,
) {
	const { fields, options, store } = props;
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
				const field = fields[key as keyof typeof fields];
				const value = path == null ? values[key] : getDeepPath(values, path as string);
				field.update.value(value, { preprocess: configs?.preprocess });
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
			for (const key in conditions) {
				if (!isKeyInFormFields(fields, options, key)) {
					continue;
				}
				const field = fields[key];
				const condition = conditions[key];
				field.update.condition(condition);
			}
		},
		elements: <G extends Record<keyof F, Field.Element<any>>>(elements: G) => {
			if (elements == null) {
				return;
			}
			for (const key in elements) {
				if (!isKeyInFormFields(fields, options, key)) {
					continue;
				}
				const field = fields[key];
				const element = elements[key];
				field.update.element(element);
			}
		},
		elementsForAll: (element: Partial<Field.Element<any>>) => {
			if (element == null) {
				return;
			}
			for (const key in fields) {
				const field = fields[key];
				field.update.element(element);
			}
		},
		props: <G extends O["props"]>(props: Partial<G>) => {
			store.set({ ...store.get(), props });
			if (options == null || options.propsMergeStrategy === "none") {
				return;
			}
			for (const key in fields) {
				const field = fields[key];
				const fieldProps = field.store.value?.props;
				const next = mergeFieldProps(fieldProps, props, options?.propsMergeStrategy) as any;
				field.update.props(next);
			}
		},
	};
}
