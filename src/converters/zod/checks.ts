const zodNulls = ["undefined", "null", "void", "any", "unknown", "never", "nan"];
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
	/**
	 * Checks if a string matches any of the Zod primitive type return values
	 * @param str The string to check
	 * @returns true if the string matches a Zod primitive type
	 */
	isZodTypeNameNull(str: string): boolean {
		const result = str.endsWith("?") ? str.slice(0, str.length - 1) : str;
		return zodNulls.includes(result);
	},
};
