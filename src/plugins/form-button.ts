import type { Fields, Options, PluginProps, StateObject } from "../_model";
import type { _QSTATE } from "@qundus/qstate";

export type ButtonObject<F extends Fields> = {
	status: StateObject<F>["status"];
	disabled: boolean;
	canSubmit: boolean;
	submitting: boolean;
};
export type ButtonStore<F extends Fields, O extends Options<F, any>> = _QSTATE.DerivedStore<
	ButtonObject<F>,
	O["state"]
>;
export type Button<
	F extends Fields,
	O extends Options<F, any>,
	S extends ButtonStore<F, O> = ButtonStore<F, O>,
> = {
	$hooks: S["hooks"];
	$listen: S["listen"];
	$subscribe: S["subscribe"];
};
export default function formButton<F extends Fields, O extends Options<F, any>>(
	props: PluginProps<F, O>,
): Button<F, O> {
	const { $store } = props;
	const derived = $store.derive((state) => {
		const status = state.status;
		return {
			status: status,
			disabled: status !== "valid",
			canSubmit: status === "valid",
			submitting: status === "submit",
		} as ButtonObject<F>;
	});

	return {
		$hooks: derived.hooks,
		$subscribe: derived.subscribe,
		$listen: derived.listen,
	};
}
