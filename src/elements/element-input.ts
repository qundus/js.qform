import type {
	ElementDomType,
	ElementKeysType,
	ElementProps,
	ElementReturns,
	Field,
	FieldStoreObject,
	Options,
} from "../_model";
// import onBlur from "../interactions/on-blur";
import onValue from "../interactions/on-value";
import makeBaseElement, { type Returns as BaseReturns } from "./element-base";

//
type OnInput = (event: Event) => void;
export type Returns<T extends ElementDomType> = ElementReturns<
	T,
	{
		type: string;
		name: string;
		value: any;
	},
	BaseReturns<"dom"> & {
		oninput: OnInput;
	},
	BaseReturns<"vdom"> & {
		onInput: OnInput;
	}
>;
export default function makeInputElement<F extends Field, O extends Options<any>>(
	props: ElementProps<F, O>,
) {
	const { key, field, $store, options } = props;
	const key_str = String(key);
	const baseEl = makeBaseElement(props);
	return <D extends ElementDomType, K extends ElementKeysType>(
		dType: D,
		kType: K,
		reactive: FieldStoreObject<Field> | (() => FieldStoreObject<Field>),
	) => {
		const data = typeof reactive === "function" ? reactive() : reactive;
		let result = {} as any;
		if (kType !== "special") {
			result = baseEl(dType, kType, data);
		}
		if (kType !== "base") {
			result = {
				...result,
				type: data.condition.hidden ? "hidden" : field.type,
				name: key_str,
				multiple: field.multiple,
			};
			const addValue = field.type !== "checkbox" && field.type !== "radio" && field.type !== "file";
			if (addValue) {
				result.value = data?.value ?? "";
			}
			if (field.validateOn === "input") {
				const id = dType !== "vdom" ? "oninput" : "onInput";
				result[id] = (event: Event) => {
					event.preventDefault();
					$store.update(({ $next: $form }) => {
						onValue({ ...props, $form, event, value: null });
						return $form;
					});
				};
			}
			if (field.validateOn === "change") {
				const id = dType !== "vdom" ? "onchange" : "onChange";
				result[id] = (event: Event) => {
					event.preventDefault();
					$store.update(({ $next: $form }) => {
						onValue({ ...props, $form, event, value: null });
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
		return result as Returns<D>;
	};
}
