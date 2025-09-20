import { onSet } from "@qundus/qstate";
import type { Field, Form, FunctionProps } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";
import { processValue } from "../processors/value";

export function changeCycle<
	S extends Field.Setup,
	O extends Form.Options,
	G extends Form.Store<any, O>,
>(props: FunctionProps.Field<S, O>, formStore: G | undefined) {
	const { key, setup, options, store } = props;
	// do startup checks for input types like file
	//
	const REFRESH = "__REFRESH";
	onSet(store, async (payload) => {
		// console.log("called :: ", key, " :: ", form.changed);
		const $next = payload.newValue;
		if ($next.__internal[REFRESH]) {
			delete $next.__internal[REFRESH];
			return $next;
		}
		const internal = $next.__internal;
		const event = internal.event;
		const manualUpdate = internal.manual;
		const preprocessValue =
			internal.preprocess ?? options?.preprocessValues ?? (setup.preprocessValue as boolean);
		const update = internal.update;
		const vmcm: Field.VMCM = manualUpdate ? (options?.vmcm ?? setup?.vmcm ?? "normal") : "normal";
		const prev = store.value;
		const form = formStore?.get();
		const oldValue = store.value.value;

		// first fix key if it's not there
		// @ts-expect-error
		$next.__key = key;

		// pre developer intervention
		if (update === "value") {
			$next.value = processValue(props, {
				$next,
				event,
				manualUpdate,
				preprocessValue,
				value: $next.value,
			});
		}

		try {
			if (typeof setup?.onChange === "function") {
				await setup?.onChange?.({
					// prevForm,
					form,
					setup,
					prev,
					$next,
				});
			} else {
				if (setup.onChange != null) {
					for (const processor of setup.onChange) {
						await processor?.({
							// prevForm,
							form,
							setup,
							prev,
							$next,
						});
					}
				}
			}
			// global onchange field if any
			if (options?.onChangeField != null && typeof options?.onChangeField === "function") {
				await options.onChangeField({
					form,
					setup,
					prev,
					$next,
				});
			}
		} catch (err: any) {
			console.error(
				`qform: fatal error occured in field.processState :: abort set to <${setup.abortProcessStateException}> :: exception :: `,
				err,
			);
			if (setup.abortProcessStateException) {
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
					$next.condition.value.error = false;
					$next.errors = undefined;
				} else if ($next.condition.element.required) {
					$next.condition.value.error = "validation";
				} else {
					$next.condition.value.error = "optional";
				}

				// process value
				if (options?.preventErroredValues) {
					$next.value = oldValue;
				} else {
					$next.condition.value.updated = true;
					$next.condition.value.lastUpdate = manualUpdate ? "manual" : "user";
				}

				// finally, set validity
				$next.condition.valid = false;
			}

			// we don't have errors
			// @ts-expect-error
			if ($next.errors.length <= 0) {
				// process condition
				if ($next.condition.element.disabled) {
					$next.condition.value.error = false;
				} else if ($next.condition.element.required) {
					// check required status
					if (vmcm === "force-valid") {
						$next.condition.value.error = false;
					} else {
						const incomplete = isFieldIncomplete(setup, $next.condition, $next.value);
						$next.condition.value.error = incomplete ? "incomplete" : false;
					}
				} else {
					$next.condition.value.error = false;
				}

				// process value
				$next.errors = undefined;
				$next.condition.value.updated = true;
				$next.condition.value.lastUpdate = manualUpdate ? "manual" : "user";

				// finally, set validity
				$next.condition.valid = $next.condition.value.error ? false : true;
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
