import type { Form, FunctionProps } from "../../_model";

export type FormAddonSubmit<F extends Form.Fields, O extends Form.Options<F>> = ReturnType<
	typeof formSubmitAddon<F, O>
>;
export function formSubmitAddon<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormAddon<F, O>,
) {
	const { store, fields } = props;
	function canSubmit() {
		const status = store.get().status;
		if (status === "submit") {
			return false;
		}
		return status === "valid"; // || status === "submitting";
	}

	function markFields(submit: boolean) {
		for (const key in fields) {
			const field = fields[key];
			if (submit) {
				field.mark.cycle.submit();
			} else {
				field.mark.cycle.change();
			}
		}
	}

	return {
		/**
		 * check if it's possible to submit or not, this checks if all required
		 * non-hidden fields have been fulfilled.
		 */
		possible: canSubmit,
		/**
		 * you can start submission by calling this function and control it's end
		 * with the returned function, as opposed to task which controls
		 * everything internally.
		 * @returns a function to end submission, must be called
		 */
		start: () => {
			if (!canSubmit()) {
				return null;
			}
			store.set({ ...store.get(), status: "submit" });
			markFields(true);
			return () => {
				if (store.get().status !== "submit") {
					return;
				}
				markFields(false);
				store.set({ ...store.get(), status: "valid" });
			};
		},
		/**
		 * a submission cycle internally controlled and allows access to
		 * result after it's fulfillment, as opposed to start function which
		 * gives total freedom.
		 * @param runner the method to run for submission, maybe an api call or something.
		 * @returns
		 */
		task: async <W, E = Record<string, any>>(
			runner: () => W | Promise<W>,
		): Promise<[W, null] | [null, { message: string } | E]> => {
			if (!canSubmit()) {
				// console.log("form: cannot submit form!");
				return [null, { message: "qform: cannot submit form!" }];
			}
			try {
				store.set({ ...store.get(), status: "submit" });
				markFields(true);
				const w = await runner?.();
				store.set({ ...store.get(), status: "valid" });
				markFields(false);
				return [w, null];
			} catch (e: any) {
				store.set({ ...store.get(), status: "valid" });
				markFields(false);
				// error?.(e);
				return [null, e];
			}
		},
	};
}
