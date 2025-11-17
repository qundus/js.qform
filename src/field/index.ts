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
	const init = prepareInit(key, setup, options, store);
	// console.log("key :: ", key, " :: ", init);
	store.set(init);

	// addons
	const fieldProps = { key, setup, options, store, init };

	const remove = fieldAddonRemove(fieldProps);
	const update = fieldAddonUpdate(fieldProps);
	const reset = fieldAddonReset(fieldProps);

	// cycles
	mountCycle(fieldProps, update);
	changeCycle(fieldProps, formStore, update);

	// attributes
	let attrs: any = null;
	let attrsv: any = null;

	return {
		key,
		setup: setup as any,
		store: store as any,
		//
		update: update as any,
		remove,
		reset,
		//
		get attrs() {
			if (attrs == null) {
				attrs = createAttributes(fieldProps, "dom");
			}
			return attrs;
		},
		get attrsv() {
			if (attrsv == null) {
				attrsv = createAttributes(fieldProps, "vdom");
			}
			return attrsv;
		},
		get attrsh() {
			if (attrs == null) {
				attrs = createAttributes(fieldProps, "dom");
			}
			return attrs.hooks;
		},
		get attrsvh() {
			if (attrsv == null) {
				attrsv = createAttributes(fieldProps, "vdom");
			}
			return attrsv.hooks;
		},
	};
}
