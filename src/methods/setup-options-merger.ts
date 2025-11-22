import type { Form } from "../_model";

export function setupOptionsMerger<G extends Form.Options>(_base?: G) {
	const base = Object.assign({}, _base ?? {}) as G;
	// console.log("onmount copied is :: ", onMount);
	return <D extends Form.Options>(target?: D): Form.OptionsMerged<G, D> => {
		if (target == null) {
			if (base == null) {
				return null as any;
			}
			return base as any;
		}
		const merged = { ...base, ...target };

		// special handling
		if (base?.storeHooks) {
			merged.storeHooks = { ...base.storeHooks, ...target.storeHooks };
		}

		if (base?.onMount != null || target?.onMount != null) {
			merged.onMount = async (props, onchange) => {
				const breturns = (await base?.onMount?.(props, onchange)) ?? undefined;
				const ureturns = (await target?.onMount?.(props, onchange)) ?? undefined;
				// // priority to children
				if (ureturns) {
					return ureturns;
				}
				return breturns;
			};
		}

		if (base?.onEffect != null || target?.onEffect != null) {
			merged.onEffect = (props) => {
				base?.onEffect?.(props);
				target?.onEffect?.(props);
			};
		}

		// field events
		if (base?.fieldsOnChange != null || target?.fieldsOnChange != null) {
			merged.fieldsOnChange = (props) => {
				base?.fieldsOnChange?.(props);
				target?.fieldsOnChange?.(props);
			};
		}

		if (base?.fieldsOnAttrs != null || target?.fieldsOnAttrs != null) {
			merged.fieldsOnAttrs = (props) => {
				base?.fieldsOnAttrs?.(props);
				target?.fieldsOnAttrs?.(props);
			};
		}

		// attributes
		if (base?.attrs != null || target?.attrs != null) {
			merged.attrs = {
				...base.attrs,
				...target.attrs,
			};
			if (merged.attrs.map != null) {
				merged.attrs.map = {
					...base.attrs?.map,
					...target.attrs?.map,
				};
			}
		}

		return merged as any;
	};
}
