import { onSet } from "@qundus/qstate";
import type { Field, Form, FunctionProps } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";
import { processValue } from "../processors/value";

export function changeCycle<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
) {
	const { key, setup, options, store } = props;
	// do startup checks for input types like file
	//

	onSet(store, async (payload) => {
		// console.log("called :: ", key, " :: ", form.changed);
		const $next = payload.newValue;
		const internal = $next.__internal;
		const event = internal.event;
		const manualUpdate = internal.manual;
		const preprocessValue =
			internal.preprocess ?? options?.preprocessValues ?? (setup.preprocessValue as boolean);
		const update = internal.update;
		const vmcm: Field.VMCM = manualUpdate ? (options?.vmcm ?? setup?.vmcm ?? "normal") : "normal";
		const prev = store.value;

		// first fix key if it's not there
		// @ts-expect-error
		$next.__key = key;

		try {
			if (typeof setup?.onChange === "function") {
				await setup?.onChange?.({
					// form,
					// prevForm,
					setup,
					prev,
					$next,
				});
			} else {
				if (setup.onChange != null) {
					for (const processor of setup.onChange) {
						await processor?.({
							// form,
							// prevForm,
							setup,
							prev,
							$next,
						});
					}
				}
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
			const oldValue = store.value.value;
			const value = processValue(props, {
				$next,
				event,
				manualUpdate,
				preprocessValue,
				value: $next.value,
			});
			if (setup.validate != null) {
				if (!manualUpdate || (manualUpdate && vmcm === "normal")) {
					const validations = Array.isArray(setup.validate) ? setup.validate : [setup.validate];
					$next.errors = [];
					for (const validation of validations) {
						const err = validation({ value, prev });
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
					if ($next.errors.length <= 0) {
						$next.errors = undefined;
					}
				}
			}

			/////         PROCESS CONDITION         \\\\\
			if ($next.errors != null) {
				if ($next.condition.element.required) {
					$next.condition.value.error = "validation";
				} else {
					$next.condition.value.error = "optional";
				}
			} else {
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
			}

			// then update value if everything is ok
			if ($next.errors == null) {
				$next.value = value;
			} else {
				if (options?.preventErroredValues) {
					$next.value = oldValue;
				} else {
					$next.value = value;
				}
			}
		}
		//
	});
}
