export default {
	// Enhanced type guard with File support
	isZodType(obj: unknown): obj is { _def: { typeName: string } } {
		if (typeof File !== "undefined" && obj instanceof File) return true;
		return (
			typeof obj === "object" &&
			obj !== null &&
			"_def" in obj &&
			typeof (obj as any)._def?.typeName === "string"
		);
	},
};
