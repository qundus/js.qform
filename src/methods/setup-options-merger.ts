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
		if (base?.onFieldChange != null || target?.onFieldChange != null) {
			merged.onFieldChange = (props) => {
				base?.onFieldChange?.(props);
				target?.onFieldChange?.(props);
			};
		}

		if (base?.onFieldRender != null || target?.onFieldRender != null) {
			merged.onFieldRender = (props) => {
				base?.onFieldRender?.(props);
				target?.onFieldRender?.(props);
			};
		}

		return merged as any;
	};
}
