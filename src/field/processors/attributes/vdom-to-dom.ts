export function vdomToDomAttributes(vdom: any) {
	const result = {} as any;
	for (const k in vdom) {
		if (k === "ref") {
			continue;
		}
		result[k.toLowerCase()] = vdom[k];
	}
	return result;
}
