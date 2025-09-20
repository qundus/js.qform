import type { Field, Form } from "../_model";
import { prepareOptions } from "../form/preparations/options";
import { prepareStore } from "./preparations/store";

//
import { changeCycle } from "./cycles/change";
import { createElement } from "./elements";
import { PLACEHOLDERS } from "../const";
import { mergeFieldConditions } from "../methods/merge-field-conditions";
import { prepareSetup } from "./preparations/setup";
import { mountCycle } from "./cycles/mount";
import { fieldAddAddon } from "../addons/field/add";
import { fieldClearAddon } from "../addons/field/clear";
import { fieldUpdateAddon } from "../addons/field/update";

//
export function createField<
	F extends Field.SetupIn,
	S extends Field.SetupInToSetup<F>,
	O extends Form.Options,
	G extends Form.Store<any, O>,
>(key: string, inn?: F, formOptions?: O, formStore?: G): Field.Factory<S, O> {
	// preparation
	const options = prepareOptions<O>(formOptions);
	const setup = prepareSetup<F, S>(key, inn, options);
	const store = prepareStore(key, setup, options);

	const fieldProps = { key, setup, options, store };

	// elements
	const element = createElement(fieldProps);

	// addons
	const add = fieldAddAddon(fieldProps);
	const clear = fieldClearAddon(fieldProps);
	const update = fieldUpdateAddon(fieldProps);

	// cycles
	mountCycle(fieldProps, update);
	changeCycle(fieldProps, formStore);

	return {
		key,
		setup: setup as any,
		store: store as any,
		element,
		placeholders: PLACEHOLDERS,
		add,
		update,
		clear,
	};
}
