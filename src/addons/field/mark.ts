import type { Field, Form, FunctionProps } from "../../_model";
import { FIELD_CYCLES } from "../../const";

export type FieldAddonMark<_S extends Field.Setup, _O extends Form.Options> = {
	cycle: {
		/** internal mount stage marking, use this at your own risk  */
		readonly __mount: () => void;
		readonly change: () => void;
		readonly load: () => void;
		readonly submit: () => void;
	};
};
export function fieldMarkAddon<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonMark<S, O> {
	const { store } = props;
	return {
		cycle: {
			__mount: () => {
				const state = store.get();
				if (FIELD_CYCLES[state.cycle] >= FIELD_CYCLES.mount) {
					console.warn("qform: cannot move to mount stage unless ");
					return;
				}
				// @ts-expect-error
				state.cycle = "mount";
				// @ts-expect-error
				state.__internal.update = "cycle";
				store.set({ ...state });
			},
			change: () => {
				const state = store.get();
				// @ts-expect-error
				state.cycle = "change";
				// @ts-expect-error
				state.__internal.update = "cycle";
				store.set({ ...state });
			},
			load: () => {
				const state = store.get();
				// @ts-expect-error
				state.cycle = "load";
				// @ts-expect-error
				state.__internal.update = "cycle";
				store.set({ ...state });
			},
			submit: () => {
				const state = store.get();
				// @ts-expect-error
				state.cycle = "submit";
				// @ts-expect-error
				state.__internal.update = "cycle";
				store.set({ ...state });
			},
		},
	};
}
