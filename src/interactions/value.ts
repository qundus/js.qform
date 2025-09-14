import type { Field, FieldVMCM, FormStore, InteractionProps, Options } from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import processValue from "./on-value-process";

type Props<S extends Field, O extends Options<any>> = InteractionProps<S, O>;
export function valueInteraction<S extends Field, O extends Options<any>>(props: Props<S, O>) {
	const { key, field, options, $form, event } = props;
	const manual_update = event == null;
	const vmcm: FieldVMCM = manual_update ? (options.vmcm ?? field.vmcm ?? "normal") : "normal";
	const condition = $form.conditions[key];
	const value = processValue(props);
	// start by notifying modified
	$form.conditions[key].value.updated = true;
	$form.conditions[key].value.lastUpdate = manual_update ? "manual" : "user";

	// start by validating values.
	let validation_errors = null as string[] | null;
	if (field.validate != null) {
		if (!manual_update || (manual_update && vmcm === "normal")) {
			validation_errors = [];
			const validations = Array.isArray(field.validate) ? field.validate : [field.validate];
			for (const validation of validations) {
				const err = validation(value, { $values: $form.values });
				if (Array.isArray(err)) {
					if (err.length < 0) {
						continue;
					}
					for (const error of err) {
						if (error != null) {
							validation_errors.push(error);
						}
					}
				} else {
					if (err != null) {
						validation_errors.push(err);
					}
				}
			}
			if (validation_errors.length <= 0) {
				validation_errors = null;
			}
		}
	}
	/////         KEEP ORDER            \\\\\
	if (validation_errors != null) {
		$form.errors = { ...$form.errors, [key]: validation_errors };
	} else {
		if ($form.errors != null && key in $form.errors) {
			// check if key exist before
			delete $form.errors[key];
		}
	}
	// process value condition
	if (validation_errors != null) {
		if (condition.element.required) {
			condition.value.error = "validation";
		} else {
			condition.value.error = "optional";
		}
	} else {
		if (condition.element.disabled) {
			condition.value.error = false;
		} else if (condition.element.required) {
			// check required status
			if (vmcm === "force-valid") {
				condition.value.error = false;
			} else {
				const incomplete = isFieldIncomplete({ value, condition, field });
				condition.value.error = incomplete ? "incomplete" : false;
			}
		} else {
			condition.value.error = false;
		}
	}
	//
	if (options.preventErroredValues) {
		if (validation_errors == null) {
			$form.values[key] = value;
		}
	} else {
		$form.values[key] = value;
	}
}
