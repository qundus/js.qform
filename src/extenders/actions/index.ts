import type { Field, Form, FunctionProps } from "../../_model";
import { isKeyInFormFields } from "../../form/checks/is-key-in-form-fields";
import { valueInteraction } from "../../interactions/value";
import { valuesGetters } from "./values-getters";
import { mergeFieldConditions } from "../../methods/merge-field-conditions";

function getDeepPath(obj: any, _path: string) {
	const path = _path.split(".");
	const len = path.length;
	for (let i = 0; i < len; i++) {
		// @ts-ignore
		obj = obj[path[i]];
	}
	return obj;
}

export type ExtenderFormActions<F extends Form.Fields, O extends Form.Options<F>> = ReturnType<
	typeof formActionsExtender<F, O>
>;
export function formActionsExtender<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.Extender<F, O>,
) {
	const { fields, $store, options } = props;
	function canSubmit() {
		const status = $store.get().status;
		if (status === "submit") {
			return false;
		}
		return status === "valid"; // || status === "submitting";
	}

	return {
		...valuesGetters(props),
		canSubmit,
		startSubmitting: () => {
			if (!canSubmit()) {
				return null;
			}
			$store.update(({ $next }) => {
				$next.status = "submit";
				return $next;
			});
			return () => {
				if ($store.get().status !== "submit") {
					return;
				}
				$store.update(({ $next }) => {
					$next.status = "valid";
					return $next;
				});
			};
		},
		submit: async (props: {
			runner: () => Promise<void>;
			// submitOptions?: SubmitOptions;
			cannotSubmit?: <G>() => void;
			error?: <G>(e: G) => void;
		}) => {
			const { runner, cannotSubmit, error } = props;
			if (!canSubmit()) {
				// console.log("form: cannot submit form!");
				cannotSubmit?.();
				return;
			}
			try {
				$store.update(({ $next }) => {
					$next.status = "submit";
					return $next;
				});
				await runner?.();
			} catch (e: any) {
				error?.(e);
			} finally {
				$store.update(({ $next }) => {
					$next.status = "valid";
					return $next;
				});
			}
		},
		updateValues: <G extends Object>(
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
		updateConditions: <G extends Record<keyof F, Partial<Field.Condition>>>(conditions: G) => {
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
