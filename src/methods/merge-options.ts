// @ts-ignore
import type { OptionsMerged, Options } from "../_model";
import { mergeSetupOptions as mso } from "@qundus/qstate/methods";

export default function mergeSetupOptions<G extends Options<any>, D extends Options<any>>(
	goptions?: G,
	doptions?: D,
) {
	const result = mso(goptions, doptions) as OptionsMerged<G, D>;
	if (result == null) {
		return null;
	}
	return result;
}
