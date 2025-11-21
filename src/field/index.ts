import type { Field, Form } from "../_model";

//
import { prepareOptions } from "../form/preparations/options";
import { prepareSetup } from "./preparations/setup";
import { prepareStore } from "./preparations/store";

//
import { changeCycle } from "./cycles/change";
import { createAttributes } from "./attributes";
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
	const init = prepareInit(key, setup, options, store) as any;
	// console.log("key :: ", key, " :: ", init);

	// create basic object
	const fieldProps = { key, setup, options, store, init };

	// generate attributes separately from init preparations and before commiting to store
	init.attrs = createAttributes(fieldProps, init);
	store.set(init);

	// create necessary addons before cycles begin
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
		storeh: (store as any).hooks,
		//
		update: update as any,
		remove,
		reset,
	};
}
