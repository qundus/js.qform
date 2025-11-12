import { onNotify, onSet } from "@qundus/qstate";
import type { Addon, Field, Form, FunctionProps } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";
import { processValue } from "../processors/value";
import { FIELD } from "../../const";

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
		// console.log("changed state :: ", key, " :: ", $next.event.CYCLE);
		// TODO: check if this is causing the radio to not update on some jumping back
		// and fouth between options too fast sometimes
		if ($next.__internal[REFRESH]) {
			delete $next.__internal[REFRESH];
			return $next;
		} else if ($next.event.CYCLE > FIELD.CYCLE.IDLE) {
			// console.log("current cycle :: ", $next.event.CYCLE);
			return $next;
		}
		const _DOM = $next.event.DOM;
		const _MUTATE = $next.event.MUTATE;
		// const _CYCLE = $next.event.CYCLE;
		const MANUAL_UPDATE = $next.__internal.manual;
		const PREPROCESS_VALUE = ($next.__internal.preprocess ??
			$next.element.preprocessValue) as boolean;
		const VMCM = (MANUAL_UPDATE ? $next.element.vmcm : "normal") as Field.VMCM;
		const MANUAL_VALIDATE = $next.__internal.validate ?? true;
		const SSR = setup.ssr;
		const SHOULD_VALIDATE =
			_MUTATE === FIELD.MUTATE.VALUE ||
			_MUTATE === FIELD.MUTATE.ELEMENT ||
			_DOM === FIELD.DOM.CLICK_OPTION ||
			_DOM === FIELD.DOM.CLICK_DATE_CELL ||
			_MUTATE === FIELD.MUTATE.EXTRAS ||
			_MUTATE === FIELD.MUTATE.__EXTRAS;
		//
		const prev = store.value;
		const form = formStore?.get();
		const oldValue = store.value.value;

		// first reset necessaries
		$next.__internal.key = key;
		$next.__internal.preprocess = undefined;
		$next.__internal.manual = false;
		$next.__internal.validate = undefined;

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
			// console.log("processing updated value :: ", $next.value);
		}

		try {
			const onchangeprops = {
				form,
				setup,
				prev: prev as any,
				$next: $next as any,
				update: update as any,
				SSR: SSR as any,
			};
			// global onchange field if any
			if (options?.fieldsOnChange != null && typeof options?.fieldsOnChange === "function") {
				await options.fieldsOnChange(onchangeprops);
			}
			if (typeof setup?.onChange === "function") {
				await setup?.onChange?.(onchangeprops);
			} else {
				if (setup.onChange != null) {
					for (const processor of setup.onChange) {
						await processor?.(onchangeprops);
					}
				}
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
		if (
			SHOULD_VALIDATE &&
			MANUAL_VALIDATE &&
			$next.event.MUTATE !== FIELD.MUTATE.__ABORT_VALIDATION
		) {
			$next.errors = [];
			// first check for user validation functions
			if (setup.validate != null) {
				if (!MANUAL_UPDATE || (MANUAL_UPDATE && VMCM === "normal")) {
					const validations = Array.isArray(setup.validate) ? setup.validate : [setup.validate];
					for (const validation of validations) {
						const err = validation({ prev, form, value: $next.value, extras: $next.extras });
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
						const incomplete = isFieldIncomplete($next.value, $next);
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
		// payload.abort();
		// $next.__internal[REFRESH] = true;
		// store.set($next);
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

	// onNotify(store, (value) => {
	// 	console.log("notifying :: ", key,  " :: ", value.);
	// });
}
