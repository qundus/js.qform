import type { Field, Form, Element, FunctionProps } from "../../_model";
import { hooksInUse } from "@qundus/qstate/hooks";
import { inputElement } from "./input";
import { selectElement } from "./select";

type ElementCustomProps<D extends Element.DomType, K extends Element.KeysType> = {
	dType?: D;
	kType?: K;
};
function getElementCustomProps<D extends Element.DomType, K extends Element.KeysType>(
	dTypeFallback: Element.DomType,
	props?: ElementCustomProps<D, K>,
) {
	return [props?.dType ?? dTypeFallback, props?.kType ?? "all"] as [
		Element.DomType,
		Element.KeysType,
	];
}

export function createElement<S extends Field.Setup, O extends Form.Options<any>>(
	props: FunctionProps.Element<S, O>,
) {
	const { key, setup, options, store } = props;

	// const baseEl = makeBaseElement({ field, key, $state, options });
	const element = "select" === setup.type ? selectElement<S, O>(props) : inputElement<S, O>(props);
	// determine used hooks
	const { getHook, getHooks, hookNames } = hooksInUse(store);
	const preactHook = getHook(hookNames.preact);
	const reactHook = getHook(hookNames.react);
	const solidHooks = getHooks(
		hookNames.solid,
		hookNames.solid_unwrapped,
		hookNames.solid_from,
		hookNames.solid_from_unwrapped,
	);
	let solidHook = false as false | string;
	if (solidHooks) {
		solidHook = solidHooks[0];
	}
	return {
		get dom() {
			return <D extends Element.DomType, K extends Element.KeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				const data = store.get();
				const [dType, kType] = getElementCustomProps("dom", props);
				return element(dType, kType, data);
			};
		},
		// preact
		get preact() {
			return <D extends Element.DomType, K extends Element.KeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				if (!preactHook) {
					throw new Error(
						"qform: preact hook does not exist, please add it to options.hooks option!",
					);
				}
				// @ts-ignore
				const data = derived.hooks[preactHook]();
				const [dType, kType] = getElementCustomProps("vdom", props);
				return element(dType, kType, data);
			};
		},
		// react
		get react() {
			return <D extends Element.DomType, K extends Element.KeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				if (!reactHook) {
					throw new Error(
						"qform: react hook does not exist, please add it to options.hooks option!",
					);
				}
				// @ts-ignore
				const data = derived.hooks[reactHook]();
				const [dType, kType] = getElementCustomProps("vdom", props);
				return element(dType, kType, data);
			};
		},
		// solidjs
		get solid() {
			return <D extends Element.DomType, K extends Element.KeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				if (!solidHook) {
					throw new Error(
						"qform: solid hook does not exist, please add it to options.hooks option!",
					);
				}
				// @ts-ignore
				const data = derived.hooks[solidHook]();
				const [dType, kType] = getElementCustomProps("dom", props);
				return element(dType, kType, data);
			};
		},
		get svelte() {
			const data = store.get();
			const [dType, kType] = getElementCustomProps("dom");
			return element(dType, kType, data);
		},
		ref: <K extends Element.KeysType>(ref: any, props?: ElementCustomProps<"dom", K>) => {
			// keep type as any to avoid unnecessary type issues
			// initialization only
			if (ref == null || ref.name === key) {
				return;
			}
			// console.log("ref is initialized for :: ", key);
			const data = store.get();
			const [dType, kType] = getElementCustomProps("dom", props);
			const el = element(dType, kType, data);
			for (const k in el) {
				// @ts-ignore
				ref[k] = el[k];
			}
		},
	};
}
