import { baseElement, type BaseElementFactory } from "./base";
import type { Element, Field, Form, FunctionProps } from "../../_model";

//
type OnInput = (event: Event) => void;
export type InputElementFactory<T extends Element.DomType> = Element.Factory<
	T,
	{
		type: string;
		name: string;
		value: any;
	},
	BaseElementFactory<"dom"> & {
		oninput: OnInput;
	},
	BaseElementFactory<"vdom"> & {
		onInput: OnInput;
	}
>;
export function inputElement<S extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<S, O>,
) {
	const { key, options, store, setup } = props;
	const baseEl = baseElement(props);
	return <D extends Element.DomType, K extends Element.KeysType>(
		dType: D,
		kType: K,
		reactive: Field.StoreObject<S> | (() => Field.StoreObject<S>),
	) => {
		const state = typeof reactive === "function" ? reactive() : reactive;
		let render = {} as any;
		if (kType !== "special") {
			render = baseEl(dType, kType, state);
		}
		if (kType !== "base") {
			render = {
				...render,
				type: state?.element.hidden ? "hidden" : setup.type,
				name: state.__key,
				multiple: state?.element.multiple,
			};
			const addValue = setup.type !== "checkbox" && setup.type !== "radio" && setup.type !== "file";
			if (addValue) {
				render.value = state?.value ?? "";
			}

			// listener id
			let listenerId = undefined as string | undefined;
			if (state.element.validateOn === "change") {
				listenerId = dType !== "vdom" ? "onchange" : "onChange";
			} else {
				//if (setup.validateOn === "input") {
				listenerId = dType !== "vdom" ? "oninput" : "onInput";
			}
			render[listenerId] = (event: Event) => {
				event.preventDefault();
				store.set({
					...(state as any),
					__internal: {
						update: "value",
						manual: false,
						event,
					},
				});
			};
		}

		// check user process
		const processProps = { key, state, render, store, isVdom: dType === "vdom", kType };
		if (options?.onFieldElementOrder === "before") {
			options?.onFieldElement?.(processProps);
		}
		setup.onElement?.(processProps);
		if (options?.onFieldElementOrder === "after") {
			options?.onFieldElement?.(processProps);
		}

		// console.log("element input :: ", key, " :: ", result.value);
		return render as InputElementFactory<D>;
	};
}
