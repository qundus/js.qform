import type { Fields, PluginProps, State as FormState } from "../_model";
import type { _QSTATE } from "@qundus/qstate";

export type State<F extends Fields> = {
	status: FormState<F>["value"]["status"];
	disabled: boolean;
	canSubmit: boolean;
	submitting: boolean;
};
export type FormButton<F extends Fields> = {
	$hooks: _QSTATE.Derived<State<F>>["hooks"];
	$subscribe: _QSTATE.Derived<State<F>>["subscribe"];
	$listen: _QSTATE.Derived<State<F>>["listen"];
};
export default function formButton<F extends Fields>(props: PluginProps<F>): FormButton<F> {
	const { $state } = props;
	const derived = $state.derive((state) => {
		const status = state.status;
		return {
			status: status,
			disabled: status !== "valid",
			canSubmit: status === "valid",
			submitting: status === "submit",
		} as State<F>;
	});

	return {
		$hooks: derived.hooks,
		$subscribe: derived.subscribe,
		$listen: derived.listen,
	};
}
