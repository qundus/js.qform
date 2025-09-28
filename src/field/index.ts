import type { Field, Form } from "../_model";

//
import { prepareOptions } from "../form/preparations/options";
import { prepareSetup } from "./preparations/setup";
import { prepareInit } from "./preparations/init";
import { prepareStore } from "./preparations/store";

//
import { changeCycle } from "./cycles/change";
import { createRender } from "../render";
import { CYCLE, DOM, MUTATE, PLACEHOLDERS } from "../const";
import { mountCycle } from "./cycles/mount";
import { fieldAddAddon } from "../addons/field/add";
import { fieldClearAddon } from "../addons/field/clear";
import { fieldUpdateAddon } from "../addons/field/update";
import { fieldMarkAddon } from "../addons/field/mark";
import { fieldRemoveAddon } from "../addons/field/remove";

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
	const init = prepareInit(key, setup, options);
	const store = prepareStore(init, options);

	const fieldProps = { key, setup, options, store, init };

	// elements
	const render = createRender(fieldProps);

	// addons
	const add = fieldAddAddon(fieldProps);
	const clear = fieldClearAddon(fieldProps);
	const update = fieldUpdateAddon(fieldProps);
	const mark = fieldMarkAddon(fieldProps);
	const remove = fieldRemoveAddon(fieldProps);

	// cycles
	mountCycle(fieldProps, update, mark);
	changeCycle(fieldProps, formStore, mark);

	return {
		key,
		setup: setup as any,
		store: store as any,
		render,
		//
		add,
		update: update as any,
		clear,
		mark,
		remove,
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
