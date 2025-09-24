import { atom } from "@qundus/qstate";
import type { Field, Form } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";
import { IGNORED_SETUP_KEYS } from "../../const";

// TODO: atom store may become inconsistent with onchange function
// find another way to do it!
export function prepareInit<S extends Field.Setup, O extends Form.Options>(
	key: string,
	setup: S,
	options: O | undefined,
) {
	// initialize
	const init: Field.StoreObject<S> = {
		__key: key,
		__internal: {
			update: undefined,
			manual: false,
			preprocess: true,
			event: undefined,
		},
		cycle: "init",
		value: setup.value,
		props: setup.props,
		errors: undefined,
		extras: undefined,
		condition: {
			valid: true,
			error: false,
			updated: false,
			by: false,
		},
		element: {
			focused: false,
			visited: false,
		},
	};

	// setup element
	for (const key in setup) {
		if (key in IGNORED_SETUP_KEYS) {
			continue;
		}
		// @ts-expect-error
		init.element[key] = setup[key];
	}

	//
	if (!init.element.hidden) {
		const incomplete = isFieldIncomplete(init.element, setup.value);
		if (incomplete) {
			init.condition.valid = false;
			// init.condition.error = "incomplete"; // TODO: make this an config option
			// console.log("cc :: ", key, " :: ", JSON.stringify(condition));
		}

		if (setup.value != null) {
			if (setup.type === "file") {
				if (
					!(
						setup.value instanceof File ||
						(Array.isArray(setup.value) && setup.value.length > 0 && setup.value[0] instanceof File)
					)
				) {
					init.condition.valid = false;
				}
			}
		}
	}

	return init;
}
