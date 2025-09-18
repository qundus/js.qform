import { atom } from "@qundus/qstate";
import type { Field, Form, FunctionProps } from "../../_model";
import { isServerSide } from "@qundus/qstate/checks";
import { prepareCondition } from "./condition";

// TODO: atom store may become inconsistent with onchange function
// find another way to do it!
export function prepareStore<S extends Field.Setup, O extends Form.Options<any>>(
	key: string,
	setup: S,
	options: O | undefined,
) {
	// initialize
	const init: Field.StoreObject<S> = {
		__internal: {
			update: undefined,
			manual: false,
			preprocess: true,
			event: undefined,
		},
		value: setup.value,
		condition: prepareCondition(key, setup),
		errors: undefined,
		extras: undefined,
	};

	// create state
	const store = atom(init, {
		hooks: options?.hooks,
	});

	//
	return store as Field.Store<S, O>;
}
