import { onSet } from "@qundus/qstate";
import type { Addon, Field, Form, FunctionProps } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";
import { processValue } from "../processors/value";
import { FIELD_CYCLES } from "../../const";

const REFRESH = "__REFRESH";
export function changeCycle<
	S extends Field.Setup,
	O extends Form.Options,
	G extends Form.Store<any, O>,
>(props: FunctionProps.Field<S, O>, formStore: G | undefined, mark: Addon.FieldMark<S, O>) {
	const { key, setup, options, store } = props;
	// do startup checks for input types like file
	//
	// formStore?.listen((form) => {
	// 	const state = store.get();
	// 	if (form.status === "submit") {
	// 		if (state.cycle !== "submit") {
	// 			mark.cycle.submit();
	// 		}
	// 	} else {
	// 		if (state.cycle === "submit") {
	// 			mark.cycle.change();
	// 		}
	// 	}
	// });
	onSet(store, async (payload) => {
		const $next = payload.newValue;
		if ($next.__internal[REFRESH]) {
			delete $next.__internal[REFRESH];
			return $next;
		} else if (FIELD_CYCLES[$next.cycle] > FIELD_CYCLES.change) {
			return $next;
		}
		const internal = $next.__internal;
		const event = internal.event;
		const manualUpdate = internal.manual;
		const preprocessValue = (internal.preprocess ?? $next.element.preprocessValue) as boolean;
		const update = internal.update;
		const vmcm = (manualUpdate ? $next.element.vmcm : "normal") as Field.VMCM;
		const prev = store.value;
		const form = formStore?.get();
		const oldValue = store.value.value;

		// first fix key if it's not there
		// @ts-expect-error
		$next.__key = key;

		// pre user intervention
		if (update === "element.focus" || update === "element.blur") {
			const extras = $next.extras as Field.Extras<Field.Setup<"select">>;
			if (extras != null) {
				extras.showList = update === "element.focus";
			}
			$next.extras = extras as any;
		}
		if (update === "value" || update === "element.click.option" || update === "extras") {
			$next.value = processValue(props, {
				$next,
				event,
				manualUpdate,
				preprocessValue,
				value: $next.value,
			});
		}

		try {
			const onchangeprops = { form, setup, prev: prev as any, $next: $next as any, mark };
			if (typeof setup?.onChange === "function") {
				await setup?.onChange?.(onchangeprops);
			} else {
				if (setup.onChange != null) {
					for (const processor of setup.onChange) {
						await processor?.(onchangeprops);
					}
				}
			}
			// global onchange field if any
			if (options?.onFieldChange != null && typeof options?.onFieldChange === "function") {
				await options.onFieldChange(onchangeprops);
			}
		} catch (err: any) {
			console.error(
				`qform: fatal error occured in field.processState :: abort set to <${setup.onChangeException}> :: exception :: `,
				err,
			);
			if (setup.onChangeException) {
				payload.abort();
				return;
			}
		}

		// validate on update of type value
		if (update === "value") {
			$next.errors = [];
			// first check for user validation functions
			if (setup.validate != null) {
				if (!manualUpdate || (manualUpdate && vmcm === "normal")) {
					const validations = Array.isArray(setup.validate) ? setup.validate : [setup.validate];
					for (const validation of validations) {
						const err = validation({ value: $next.value, prev, form });
						if (Array.isArray(err)) {
							if (err.length < 0) {
								continue;
							}
							for (const error of err) {
								if (error != null) {
									$next.errors.push(error);
								}
							}
						} else {
							if (err != null) {
								$next.errors.push(err);
							}
						}
					}
					// if ($next.errors.length <= 0) {
					// 	$next.errors = undefined;
					// }
				}
			}

			/////         PROCESS CONDITION         \\\\\
			// we have errors
			if ($next.errors.length > 0) {
				// process condition
				if (vmcm === "force-valid") {
					$next.condition.error = false;
					$next.errors = undefined;
				} else if ($next.element.required) {
					$next.condition.error = "validation";
				} else {
					$next.condition.error = "optional";
				}

				// process value
				if (options?.preventErroredValues) {
					$next.value = oldValue;
				} else {
					$next.condition.updated = true;
					$next.condition.by = manualUpdate ? "manual" : "user";
				}

				// finally, set validity
				$next.condition.valid = false;
			}

			// we don't have errors
			// @ts-expect-error
			if ($next.errors.length <= 0) {
				// process condition
				if ($next.element.disabled) {
					$next.condition.error = false;
				} else if ($next.element.required) {
					// check required status
					if (vmcm === "force-valid") {
						$next.condition.error = false;
					} else {
						const incomplete = isFieldIncomplete($next.element, $next.value);
						$next.condition.error = incomplete ? "incomplete" : false;
					}
				} else {
					$next.condition.error = false;
				}

				// process value
				$next.errors = undefined;
				$next.condition.updated = true;
				$next.condition.by = manualUpdate ? "manual" : "user";

				// finally, set validity
				$next.condition.valid = $next.condition.error ? false : true;
			}
		}

		// for some reason the effect of the form doesn't run properly so i have to rerun it by aborting and sending
		// another store update
		payload.abort();
		store.set({
			...$next,
			__internal: {
				...$next.__internal,
				//@ts-expect-error
				[REFRESH]: true,
			},
		});
		return $next;

		// many to one store update could cause race condition, don't like it :(
		// if (form == null || formStore == null) {
		// 	return;
		// }
		// update form
		// const nextForm = { ...formStore.get() };
		// nextForm.conditions[key] = $next.condition;
		// nextForm.extras[key] = $next.extras;
		// nextForm.values[key] = $next.value;
		// formStore.set(nextForm);
	});
}
