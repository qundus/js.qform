import type { Form } from "../../_model";

const PROCESSED = "__PROCESSED";
export function prepareOptions<O extends Form.Options>(options?: O) {
	if (options?.[PROCESSED]) {
		return options;
	}
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
	result.onFieldElementOrder = result.onFieldElementOrder ?? "after";
	result.flatObjectKeysChar = ".";
	result.flatLabelJoinChar = result.flatLabelJoinChar ?? " ";
	result.abortOnChangeException = result.abortOnChangeException ?? false;
	result.propsMergeStrategy = result.propsMergeStrategy ?? "none";

	// mark processed
	result[PROCESSED] = true;
	return result;
}
