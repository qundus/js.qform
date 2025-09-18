import type { Form, FunctionProps } from "../_model";
import { type _QSTATE, atom } from "@qundus/qstate";

type ButtonObject = {
	status: Form.Status;
	disabled: boolean;
	canSubmit: boolean;
	submitting: boolean;
};
type ButtonStore<F extends Form.Fields, O extends Form.Options<F>> = _QSTATE.StoreDerived<
	ButtonObject,
	{
		hooks: O["hooks"];
	}
>;
export type AddonButton<F extends Form.Fields, O extends Form.Options<F>> = {
	button: {
		store: ButtonStore<F, O>;
	};
};
export function buttonAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.Addon<F, O>,
) {
	const { $store, options } = props;
	const form = $store.get();
	const status = form.status;
	const derived = atom(
		{
			status: status,
			disabled: status !== "valid",
			canSubmit: status === "valid",
			submitting: status === "submit",
		} as ButtonObject,
		{
			hooks: options.hooks,
		},
	);

	$store.listen((form) => {
		// const changed = form.changed;
		const status = form.status;
		const prevValue = derived.get();
		// console.log("called button :: ", status, " :: ", prevValue.status);
		// if (prevValue.status === status) {
		// 	return;
		// }

		const nextValue = {
			status: status,
			disabled: status !== "valid",
			canSubmit: status === "valid",
			submitting: status === "submit",
		} as ButtonObject;

		// TODO: add button status processor
		// try {
		// 	const nextUser = await field?.processState?.({
		// 		form,
		// 		prevForm,
		// 		prevValue,
		// 		$next: nextValue,
		// 	});

		// 	if (nextUser != null) {
		// 		nextValue = nextUser as any;
		// 	}
		// } catch (err: any) {
		// 	console.error(
		// 		`qform: fatal error occured in fild.processState :: abort set to <${field.abortProcessStateException}> :: exception :: `,
		// 		err,
		// 	);
		// 	if (field.abortProcessStateException) {
		// 		return;
		// 	}
		// }

		derived.set(nextValue);
	});

	return {
		store: derived as ButtonStore<F, O>,
	};
}
