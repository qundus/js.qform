import { _QSTATE, batched } from "@qundus/qstate";
import type { Field, Form, FunctionProps } from "../../_model";

export function changeCycle<F extends Form.Fields, O extends Form.Options<F>>(
	props: FunctionProps.FormCycle<F, O>,
) {
	const { fields, options, store } = props;
	const stores = [] as Field.Store<any, O>[];
	for (const key in fields) {
		const field = fields[key];
		stores.push(field.store as any);
	}
	batched(stores, (...stores) => {
		const $next = { ...store.get() } as Form.StoreObject<F>;
		const count = {
			errors: 0,
			incompletes: 0,
		};
		$next.status = "valid";
		$next.incomplete = [];
		for (const store of stores) {
			//
			const key = store.__key;
			if (key == null || typeof key !== "string") {
				console.log("qform: key is undefined for store ", store);
				continue;
			}
			// @ts-expect-error
			$next.conditions[key] = store.condition;
			// @ts-expect-error
			$next.values[key] = store.value;
			// @ts-expect-error
			$next.errors[key] = store.errors;
			$next.extras[key] = store.extras;

			//
			const condition = store.condition;
			if (condition.valid) {
				continue;
			}
			if (condition.value.error) {
				count.errors++;
				if (condition.value.error === "incomplete") {
					count.incompletes++;
					$next.incomplete.push(key);
				}
			}
		}

		// finally, assign form status
		if (count.incompletes > 0 || count.errors > 0) {
			$next.status = count.errors > 0 ? "error" : "incomplete";
		}
	});
	// let internal_change = false;
	// onSet($store, async (payload) => {
	// 	// processing
	// 	const $next = payload.newValue; //as typeof $store.value;
	// 	const changed = payload.changed as string | undefined;
	// 	// check form status first
	// 	if ($next.status === "submit" || internal_change) {
	// 		internal_change = false;
	// 		return;
	// 	}
	// 	if (changed) {
	// 		const idx = changed.indexOf("[");
	// 		const value = $next[changed];
	// 		let root = undefined as undefined | string;
	// 		let key = undefined as undefined | string;
	// 		// has key update
	// 		if (idx > 0) {
	// 			root = changed.substring(0, idx);
	// 			key = changed.substring(idx + 1, changed.length - 1);
	// 		} else {
	// 			root = changed;
	// 		}
	// 		$next.changed = { root, key, value };
	// 		if (key) {
	// 			// @ts-expect-error
	// 			$next[root][key] = value;
	// 			// remove set key
	// 			delete $next[changed];
	// 		} else {
	// 			$next[root] = value;
	// 		}
	// 	}
	// then user changes, and move on with logic
	// const $options: Parameters<Exclude<O["onChange"], undefined>>[0]["$options"] = {
	// 	validate: false,
	// };
	// try {
	// 	await options?.onChange?.({
	// 		$next,
	// 		isServerSide,
	// 		abort: payload.abort,
	// 		$options,
	// 		// update: formUpdateAddon({ fields, options, $store: $store as any }),
	// 	});
	// } catch (err: any) {
	// 	console.error(
	// 		`qform: fatal error occured in options.onChange :: abort set to <${options.abortOnChangeException}> :: exception :: `,
	// 		err,
	// 	);
	// 	if (options.abortOnChangeException) {
	// 		payload.abort();
	// 		return;
	// 	}
	// }
	// 	$next.status = "valid";
	// 	$next.incomplete = [];
	// 	let errors = 0;
	// 	let incompletes = 0;
	// 	// TODO: for loop can be massively optimized after the per-key state updates
	// 	// global incompletes do not affect individual's
	// 	for (const key in fields) {
	// 		let incomplete = false;
	// 		const field = fields[key] as Form.Fields[number];
	// 		let $user = {
	// 			value: $next.values[key],
	// 			condition: $next.conditions[key],
	// 			errors: $next.errors[key],
	// 		};
	// 		if ($options.validate) {
	// 			if (
	// 				$options.validate === true ||
	// 				(Array.isArray($options.validate) && $options.validate.includes(key)) ||
	// 				$options.validate === key
	// 			) {
	// 				$user = processValidation(
	// 					{ setup: field, key, options },
	// 					{ manualUpdate: true, preprocessValue: true },
	// 					$next,
	// 					$user,
	// 				);
	// 			}
	// 		}
	// 		// first check errors
	// 		if ($user.errors != null) {
	// 			// console.log("onchange error :: ", key, " :: ", error);
	// 			if ($user.condition.hidden) {
	// 				$user.condition.valid = true;
	// 			} else if ($user.condition.value.error === "optional") {
	// 				$user.condition.valid = true;
	// 			} else {
	// 				errors++;
	// 				$user.condition.valid = false;
	// 			}
	// 			// TODO: continue/break here maybe?!
	// 		} else if ($user.condition.value.error === "incomplete") {
	// 			incomplete = true;
	// 		} else {
	// 			incomplete = field.incompleteStatus
	// 				? isFieldIncomplete(field, $user.condition, $user.value)
	// 				: false;
	// 		}
	// 		// if any field triggers incomplete form status, update it
	// 		if (incomplete) {
	// 			incompletes++;
	// 			$user.condition.valid = false;
	// 			if (options.incompleteListCount) {
	// 				if (typeof options.incompleteListCount === "boolean") {
	// 					$next.incomplete.push(key);
	// 				} else if ($next.incomplete.length < options.incompleteListCount) {
	// 					$next.incomplete.push(key);
	// 				}
	// 			}
	// 		} else {
	// 			$user.condition.valid = $user.condition.value.error !== "validation";
	// 		}
	// 	}
	// 	// finally check for the status and cleanup what's necessary

	// 	// we got specific key changes, apply whole store update
	// 	if (changed) {
	// 		internal_change = true;
	// 		$store.set($next);
	// 		// abort and return actual state
	// 		payload.abort();
	// 	}
	// });
}
