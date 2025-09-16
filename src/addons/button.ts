import type { Form, FunctionProps } from "../_model";
import type { _QSTATE } from "@qundus/qstate";

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
		$store: ButtonStore<F, O>;
	};
};
export function buttonAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.Addon<F, O>,
) {
	const { $store } = props;
	const derived = $store.derive((state) => {
		const status = state.status;
		return {
			status: status,
			disabled: status !== "valid",
			canSubmit: status === "valid",
			submitting: status === "submit",
		} as ButtonObject;
	}) as ButtonStore<F, O>;

	return {
		$store: derived,
	};
}
