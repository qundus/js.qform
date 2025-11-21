import type { Field, Form, FunctionProps, Attributes } from "../../_model";
import { FIELD } from "../../const";
import { processAttrs } from "../processors/attributes";

export function renderAttributesSelectOption<S extends Field.Setup, O extends Form.Options>(
	basic: FunctionProps.Field<S, O>,
	state: Field.StoreObject<Field.Setup<"select" | "select.radio">, O>,
	// state: Field.StoreObject<S, O>,
	_optionValue: any,
) {
	const { key, options, store, setup } = basic as unknown as FunctionProps.Field<
		Field.Setup<"select" | "select.radio">,
		any
	>;
	// const extras = (state.extras ?? {}) as Extras.SelectOut<S>;
	// prepare option value
	let option = _optionValue;
	let name = "";
	if (option === undefined) {
		option = { label: "unknown", value: "unknown" };
	} else if (typeof option === "string" || typeof option === "number") {
		option = { label: option, value: option };
	}
	if (!(state.extras.valueKey in option) && option.__valueKey == null) {
		if (state.extras.throwOnKeyNotFound) {
			throw new Error(
				`qform: ${key}.select.valueKey<${state.extras.valueKey}>` +
					` does not exist in option ${JSON.stringify(option)}`,
			);
		} else {
			option.__valueKey = "value" in option ? "value" : Object.keys(option)[0];
		}
	}
	// create option name
	try {
		const postfix = String(option[option.__valueKey ?? state.extras.valueKey]);
		name = state.__internal.key + "-" + (typeof postfix === "string" ? postfix : "option");
	} catch (e: any) {
		name = state.__internal.key + "-option";
	}

	//
	const attrs = {
		name, // affects target ability to detect onblur, edit with care
		id: name + "-id",
		// for all select options type
		checked: option.__selected ?? false,
		onClick: (event: PointerEvent) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			const next = { ...store.get() };
			if (next.element.disabled) {
				return;
			}
			//
			const valueKey = next.extras.valueKey ?? "value";
			const labelKey = next.extras.valueKey ?? "label";
			const optionValueKey = option.__valueKey;
			// dynamic check
			if (next.extras?.dynamic) {
				if (next.extras.options == null) {
					next.extras.options = [];
				}
				next.extras.valueKey = valueKey;
				next.extras.labelKey = labelKey;
				const item = next.extras?.options?.find(
					(item) => item[item.__valueKey ?? valueKey] === option[optionValueKey ?? valueKey],
				);
				if (item == null) {
					next.extras.options?.push(option);
				}
			}
			//
			if (Array.isArray(next.value)) {
				const item = next.value.find(
					(item) => item[item.__valueKey ?? valueKey] === option[optionValueKey ?? valueKey],
				);
				if (item == null) {
					next.value.push(option);
				} else {
					next.value = (next.value as any[]).filter(
						(item) => item[item.__valueKey ?? valueKey] !== option[optionValueKey ?? valueKey],
					);
				}
			} else if (next.value == null) {
				next.value = next.element.multiple ? [option] : option;
			} else {
				const same_same =
					next.value[next.value.__valueKey ?? valueKey] === option[optionValueKey ?? valueKey];
				if (same_same && !next.extras.removeOnReselect) {
					// no need for any further updates;
					return;
				}
				next.value = same_same ? undefined : option;
			}

			// special handling for radio buttons
			if (setup.type === "select.radio") {
				if (!next.element.focused) {
					const element = event.target as HTMLElement;
					setTimeout(() => {
						// Attach click listener to document
						document.addEventListener("click", function outsideClick(event) {
							event.preventDefault();
							event.stopImmediatePropagation();
							event.stopPropagation();
							const target = event.target as HTMLElement;
							const name = target?.getAttribute("name");
							// TODO: fix condition as two options can be under the same element somehow
							// causing blur instead of selection for the other option
							if (!element.contains(target)) {
								if (name && name.startsWith(state.__internal.key)) {
									return;
								}
								// Remove the listener after detecting outside click
								// console.log("removing listener ");
								document.removeEventListener("click", outsideClick);
								const next = { ...store.get() };
								next.element.focused = false;
								next.element.visited = true;
								next.__internal.manual = false;
								//
								next.event.DOM = FIELD.DOM.BLUR;
								next.event.MUTATE = FIELD.MUTATE.IDLE;
								next.event.ev = undefined;
								store.set(next);
							}
						});
					}, 50);
				}
				next.element.focused = true;
				next.element.visited = true;
			}

			next.__internal.manual = false;
			//
			next.event.DOM = FIELD.DOM.CLICK_OPTION;
			next.event.MUTATE = FIELD.MUTATE.VALUE;
			next.event.ev = {
				value: (event.target as any).value,
			};
			store.set(next);
		},
	} as any;

	// if radio
	if (setup.type === "select.radio") {
		attrs.type = "radio";
		attrs.required = state?.element.required;
		attrs.disabled = state?.element.disabled;
	}

	return processAttrs(basic, state as any, attrs, "option"); //attrs as Attributes.Objects.SelectOption<S, O, A>;
}
