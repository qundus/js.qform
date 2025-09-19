import { onMount, task } from "@qundus/qstate";
import type { Addon, Form, FunctionProps } from "../../_model";
import { isServerSide } from "@qundus/qstate/checks";

export function mountCycle<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormCycle<F, O>,
	update: Addon.FormUpdate<F, O>,
) {
	const { fields, options, store } = props;
	onMount(store, () => {
		const form = store.get();
		//
		const ureturns = task(async () => {
			const voidOrFunc = await options?.onMount?.({
				isServerSide,
				update,
				form,
			});
			return voidOrFunc;
		});
		return () => {
			store.set(form);
			if (ureturns != null && typeof ureturns === "function") {
				// @ts-ignore
				ureturns?.();
			}
		};
	});
}
