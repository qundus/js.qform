import type { ElementDomType, ElementKeysType, ElementProps, Field, FieldState } from "../_model";
// import makeBaseElement from "../elements/element-base";
import makeInputElement from "../elements/element-input";
import makeSelectElement from "../elements/element-select";

type ElementCustomProps<D extends ElementDomType, K extends ElementKeysType> = {
	dType?: D;
	kType?: K;
};
interface Props<F extends Field> {
	derived: FieldState<F>;
}

function getElementCustomProps<D extends ElementDomType, K extends ElementKeysType>(
	dTypeFallback: ElementDomType,
	props?: ElementCustomProps<D, K>,
) {
	return [props?.dType ?? dTypeFallback, props?.kType ?? "all"] as [
		ElementDomType,
		ElementKeysType,
	];
}
export default function getFormElements<F extends Field>(props: Props<F> & ElementProps<F>) {
	const { derived, key, field, $state, options } = props;
	// const baseEl = makeBaseElement({ field, key, $state, options });
	const element =
		"select" === field.type
			? makeSelectElement({ field, key, $state, options })
			: makeInputElement({ field, key, $state, options });

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
		// solidjs
		get solid() {
			return <D extends ElementDomType, K extends ElementKeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				const data = derived.hooks.useSolid();
				const [dType, kType] = getElementCustomProps("dom", props);
				return element(dType, kType, data);
			};
		},
		// preact
		get preact() {
			return <D extends ElementDomType, K extends ElementKeysType>(
				props?: ElementCustomProps<D, K>,
			) => {
				const data = derived.hooks.usePreact();
				const [dType, kType] = getElementCustomProps("vdom", props);
				return element(dType, kType, data);
			};
		},
		// react
		get react() {
			return this.preact;
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
