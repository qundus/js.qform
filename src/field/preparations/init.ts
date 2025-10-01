import type { Field, Form, FunctionProps } from "../../_model";
import { isFieldIncomplete } from "../checks/is-field-incomplete";
import { IGNORED_SETUP_KEYS, CYCLE, DOM, MUTATE } from "../../const";
import { processValue } from "../processors/value";

// TODO: atom store may become inconsistent with onchange function
// find another way to do it!
export function prepareInit<S extends Field.Setup, O extends Form.Options>(
	key: string,
	setup: S,
	options: O | undefined,
	store: Field.Store<S, O>,
): Field.StoreObject<S> {
	// initialize
	const fieldProps = { key, setup, store, options };
	const init: Field.StoreObject<S> = {
		__internal: {
			key: key,
			manual: false,
			preprocess: true,
		},
		event: {
			DOM: DOM.INIT,
			CYCLE: CYCLE.INIT,
			MUTATE: MUTATE.INIT,
			ev: undefined,
		},
		value: setup.value,
		props: setup.props,
		errors: undefined,
		extras: setup.type === "checkbox" ? setup.checkbox : (undefined as any),
		condition: {
			valid: true,
			error: false,
			updated: false,
			by: false,
		},
		element: {
			focused: false,
			visited: false,
			entered: false,
			left: false,
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

	// process initial value and extras for certain types
	switch (setup.type) {
		case "select":
		case "select.radio":
		case "file":
		case "checkbox":
			init.value = processValue(fieldProps, {
				$next: init,
				el: undefined,
				value: setup.value,
				manualUpdate: true,
				preprocessValue: true,
			});
			break;
		default:
			break;
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
