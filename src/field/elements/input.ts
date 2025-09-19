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
export function inputElement<F extends Field.Setup, O extends Form.Options>(
	props: FunctionProps.Field<F, O>,
) {
	const { key, setup, options, store } = props;
	const key_str = String(key);
	const baseEl = baseElement(props);
	return <D extends Element.DomType, K extends Element.KeysType>(
		dType: D,
		kType: K,
		reactive: Field.StoreObject<Field.Setup> | (() => Field.StoreObject<Field.Setup>),
	) => {
		const data = typeof reactive === "function" ? reactive() : reactive;
		let result = {} as any;
		if (kType !== "special") {
			result = baseEl(dType, kType, data);
		}
		if (kType !== "base") {
			result = {
				...result,
				type: data.condition.hidden ? "hidden" : setup.type,
				name: key_str,
				multiple: setup.multiple,
			};
			const addValue = setup.type !== "checkbox" && setup.type !== "radio" && setup.type !== "file";
			if (addValue) {
				result.value = data?.value ?? "";
			}

			// listener id
			let listenerId = undefined as string | undefined;
			if (setup.validateOn === "change") {
				listenerId = dType !== "vdom" ? "onchange" : "onChange";
			} else {
				//if (setup.validateOn === "input") {
				listenerId = dType !== "vdom" ? "oninput" : "onInput";
			}
			result[listenerId] = (event: Event) => {
				event.preventDefault();
				store.set({
					...(data as any),
					__internal: {
						event,
						manual: false,
						update: "value",
					},
				});
				// valueInteraction(basic, { event, value: null }, interactionProcessorProps);
			};
		}

		// check user process
		const processProps = { key, isVdom: dType === "vdom", kType, value: data, element: result };
		if (options?.processElementOrder === "before") {
			options?.onRenderField?.(processProps);
		}
		setup.onRender?.(processProps);
		if (options?.processElementOrder === "after") {
			options?.onRenderField?.(processProps);
		}

		// console.log("element input :: ", key, " :: ", result.value);
		return result as InputElementFactory<D>;
	};
}
