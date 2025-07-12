import type { CreateProcessorProps, Field } from "../_model";

export default function createNumberProcessor<F extends Field, Returns>(
	_props: CreateProcessorProps<F>,
) {
	// const { field } = _props;
	return (value: any) => {
		let result = null as number;
		try {
			result = Number(value);
			if (Number.isNaN(result)) {
				result = value;
			}
		} catch (e) {
			result = value;
		}
		return result;
	};
}
