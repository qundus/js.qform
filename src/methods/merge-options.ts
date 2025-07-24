import type { MergedOptions, Options } from "../_model";

export default function mergeOptions<
	G extends Options<any, unknown>,
	D extends Options<any, unknown>,
>(goptions: G, doptions: D) {
	return {
		...goptions,
		...doptions,
		// state:
	} as MergedOptions<G, D>;
}
