import type { Form, FunctionProps } from "../../_model";
import { atom } from "@qundus/qstate";
import type * as _QSTATE from "@qundus/qstate";

type ButtonObject = {
	status: Form.Status;
	disabled: boolean;
	canSubmit: boolean;
	submitting: boolean;
};
type ButtonStore<F extends Form.Fields, O extends Form.Options<F>> = _QSTATE.StoreDerived.Factory<
	ButtonObject,
	{
		hooks: O["storeHooks"];
	}
>;
export type FormAddonButton<F extends Form.Fields, O extends Form.Options<F>> = {
	store: ButtonStore<F, O>;
};
export function formButtonAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormAddon<F, O>,
): FormAddonButton<F, O> {
	const { store, options } = props;
	const form = store.get();
	// const status = form.status;
	const derived = store.derive(
		({ status }) =>
			({
				status: status,
				disabled: status !== "valid",
				canSubmit: status === "valid",
				submitting: status === "submit",
			}) as ButtonObject,
	);

	// store.listen((form) => {
	// 	// const changed = form.changed;
	// 	const status = form.status;
	// 	const prevValue = derived.get();
	// 	// console.log("called button :: ", status, " :: ", prevValue.status);
	// 	// if (prevValue.status === status) {
	// 	// 	return;
	// 	// }

	// 	const nextValue = {
	// 		status: status,
	// 		disabled: status !== "valid",
	// 		canSubmit: status === "valid",
	// 		submitting: status === "submit",
	// 	} as ButtonObject;

	// 	// TODO: add button status processor

	// 	derived.set(nextValue);
	// });

	return {
		store: derived as ButtonStore<F, O>,
	};
}
