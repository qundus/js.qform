import type { Field, FieldCondition, FieldType, Fields, PluginProps } from "../_model";
import isKeyInFields from "../checks/is-key-in-fields";
import onValue from "../interactions/on-value";
import getFormValues from "../methods/get-form-values";
import mergeConditions from "../methods/merge-conditions";

function getDeepPath(obj: any, _path: string) {
	const path = _path.split(".");
	const len = path.length;
	for (let i = 0; i < len; i++) {
		obj = obj[path[i]];
	}
	return obj;
}
export default function formActions<F extends Fields>(props: PluginProps<F>) {
	const { fields, $state, options } = props;
	function canSubmit() {
		const status = $state.get().status;
		if (status === "submit") {
			return false;
		}
		return status === "valid"; //|| status === "submitting";
	}

	return {
		...getFormValues(props),
		canSubmit,
		startSubmitting: () => {
			if (!canSubmit()) {
				return;
			}
			$state.update((next) => {
				next.status = "submit";
				return next;
			});
			return () => {
				if ($state.get().status !== "submit") {
					return;
				}
				$state.update((next) => {
					next.status = "valid";
					return next;
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
				$state.update((next) => {
					next.status = "submit";
					return next;
				});
				await runner?.();
			} catch (e: any) {
				error?.(e);
			} finally {
				$state.update((next) => {
					next.status = "valid";
					return next;
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
			$state.update((next) => {
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
					if (!isKeyInFields(fields, key, options)) {
						continue;
					}
					const field = fields[key as keyof typeof fields] as Field<FieldType>;
					const value = path == null ? values[key] : getDeepPath(values, path as string);
					onValue({
						key,
						field,
						options,
						$state,
						$next: next,
						event: null,
						value,
					});
					// TODO: check if vanilla elements are updating properly
					// if (typeof document !== "undefined") {
					// 	const el = document.getElementsByName(key);
					// 	if (el != null) {
					// 		// el.value = next.values[key];
					// 	}
					// }
				}
				return next;
			});
		},
		updateConditions: <G extends Record<keyof F, Partial<FieldCondition>>>(conditions: G) => {
			if (conditions == null) {
				return;
			}
			$state.update(($next) => {
				for (const key in conditions) {
					const condition = conditions[key];
					if (!isKeyInFields(fields, key, options) || condition == null) {
						continue;
					}
					$next.conditions[key] = mergeConditions($next.conditions[key], condition);
				}
				return $next;
			});
		},
	};
}
