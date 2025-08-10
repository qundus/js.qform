// @ts-ignore
import type { OptionsMerged, Options } from "../_model";

export default function mergeSetupOptions<G extends Options<any>>(_base?: G) {
	const base = Object.assign({}, _base ?? {}) as G;
	// console.log("onmount copied is :: ", onMount);
	return <D extends Options<any>>(target?: D): OptionsMerged<G, D> => {
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
			merged.onMount = async (props) => {
				const breturns = (await base?.onMount?.(props)) ?? undefined;
				const ureturns = (await target?.onMount?.(props)) ?? undefined;
				// // priority to children
				if (ureturns) {
					return ureturns;
				}
				return breturns;
			};
		}

		if (base?.onChange != null || target?.onChange != null) {
			merged.onChange = (props) => {
				base?.onChange?.(props);
				target?.onChange?.(props);
			};
		}

		return merged as any;
	};
}
