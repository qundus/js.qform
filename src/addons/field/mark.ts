import type { Field, Form, FunctionProps } from "../../_model";
import { CYCLE, DOM, MUTATE } from "../../const";

export type FieldAddonMark<_S extends Field.Setup, _O extends Form.Options> = {
	cycle: {
		readonly mount: () => void;
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
			mount: () => {
				const state = store.get();
				if (state.event.CYCLE >= CYCLE.MOUNT) {
					console.warn("qform: cannot move to mount cycle after change has been instilled!");
					return;
				}
				state.event.CYCLE = CYCLE.MOUNT;
				state.event.MUTATE = MUTATE.CYCLE;
				state.event.DOM = DOM.IDLE;
				store.set({ ...state });
			},
			change: () => {
				const state = store.get();
				state.event.CYCLE = CYCLE.CHANGE;
				state.event.MUTATE = MUTATE.CYCLE;
				state.event.DOM = DOM.IDLE;
				store.set({ ...state });
			},
			load: () => {
				const state = store.get();
				state.event.CYCLE = CYCLE.LOAD;
				state.event.MUTATE = MUTATE.CYCLE;
				state.event.DOM = DOM.IDLE;
				store.set({ ...state });
			},
			submit: () => {
				const state = store.get();
				state.event.CYCLE = CYCLE.SUBMIT;
				state.event.MUTATE = MUTATE.CYCLE;
				state.event.DOM = DOM.IDLE;
				store.set({ ...state });
			},
		},
	};
}
