import { valueInteraction } from "../interactions/value";
import { baseElement, type BaseElementFactory } from "./base";
import type { Element, Field, Form, FunctionProps } from "../_model";

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
export function selectElement<F extends Field.Options, O extends Form.Options<any>>(
	basic: FunctionProps.Basic<F, O>,
) {
	const { key, field, $store, options } = basic;
	const key_str = String(key);
	const baseEl = baseElement(basic);
	return <D extends Element.DomType, K extends Element.KeysType>(
		dType: D,
		kType: K,
		reactive: Field.StoreObject<Field.Options> | (() => Field.StoreObject<Field.Options>),
	) => {
		const data = typeof reactive === "function" ? reactive() : reactive;
		const processorProps: FunctionProps.Processor<F, O> = {
			manualUpdate: false,
			preprocessValue: options.preprocessValues ?? field.preprocessValue,
		};
		let result = {} as any;
		if (kType !== "special") {
			result = baseEl(dType, kType, data);
		}
		if (kType !== "base") {
			result = {
				...result,
				name: key_str,
				value: data?.value,
				multiple: field.multiple ?? false,
			};
			if (field.validateOn === "input") {
				const id = dType ? "oninput" : "onInput";
				result[id] = (event: Event) => {
					$store.update(({ $next: $form }) => {
						valueInteraction(basic, { $form, event, value: null }, processorProps);
						return $form;
					});
				};
			}
			if (field.validateOn === "change") {
				const id = dType ? "onchange" : "onChange";
				result[id] = (event: Event) => {
					$store.update(({ $next: $form }) => {
						valueInteraction(basic, { $form, event, value: null }, processorProps);
						return $form;
					});
				};
			}
		}

		// check user process
		const processProps = { key, isVdom: dType === "vdom", kType, value: data, element: result };
		if (options.processElementOrder === "before") {
			options?.processElement?.(processProps);
		}
		field.processElement?.(processProps);
		if (options.processElementOrder === "after") {
			options?.processElement?.(processProps);
		}
		return result as SelectElementFactory<D>;
	};
}
