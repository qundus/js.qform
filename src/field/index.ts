import type { Field, Form } from "../_model";

//
import { prepareOptions } from "../form/preparations/options";
import { prepareSetup } from "./preparations/setup";
import { prepareStore } from "./preparations/store";

//
import { changeCycle } from "./cycles/change";
import { createRender } from "../render";
import { CYCLE, DOM, MUTATE, PLACEHOLDERS } from "../const";
import { mountCycle } from "./cycles/mount";
//
import { fieldAddonRemove } from "../addons/field/remove";
import { fieldAddonUpdate } from "../addons/field/update";
import { fieldAddonReset } from "../addons/field/reset";
import { prepareInit } from "./preparations/init";

//
export function createField<
	F extends Field.SetupIn,
	S extends Field.SetupInToSetup<F>,
	O extends Form.Options,
	G extends Form.Store<any, O>,
>(key: string, inn?: F, formOptions?: O, formStore?: G): Field.Factory<S, O> {
	// preparation //
	const options = prepareOptions<O>(formOptions) as O;
	const setup = prepareSetup<F, S>(key, inn, options);
	const store = prepareStore(options);
	const init = prepareInit(key, setup, options, store);
	// console.log("key :: ", key, " :: ", init);
	store.set(init);

	// addons
	const fieldProps = { key, setup, options, store, init };
	// render
	const render = createRender(fieldProps);

	const remove = fieldAddonRemove(fieldProps);
	const update = fieldAddonUpdate(fieldProps);
	const reset = fieldAddonReset(fieldProps);

	// cycles
	mountCycle(fieldProps, update);
	changeCycle(fieldProps, formStore, update);

	return {
		key,
		setup: setup as any,
		store: store as any,
		render: render as any,
		//
		update: update as any,
		remove,
		reset,
		// const
		get CYCLE() {
			return CYCLE;
		},
		get DOM() {
			return DOM;
		},
		get MUTATE() {
			return MUTATE;
		},
		get PLACEHOLDERS() {
			return PLACEHOLDERS;
		},
	};
}
