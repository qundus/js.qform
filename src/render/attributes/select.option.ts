import type { Field, Form, FunctionProps, Render } from "../../_model";
import { FIELD } from "../../const";

export function renderAttributesSelectOption<
	S extends Field.Setup,
	O extends Form.Options,
	A extends Render.Attributes.Type,
>(
	basic: FunctionProps.Field<S, O>,
	props: FunctionProps.RenderAttributes<S, O, A> & { optionValue: any },
) {
	const { key, options, store, setup } = basic as unknown as FunctionProps.Field<
		Field.Setup<"select" | "select.radio">,
		any
	>;
	const { attrType, reactive, optionValue: _optionValue } = props;
	const state = reactive as unknown as Field.StoreObject<Field.Setup<"select" | "select.radio">>;
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
		// [attrType !== "vdom" ? "autocomplete" : "autoComplete"]: "off",
		// for radio
		// [attrType !== "vdom" ? "onfocus" : "onFocus"]: (event: FocusEvent) => {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// 	event.stopPropagation();
		// 	//
		// 	const next = { ...store.get() };
		// 	next.element.focused = true;
		// 	next.element.visited = true;
		// 	next.__internal.manual = false;
		// 	//
		// 	next.event.DOM = DOM.FOCUS;
		// 	next.event.MUTATE = MUTATE.IDLE;
		// 	next.event.ev = event;
		// 	store.set(next);
		// },
		// [attrType !== "vdom" ? "onblur" : "onBlur"]: (event: Event) => {
		// 	event.preventDefault();
		// 	event.stopImmediatePropagation();
		// 	event.stopPropagation();
		// 	const next = { ...store.get() };
		// 	next.element.focused = false;
		// 	next.element.visited = true;
		// 	next.__internal.manual = false;
		// 	//
		// 	next.event.DOM = DOM.BLUR;
		// 	next.event.MUTATE = MUTATE.IDLE;
		// 	next.event.ev = event;
		// 	store.set(next);
		// },
		// for all select options type
		checked: option.__selected ?? false,
		[attrType !== "vdom" ? "onclick" : "onClick"]: (event: PointerEvent) => {
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
				next.value =
					next.value[next.value.__valueKey ?? valueKey] === option[optionValueKey ?? valueKey]
						? undefined
						: option;
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
				// checked: event.target.value,
			};
			store.set(next);
		},
	} as any;

	// if radio
	if (setup.type === "select.radio") {
		// multiple: state?.element.multiple,
		attrs.type = "radio";
		attrs.required = state?.element.required;
		attrs.disabled = state?.element.disabled;
		// attrs.value =
	}

	// process trigger
	type PP = Parameters<Field.OnRender<Field.Type>>[0];
	const processProps: PP = { key, data: reactive, attrType, attrs, attrFor: "option" };

	options?.onFieldRender?.(processProps);
	setup.onRender?.(processProps);

	// mark rendered
	if (state.event.RENDER === FIELD.RENDER.INIT) {
		const next = { ...store.get() };
		next.event.RENDER = FIELD.RENDER.READY;
		next.event.MUTATE = FIELD.MUTATE.__RENDER;
		store.set(next);
	}
	return attrs as Render.Attributes.SelectOption<S, O, A>;
}
