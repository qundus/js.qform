import type { Fields, PluginProps } from "../_model";

export default function formButton<F extends Fields>(props: PluginProps<F>) {
	const { $state } = props;
	const derived = $state.derive((state) => {
		const status = state.status;
		return {
			status: status,
			disabled: status !== "valid",
			canSubmit: status === "valid",
			submitting: status === "submit",
		};
	});

	return {
		$state: derived,
		$hooks: derived.hooks,
	};
}
