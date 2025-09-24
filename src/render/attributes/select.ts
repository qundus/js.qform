import { baseElement, type BaseElementFactory } from "./base";
import type { Element, Field, Form, FunctionProps } from "../../_model";

//
type OnInput = (event: Event) => void;
export type SelectElementFactory<T extends Element.DomType> = Element.Factory<
	T,
	{
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
export function selectElement<S extends Field.Setup, O extends Form.Options>(
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
				name: state.__key,
				value: state?.value,
				multiple: state.element.multiple,
			};

			//
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
						event,
						manual: false,
						update: "value",
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
		return render as SelectElementFactory<D>;
	};
}
