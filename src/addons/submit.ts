import type { Form, FunctionProps } from "../_model";

export type AddonSubmit<F extends Form.Fields, O extends Form.Options<F>> = {
	submit: ReturnType<typeof submitAddon<F, O>>;
};
export function submitAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.Addon<F, O>,
) {
	const { $store } = props;
	function canSubmit() {
		const status = $store.get().status;
		if (status === "submit") {
			return false;
		}
		return status === "valid"; // || status === "submitting";
	}

	return {
		possible: canSubmit,
		start: () => {
			if (!canSubmit()) {
				return null;
			}
			$store.update(({ $next }) => {
				$next.status = "submit";
				return $next;
			});
			return () => {
				if ($store.get().status !== "submit") {
					return;
				}
				$store.update(({ $next }) => {
					$next.status = "valid";
					return $next;
				});
			};
		},
		task: async <W>(
			runner: () => Promise<W>,
		): Promise<[W, null] | [null, { message: string } | Record<string, any>]> => {
			if (!canSubmit()) {
				// console.log("form: cannot submit form!");
				return [null, { message: "form: cannot submit form!" }];
			}
			try {
				$store.update(({ $next }) => {
					$next.status = "submit";
					return $next;
				});
				const w = await runner?.();
				$store.update(({ $next }) => {
					$next.status = "valid";
					return $next;
				});
				return [w, null];
			} catch (e: any) {
				$store.update(({ $next }) => {
					$next.status = "valid";
					return $next;
				});
				// error?.(e);
				return [null, e];
			}
		},
	};
}
