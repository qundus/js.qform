import type { Field, Form, FunctionProps } from "../_model";
import { isFieldIncomplete } from "../field/checks/is-field-incomplete";
import { processValue } from "./processors/value";

export function valueInteraction<S extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<S, O>,
	interaction: FunctionProps.Interaction<S, O>,
	processor: FunctionProps.Processor<S, O>,
) {
	const { key, field, options } = basic;
	const { $form, event } = interaction;

	// override any if undefined
	processor.manualUpdate = processor.manualUpdate ?? event == null;
	processor.preprocessValue = processor.preprocessValue ?? basic.field.preprocessValue;

	// logic
	const manualUpdate = processor.manualUpdate;
	const vmcm: Field.VMCM = manualUpdate ? (options.vmcm ?? field.vmcm ?? "normal") : "normal";
	const condition = $form.conditions[key];
	const value = processValue(basic, interaction, processor);
	// start by notifying modified
	$form.conditions[key].value.updated = true;
	$form.conditions[key].value.lastUpdate = manualUpdate ? "manual" : "user";

	// start by validating values.
	let validation_errors = null as string[] | null;
	if (field.validate != null) {
		if (!manualUpdate || (manualUpdate && vmcm === "normal")) {
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
				const incomplete = isFieldIncomplete(field, condition, value);
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
