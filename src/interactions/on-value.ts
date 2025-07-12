import type * as _MODEL from "../_model";
import isFieldIncomplete from "../checks/is-field-incomplete";
import processValue from "./on-value-process";

export default function onValueInteraction<S extends _MODEL.Field>(
	props: _MODEL.InteractionProps<S>,
) {
	const { key, field, options, $next, event } = props;
	const manual_update = event == null;
	const vmcm: _MODEL.FieldVMCM = manual_update ? (options.vmcm ?? field.vmcm) : "normal";
	const condition = $next.conditions[key];
	const value = processValue(props);
	// start by notifying modified
	$next.conditions[key].value.updated = true;
	$next.conditions[key].value.lastUpdate = manual_update ? "manual" : "user";

	// start by validating values.
	let validation_errors = null as string[];
	if (field.validate != null) {
		if (!manual_update || (manual_update && vmcm === "normal")) {
			validation_errors = [];
			const validations = Array.isArray(field.validate) ? field.validate : [field.validate];
			for (const validation of validations) {
				const err = validation(value, { $values: $next.values });
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
		$next.errors = { ...$next.errors, [key]: validation_errors };
	} else {
		if ($next.errors != null && key in $next.errors) {
			// check if key exist before
			delete $next.errors[key];
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
			$next.values[key] = value;
		}
	} else {
		$next.values[key] = value;
	}
}
