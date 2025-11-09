export function isServerSide() {
	return typeof window === "undefined" || typeof document === "undefined";
}
