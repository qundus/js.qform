// https://dev.to/milliemolotov/how-to-retrieve-values-from-all-types-of-html-inputs-in-javascript-3143
import type { CreateProcessorProps, Field } from "../_model";
import { PLACEHOLDERS } from "../const";

export default function createSelectProcessor<F extends Field, Returns>(
	props: CreateProcessorProps<F>,
) {
	const { event, field } = props;
	return (value: any) => {
		const el = event as any;
		const multiple = field.multiple ?? false;
		let result: any = null;
		if (!multiple) {
			// const prev_value = next.values[key] as string;
			if (value !== PLACEHOLDERS.selectButton.value && value !== PLACEHOLDERS.select.value) {
				result = value;
			}
		} else {
			// const prev_value = next.values[key] as string[];
			result = [];
			const options = el != null && el?.target?.options;
			for (let i = 0, iLen = options.length; i < iLen; i++) {
				const opt = options[i];

				if (opt.selected) {
					let value = opt.value;
					if (value !== PLACEHOLDERS.selectButton.value && value !== PLACEHOLDERS.select.value) {
						value = opt.text;
						result.push(value);
					}
				}
			}
		}
		return result;
	};
}
