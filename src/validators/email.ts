import { z } from "zod";

export function isEmail(value: any) {
	return z.string().email().safeParse(value);
}
