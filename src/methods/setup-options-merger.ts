import type { Form } from "../_model";

export function setupOptionsMerger<G extends Form.Options<any>>(_base?: G) {
	const base = Object.assign({}, _base ?? {}) as G;
	// console.log("onmount copied is :: ", onMount);
	return <D extends Form.Options<any>>(target?: D): Form.OptionsMerged<G, D> => {
		if (target == null) {
			if (base == null) {
				return null as any;
			}
			return base as any;
		}
		const merged = { ...base, ...target };

		// special handling
		if (base?.hooks) {
			merged.hooks = { ...base.hooks, ...target.hooks };
		}

		if (base?.onMount != null || target?.onMount != null) {
			merged.onMount = async (form, update) => {
				const breturns = (await base?.onMount?.(form, update)) ?? undefined;
				const ureturns = (await target?.onMount?.(form, update)) ?? undefined;
				// // priority to children
				if (ureturns) {
					return ureturns;
				}
				return breturns;
			};
		}

		if (base?.onChange != null || target?.onChange != null) {
			merged.onChange = ($next, helpers) => {
				base?.onChange?.($next, helpers);
				target?.onChange?.($next, helpers);
			};
		}

		return merged as any;
	};
}
