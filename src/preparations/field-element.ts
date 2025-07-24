import type {
	ElementDomType,
	ElementKeysType,
	ElementProps,
	Field,
	FieldStore,
	Options,
} from "../_model";
import makeInputElement from "../elements/element-input";
import makeSelectElement from "../elements/element-select";
import { hooksInUse } from "@qundus/qstate/hooks";

type ElementCustomProps<D extends ElementDomType, K extends ElementKeysType> = {
	dType?: D;
	kType?: K;
};
interface Props<F extends Field, O extends Options<any, any>> {
	derived: FieldStore<F, O>;
}

export type FieldElement<F extends Field, O extends Options<any, any>> = ReturnType<
	typeof prepareFieldElement<F, O>
>;

function getElementCustomProps<D extends ElementDomType, K extends ElementKeysType>(
	dTypeFallback: ElementDomType,
	props?: ElementCustomProps<D, K>,
) {
	return [props?.dType ?? dTypeFallback, props?.kType ?? "all"] as [
		ElementDomType,
		ElementKeysType,
	];
}
export default function prepareFieldElement<F extends Field, O extends Options<any, any>>(
	props: Props<F, O> & ElementProps<F, O>,
) {
	const { derived, key, field, $store, options } = props;
	// const baseEl = makeBaseElement({ field, key, $state, options });
	const element =
		"select" === field.type
			? makeSelectElement<F, O>({ field, key, $store, options })
			: makeInputElement<F, O>({ field, key, $store, options });
	// determine used hooks
	const hooks = hooksInUse(derived);
	const preactHook = hooks.PREACT.used && derived.hooks[hooks.PREACT.key];
	const reactHook = hooks.REACT.used && derived.hooks[hooks.REACT.key];
	const solidHook = hooks.SOLID.used && derived.hooks[hooks.SOLID.key];

	return {
		get dom() {
			return <D extends ElementDomType, K extends ElementKeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				const data = derived.get();
				const [dType, kType] = getElementCustomProps("dom", props);
				return element(dType, kType, data);
			};
		},
		// preact
		get preact() {
			return <D extends ElementDomType, K extends ElementKeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				if (preactHook == null) {
					throw new Error(
						"qform: preact hook does not exist, please add it to state.hooks option!",
					);
				}
				const data = preactHook();
				const [dType, kType] = getElementCustomProps("vdom", props);
				return element(dType, kType, data);
			};
		},
		// react
		get react() {
			return <D extends ElementDomType, K extends ElementKeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				if (reactHook == null) {
					throw new Error("qform: react hook does not exist, please add it to state.hooks option!");
				}
				const data = reactHook();
				const [dType, kType] = getElementCustomProps("vdom", props);
				return element(dType, kType, data);
			};
		},
		// solidjs
		get solid() {
			return <D extends ElementDomType, K extends ElementKeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				if (solidHook == null) {
					throw new Error("qform: solid hook does not exist, please add it to state.hooks option!");
				}
				const data = solidHook();
				const [dType, kType] = getElementCustomProps("dom", props);
				return element(dType, kType, data);
			};
		},
		get svelte() {
			const data = derived.get();
			const [dType, kType] = getElementCustomProps("dom");
			return element(dType, kType, data);
		},
		ref: <K extends ElementKeysType>(ref: any, props?: ElementCustomProps<"dom", K>) => {
			// keep type as any to avoid unnecessary type issues
			// initialization only
			if (ref == null || ref.name === key) {
				return;
			}
			// console.log("ref is initialized for :: ", key);
			const data = derived.get();
			const [dType, kType] = getElementCustomProps("dom", props);
			const el = element(dType, kType, data);
			for (const k in el) {
				// @ts-ignore
				ref[k] = el[k];
			}
		},
	};
}
