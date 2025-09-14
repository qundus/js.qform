export default function checkFormBasics(basics: any) {
	const err = new Error("form: fields is not in proper format");
	if (basics == null) {
		throw err;
	}
	if (typeof basics !== "object") {
		throw err;
	}
	if (Object.keys(basics).length <= 0) {
		throw err;
	}
}
