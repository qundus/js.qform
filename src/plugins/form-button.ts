import type { Fields, FormStatus, Options, PluginProps } from "../_model";
import type { _QSTATE } from "@qundus/qstate";

export type FormButtonObject = {
	status: FormStatus;
	disabled: boolean;
	canSubmit: boolean;
	submitting: boolean;
};
export type FormButtonStore<F extends Fields, O extends Options<F>> = _QSTATE.StoreDerived<
	FormButtonObject,
	{
		hooks: O["hooks"];
	}
>;
export type FormButton<
	F extends Fields,
	O extends Options<F>,
	S extends FormButtonStore<F, O> = FormButtonStore<F, O>,
> = {
	$store: S;
	// $hooks: S["hooks"];
	// $listen: S["listen"];
	// $subscribe: S["subscribe"];
};
export default function formButton<F extends Fields, O extends Options<F>>(
	props: PluginProps<F, O>,
): FormButton<F, O> {
	const { $store } = props;
	const derived = $store.derive((state) => {
		const status = state.status;
		return {
			status: status,
			disabled: status !== "valid",
			canSubmit: status === "valid",
			submitting: status === "submit",
		} as FormButtonObject;
	}) as FormButtonStore<F, O>;

	return {
		$store: derived,
		// $hooks: derived.hooks,
		// $subscribe: derived.subscribe,
		// $listen: derived.listen,
	};
}
