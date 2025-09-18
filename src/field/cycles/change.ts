import { onSet } from "@qundus/qstate";
import type { Field, Form } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";

export function changeCycle<S extends Field.Setup, O extends Form.Options<any>>(
	key: string,
	setup: S,
	options: O | undefined,
	formActions: Form.StoreObject<Form.Fields<any>> | undefined,
	state: Field.Store<S, O>,
) {
	// do startup checks for input types like file
	//

	onSet(state, async (payload) => {
		// console.log("called :: ", key, " :: ", form.changed);
		const $next = payload.newValue;
		const internal = $next.__internal;
		const manualUpdate = internal.manual;
		const preprocess = internal.preprocess ?? options?.preprocessValues ?? setup?.preprocessValue;
		const update = internal.update;
		const vmcm: Field.VMCM = manualUpdate ? (options?.vmcm ?? setup?.vmcm ?? "normal") : "normal";

		const prev = state.value;
		try {
			await setup?.processState?.({
				// form,
				// prevForm,
				prev,
				$next,
			});
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
			const value = asd;
			if (setup.validate != null) {
				if (!manualUpdate || (manualUpdate && vmcm === "normal")) {
					const validations = Array.isArray(setup.validate) ? setup.validate : [setup.validate];
					$next.errors = [];
					for (const validation of validations) {
						const err = validation({ value: $next.value, prev });
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
			if (options.preventErroredValues) {
				if ($next.errors == null) {
					$store.setKey(`values[${key}]`, $next.value);
				}
			} else {
				$store.setKey(`values[${key}]`, $next.value);
			}
		}
	});
}
