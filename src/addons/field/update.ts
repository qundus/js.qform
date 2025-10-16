import type { Extras, Field, Form, FunctionProps } from "../../_model";
import { FIELD, type MISC } from "../../const";

export type FieldAddonUpdate<S extends Field.Setup, O extends Form.Options> = {
	value: (
		value: S["value"] | ((prev: undefined) => S["value"] | undefined) | undefined,
		configs?: { preprocess?: boolean; noValidate?: boolean },
	) => void;
	condition: (
		value: Partial<Field.Condition> | ((prev: Field.Condition) => Partial<Field.Condition>),
	) => void;
	element: (
		value: Partial<Field.Element<S>> | ((prev: Field.Element<S>) => Partial<Field.Element<S>>),
		configs?: { noValidate?: boolean },
	) => void;
	props: <G extends S["props"]>(
		value: Partial<G> | ((prev: G) => Partial<G> | undefined) | undefined,
	) => void;
	/**
	 * update current cycle to send signal to field listeners of what cycle this field
	 * is in.
	 * @param cycle the requested cycle, updated immediatly.
	 * @returns a function to end the requested cycle and go back to CHANGE cycle only if no
	 * other requests have been made
	 */
	cycle: <G extends FIELD.CYCLE>(
		cycle: G | undefined | null,
	) => G extends FIELD.CYCLE.IDLE ? void : () => void;
	// extras indvidually
	select: <E extends Extras.Select.In>(props: Partial<E> | ((prev: E) => Partial<E>)) => void;
	checkbox: <E extends Extras.Checkbox.In>(props: Partial<E> | ((prev: E) => Partial<E>)) => void;
	tel: (
		props: { country?: (typeof MISC.COUNTRIES)[number] | string; value?: string },
		configs?: { preprocess?: boolean; noValidate?: boolean },
	) => void;
	// cycleUnsafe:  (cycle: CYCLE) => void;
	// validation(): (func: Field.Validate) => (() => void) | null;
	// /**
	//  * special api to update selections extras
	//  */
	// extras: <G extends Field.Extras<S>>(props: Partial<G> | ((value: G) => Partial<G>)) => void;
};
export function fieldAddonUpdate<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.FieldAddon<S, O>,
): FieldAddonUpdate<S, O> {
	const { store, options, setup } = props;
	let cycle_tracker = 0;
	return {
		value: (value, configs) => {
			const next = { ...store.get() };
			const prev = next.value;
			next.value = typeof value === "function" ? (value as any)(prev) : value;
			next.__internal.manual = true;
			next.__internal.preprocess = configs?.preprocess;
			next.__internal.noValidation = configs?.noValidate;
			//
			next.event.MUTATE = FIELD.MUTATE.VALUE;
			next.event.DOM = FIELD.DOM.IDLE;
			store.set(next);
		},
		condition: (value) => {
			const next = { ...store.get() };
			const prev = next.condition;
			const vv = typeof value === "function" ? value(prev) : value;
			next.condition = { ...prev, ...vv };
			next.__internal.manual = true;
			// state.__internal.preprocess = configs?.preprocess;
			//
			next.event.MUTATE = FIELD.MUTATE.CONDITION;
			next.event.DOM = FIELD.DOM.IDLE;
			store.set(next);
		},
		element: (value, configs) => {
			const next = { ...store.get() };
			const prev = next.element;
			const vv = typeof value === "function" ? value(prev) : value;
			next.element = { ...prev, ...vv };
			next.__internal.manual = true;
			next.__internal.noValidation = configs?.noValidate;
			// state.__internal.preprocess = configs?.preprocess;
			next.event.MUTATE = FIELD.MUTATE.ELEMENT;
			next.event.DOM = FIELD.DOM.IDLE;
			store.set(next);
		},
		props: (value) => {
			const next = { ...store.get() };
			const prev = next.props;
			const vv = typeof value === "function" ? (value as any)(prev) : value;
			next.props = vv;
			next.__internal.manual = true;
			// state.__internal.preprocess = configs?.preprocess;
			next.event.MUTATE = FIELD.MUTATE.PROPS;
			next.event.DOM = FIELD.DOM.IDLE;
			store.set(next);
		},
		cycle: (cycle) => {
			if (cycle == null) {
				return;
			}
			const next = { ...store.get() };
			const prev = next.event.CYCLE;
			if (cycle === FIELD.CYCLE.INIT && prev > FIELD.CYCLE.INIT) {
				throw new Error("qform: cannot move to INIT cycle after IDLE has been instilled!");
			}
			next.event.CYCLE = cycle;
			next.event.MUTATE = FIELD.MUTATE.CYCLE;
			next.event.DOM = FIELD.DOM.IDLE;
			if (cycle === FIELD.CYCLE.IDLE) {
				if (cycle_tracker > 0) {
					// means that there's a cycle controlled by user and will go back
					// to IDLE once done, if not, user should know they're in control of this
					return null as any;
				}
				store.set(next);
				return null as any;
			} else {
				store.set(next);
			}
			// console.log("tracker :: ", cycle, " :: ", cycle_tracker);
			cycle_tracker++;
			return () => {
				const next = { ...store.get() };
				cycle_tracker--;
				// console.log("tracker done :: ", cycle, " :: ", cycle_tracker);
				if (cycle_tracker > 0 || next.event.CYCLE === FIELD.CYCLE.IDLE) {
					return;
				}
				cycle_tracker = 0;
				next.event.CYCLE = FIELD.CYCLE.IDLE;
				next.event.MUTATE = FIELD.MUTATE.CYCLE;
				next.event.DOM = FIELD.DOM.IDLE;
				store.set(next);
			};
		},
		select: (value) => {
			const next = { ...store.get() };
			const prev = next.extras;
			const vv = typeof value === "function" ? (value as any)(prev) : value;
			next.extras = { ...prev, ...vv };
			next.__internal.manual = true;
			// state.__internal.preprocess = configs?.preprocess;
			next.event.MUTATE = FIELD.MUTATE.EXTRAS;
			next.event.DOM = FIELD.DOM.IDLE;
			store.set(next);
		},
		checkbox: (value) => {
			const next = { ...store.get() };
			const prev = next.extras;
			const vv = typeof value === "function" ? (value as any)(prev) : value;
			next.extras = { ...prev, ...vv };
			next.__internal.manual = true;
			// state.__internal.preprocess = configs?.preprocess;
			next.event.MUTATE = FIELD.MUTATE.EXTRAS;
			next.event.DOM = FIELD.DOM.IDLE;
			store.set(next);
		},
		tel(props, configs) {
			if (props == null) {
				return;
			}
			const next = { ...store.get() };
			const extras = next.extras as Extras.Tel.Out<Field.Setup<"tel">>;
			const vv = extras.value?.preservedNoCode ?? next.value ?? "";
			let country = "";
			// const phone = extras.value?.numberNoCode;
			if (props.country != null) {
				const dd = extras.international.prefix ?? "+";
				country =
					typeof props.country === "string"
						? props.country
						: `${dd}${props.country.dial_code.replace("+", "")}`;
				extras.international.prefix = null;
				extras.international.country = null;
			}
			next.extras = extras as any;
			next.value = `${country}${props.value ?? vv}`;
			next.__internal.manual = true;
			next.__internal.preprocess = configs?.preprocess;
			next.__internal.noValidation = configs?.noValidate;
			// state.__internal.preprocess = configs?.preprocess;
			next.event.MUTATE = FIELD.MUTATE.EXTRAS;

			next.event.DOM = FIELD.DOM.IDLE;
			store.set(next);
		},
		// cycleUnsafe(cycle) {
		// 	const state = store.get();
		// 	const prev = state.event.CYCLE;
		// 	if (prev >= CYCLE.MOUNT && cycle === CYCLE.MOUNT) {
		// 		throw new Error("qform: cannot move to mount cycle after <change> has been instilled!");
		// 	}
		// 	state.event.CYCLE = cycle;
		// 	state.event.MUTATE = MUTATE.CYCLE;
		// 	state.event.DOM = DOM.IDLE;
		// 	store.set({ ...state });
		// 	cycle_tracker.push(prev);
		// },
		// validation() {
		// 	return (func: Field.Validate) => {
		// 		if (func == null || typeof func !== "function") {
		// 			return null;
		// 		}
		// 		let idx = null as number | null;
		// 		if (setup.validate == null) {
		// 			setup.validate = func;
		// 		} else if (Array.isArray(setup.validate)) {
		// 			idx = setup.validate.push(func);
		// 			idx--;
		// 		} else {
		// 			setup.validate = [setup.validate, func];
		// 			idx = 1;
		// 		}
		// 		return () => {
		// 			if (typeof setup.validate === "function") {
		// 				setup.validate = null;
		// 			} else {
		// 				if (setup.validate != null) {
		// 					setup.validate = setup.validate.filter((_item, index) => index !== idx);
		// 					if (setup.validate.length <= 0) {
		// 						setup.validate = null;
		// 					}
		// 				}
		// 			}
		// 		};
		// 	};
		// },
	};
}
