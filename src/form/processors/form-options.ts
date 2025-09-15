import type { Form } from "../../_model";

export function processFormOptions<F extends Form.Fields, O extends Form.Options<F>>(options?: O) {
	const result = { ...options };
	result.vmcm = result.vmcm ?? "normal";
	result.preventErroredValues = result.preventErroredValues ?? false;
	result.allFieldsRequired = result.allFieldsRequired ?? true;
	result.allFieldsDisabled = result.allFieldsDisabled ?? false;
	result.preprocessValues = result.preprocessValues ?? true;
	result.onUpdateKeyNotFound = result.onUpdateKeyNotFound ?? "silent";
	// result.incompleteBehavior =
	// 	result.incompleteBehavior === true
	// 		? ["onblur", "onsubmit"]
	// 		: (result.incompleteBehavior ?? ["onblur", "onsubmit"]);
	result.incompleteListCount = result.incompleteListCount ?? false;
	// result.incompleteAffectsCondition = result.incompleteAffectsCondition ?? false;
	result.validateOn = result.validateOn ?? "input";
	result.processElementOrder = result.processElementOrder ?? "after";
	result.flatObjectKeysChar = ".";
	result.flatLabelJoinChar = result.flatLabelJoinChar ?? " ";
	return result;
}
