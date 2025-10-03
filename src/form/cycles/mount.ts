import { onMount, task } from "@qundus/qstate";
import type { Addon, Field, Form, FunctionProps } from "../../_model";
import { isServerSide } from "@qundus/qstate/checks";
import { FIELD } from "../../const";

export function mountCycle<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormCycle<F, O>,
	update: Addon.FormUpdate<F, O>,
) {
	const { fields, options, store } = props;
	onMount(store, () => {
		console.log("checking store cycle ");
		// const form = store.get();
		// //
		// let ureturns = null as any;
		// if (options?.onMount) {
		// 	task(async () => {
		// 		// const stores = [] as Field.Store<any, O>[];
		// 		for (const key in fields) {
		// 			const field = fields[key];
		// 			// stores.push(field.store as any);
		// 			await waitForLoading(field.store as any);
		// 		}
		// 		//
		// 		ureturns = await options?.onMount?.({
		// 			isServerSide,
		// 			update,
		// 			form,
		// 		});
		// 	});
		// }
		return () => {
			// store.set(form);
			// if (ureturns != null && typeof ureturns === "function") {
			// 	ureturns?.();
			// }
		};
	});
}

function waitForLoading(store: Field.Store<any, any>): Promise<void> {
	const cycle = store.get().event.CYCLE;
	if (cycle > FIELD.CYCLE.IDLE) return Promise.resolve();

	return new Promise((resolve) => {
		const unsubscribe = store.subscribe((state) => {
			const cycle = state.event.CYCLE;
			if (cycle > FIELD.CYCLE.IDLE) {
				unsubscribe();
				resolve();
			}
		});
	});
}
