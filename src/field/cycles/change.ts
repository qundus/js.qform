import { onSet } from "@qundus/qstate";
import type { Addon, Field, Form, FunctionProps } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";
import { processValue } from "../processors/value";
import { CYCLE, DOM, MUTATE } from "../../const";

const REFRESH = "__REFRESH";
export function changeCycle<
	S extends Field.Setup,
	O extends Form.Options,
	G extends Form.Store<any, O>,
>(props: FunctionProps.Field<S, O>, formStore: G | undefined, update: Addon.FieldUpdate<S, O>) {
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
		// TODO: check if this is causing the radio to not update on some jumping back
		// and fouth between options too fast sometimes
		if ($next.__internal[REFRESH]) {
			delete $next.__internal[REFRESH];
			return $next;
		} else if ($next.event.CYCLE > CYCLE.CHANGE) {
			// console.log("current cycle :: ", $next.event.CYCLE);
			return $next;
		}
		const _DOM = $next.event.DOM;
		const _MUTATE = $next.event.MUTATE;
		const _CYCLE = $next.event.CYCLE;
		const MANUAL_UPDATE = $next.__internal.manual;
		const PREPROCESS_VALUE = ($next.__internal.preprocess ??
			$next.element.preprocessValue) as boolean;
		const VMCM = (MANUAL_UPDATE ? $next.element.vmcm : "normal") as Field.VMCM;
		const NO_VALIDATION = $next.__internal.noValidation ?? false;
		const SHOULD_VALIDATE =
			_MUTATE === MUTATE.VALUE ||
			_MUTATE === MUTATE.ELEMENT ||
			_DOM === DOM.CLICK_OPTION ||
			_MUTATE === MUTATE.EXTRAS;
		//
		const prev = store.value;
		const form = formStore?.get();
		const oldValue = store.value.value;

		// first reset necessaries
		$next.__internal.key = key;
		$next.__internal.preprocess = undefined;
		$next.__internal.manual = false;
		$next.__internal.noValidation = undefined;

		// pre user intervention
		if (!prev.element.focused && $next.element.focused) {
			$next.element.entered = true;
		} else {
			$next.element.entered = false;
		}

		if (prev.element.focused && !$next.element.focused) {
			$next.element.left = true;
		} else {
			$next.element.left = false;
		}

		if (SHOULD_VALIDATE) {
			$next.value = processValue(props, {
				$next,
				el: $next.event.ev,
				manualUpdate: MANUAL_UPDATE,
				preprocessValue: PREPROCESS_VALUE,
				value: $next.value,
			});
		}

		try {
			const onchangeprops = {
				form,
				setup,
				prev: prev as any,
				$next: $next as any,
				update: update as any,
				get DOM() {
					return DOM;
				},
				get MUTATE() {
					return MUTATE;
				},
				get CYCLE() {
					return CYCLE;
				},
			};
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
		if (SHOULD_VALIDATE && !NO_VALIDATION) {
			$next.errors = [];
			// first check for user validation functions
			if (setup.validate != null) {
				if (!MANUAL_UPDATE || (MANUAL_UPDATE && VMCM === "normal")) {
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
				if (VMCM === "force-valid") {
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
					$next.condition.by = MANUAL_UPDATE ? "manual" : "user";
				}

				// finally, set validity
				$next.condition.valid = false;
			}

			// we don't have errors
			if ($next.errors != null && $next.errors.length <= 0) {
				// process condition
				if ($next.element.disabled) {
					$next.condition.error = false;
				} else if ($next.element.required) {
					// check required status
					if (VMCM === "force-valid") {
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
				$next.condition.by = MANUAL_UPDATE ? "manual" : "user";

				// finally, set validity
				$next.condition.valid = $next.condition.error ? false : true;
			}
		}

		// for some reason the effect of the form doesn't run properly so i have to rerun it by aborting and sending
		// another store update
		payload.abort();
		$next.__internal[REFRESH] = true;
		store.set($next);
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
