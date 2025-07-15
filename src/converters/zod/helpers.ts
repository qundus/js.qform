function getZodTypeName(schema: any): string {
	// 1. Safety check
	if (typeof schema !== "object" || schema === null) return "unknown";

	const def = (schema as any)._def;
	if (!def || typeof def.typeName !== "string") {
		// Special case for File (not a Zod type but commonly needed in forms)
		if (typeof File !== "undefined" && schema instanceof File) return "file";
		return "unknown";
	}

	// 2. Handle wrappers first (nullable, optional, etc)
	if (def.typeName === "ZodNullable" || def.typeName === "ZodOptional") {
		return getZodTypeName(def.innerType) + (def.typeName === "ZodNullable" ? "?" : "");
	}

	// 3. Handle effects (transform, preprocess, etc)
	if (def.typeName === "ZodEffects") {
		// const effect = def.effect;
		const res = schema?.safeParse?.(null);
		if (res.success) {
			return "null";
		}
		const msg = res.error?.message.toLowerCase();
		if (msg.includes("file")) {
			return "file";
		}
		if (msg.includes("string")) {
			return "string";
		}
		if (msg.includes("boolean")) {
			return "boolean";
		}
		return "effect";
		// return getZodTypeName(def.schema);
	}

	// 4. Core type checks
	switch (def.typeName) {
		// Primitives
		case "ZodString":
			return "string";
		case "ZodNumber":
			return "number";
		case "ZodBoolean":
			return "boolean";
		case "ZodBigInt":
			return "bigint";
		case "ZodDate":
			return "date";
		case "ZodSymbol":
			return "symbol";

		// Special types
		case "ZodFile":
			return "file"; // Custom ZodFile type
		case "ZodBlob":
			return "blob";

		// Empty types
		case "ZodUndefined":
			return "undefined";
		case "ZodNull":
			return "null";
		case "ZodVoid":
			return "void";
		case "ZodAny":
			return "any";
		case "ZodUnknown":
			return "unknown";
		case "ZodNever":
			return "never";
		case "ZodNaN":
			return "nan";

		// Literals
		case "ZodLiteral":
			return `literal:${JSON.stringify(def.value)}`;

		// Enums
		case "ZodEnum":
			return "enum";
		case "ZodNativeEnum":
			return "nativeEnum";
	}

	// 5. Complex types (with recursion)
	if (def.typeName === "ZodArray") {
		return `array<${getZodTypeName(def.type)}>`;
	}

	if (def.typeName === "ZodObject") {
		return "object";
	}

	if (def.typeName === "ZodRecord") {
		return `record<${getZodTypeName(def.valueType)}>`;
	}

	if (def.typeName === "ZodUnion") {
		return def.options.map(getZodTypeName).join(" | ");
	}

	if (def.typeName === "ZodIntersection") {
		return `${getZodTypeName(def.left)} & ${getZodTypeName(def.right)}`;
	}

	if (def.typeName === "ZodTuple") {
		return `[${def.items.map(getZodTypeName).join(", ")}]`;
	}

	// 6. Fallback - try to extract meaningful name
	const fallback = def.typeName?.replace(/^Zod/, "").toLowerCase();
	return fallback || "unknown";
}

export default {
	getZodTypeName,
};
