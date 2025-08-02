import type {
	ElementDomType,
	ElementKeysType,
	ElementProps,
	ElementReturns,
	Field,
	FieldStoreObject,
	Options,
} from "../_model";
import onValue from "../interactions/on-value";
import makeBaseElement, { type Returns as BaseReturns } from "./element-base";
//
type OnInput = (event: Event) => void;
export type Returns<T extends ElementDomType> = ElementReturns<
	T,
	{
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
export default function makeSelectElement<F extends Field, O extends Options<any>>(
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
				name: key_str,
				value: data?.value,
				multiple: field.multiple ?? false,
			};
			if (field.validateOn === "input") {
				const id = dType ? "oninput" : "onInput";
				result[id] = (event: Event) => {
					$store.update(({ $next: $form }) => {
						onValue({ ...props, $form, event, value: null });
						return $form;
					});
				};
			}
			if (field.validateOn === "change") {
				const id = dType ? "onchange" : "onChange";
				result[id] = (event: Event) => {
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
