import type { Form } from "../../../_model";
import { onMount, type _QSTATE } from "@qundus/qstate";

type FormButtonObject = {
	status: Form.Status;
	disabled: boolean;
	canSubmit: boolean;
	submitting: boolean;
};
type FormButtonStore<F extends Form.Fields, O extends Form.Options<F>> = _QSTATE.StoreDerived<
	FormButtonObject,
	{
		hooks: O["hooks"];
	}
>;
export type FormButtonExtender<
	F extends Form.Fields,
	O extends Form.Options<F>,
	S extends FormButtonStore<F, O> = FormButtonStore<F, O>,
> = {
	$store: S;
};
export function formButtonExtender<F extends Form.Fields, O extends Form.Options<F>>(
	props: Form.ExtenderProps<F, O>,
): FormButtonExtender<F, O> {
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
	};
}
