export interface StyleOptions {
	container?: { class?: string; style?: string };
	header?: { class?: string; style?: string };
	navButton?: { class?: string; style?: string };
	monthYear?: { class?: string; style?: string };
	daysHeader?: { class?: string; style?: string };
	day?: { class?: string; style?: string };
	selectedDay?: { class?: string; style?: string };
	today?: { class?: string; style?: string };
	otherMonth?: { class?: string; style?: string };
	disabled?: { class?: string; style?: string };
	rangeDay?: { class?: string; style?: string };
	startDay?: { class?: string; style?: string };
	endDay?: { class?: string; style?: string };
}

export class StyleManager {
	private styles: Required<StyleOptions>;

	constructor(options: StyleOptions = {}) {
		const defaultOptions: Required<StyleOptions> = {
			container: { class: "", style: "" },
			header: { class: "", style: "" },
			navButton: { class: "", style: "" },
			monthYear: { class: "", style: "" },
			daysHeader: { class: "", style: "" },
			day: { class: "", style: "" },
			selectedDay: { class: "", style: "" },
			today: { class: "", style: "" },
			otherMonth: { class: "", style: "" },
			disabled: { class: "", style: "" },
			rangeDay: { class: "", style: "" },
			startDay: { class: "", style: "" },
			endDay: { class: "", style: "" },
		};

		this.styles = { ...defaultOptions, ...options };
	}

	public applyStyles(
		element: HTMLElement,
		styleKey: keyof StyleOptions,
		additionalStyles: Partial<CSSStyleDeclaration> = {},
	): void {
		const styleConfig = this.styles[styleKey];

		// Apply CSS class
		if (styleConfig.class) {
			element.className = styleConfig.class;
		}

		// Apply inline styles
		const parsedStyles = this.parseStyles(styleConfig.style);
		Object.assign(element.style, parsedStyles, additionalStyles);
	}

	public applyClass(element: HTMLElement, styleKey: keyof StyleOptions): void {
		const styleConfig = this.styles[styleKey];
		if (styleConfig.class) {
			element.className = styleConfig.class;
		}
	}

	public applyInlineStyles(
		element: HTMLElement,
		styleKey: keyof StyleOptions,
		additionalStyles: Partial<CSSStyleDeclaration> = {},
	): void {
		const styleConfig = this.styles[styleKey];
		const parsedStyles = this.parseStyles(styleConfig.style);
		Object.assign(element.style, parsedStyles, additionalStyles);
	}

	public getClass(styleKey: keyof StyleOptions): string {
		return this.styles[styleKey].class || "";
	}

	public getInlineStyles(styleKey: keyof StyleOptions): Partial<CSSStyleDeclaration> {
		return this.parseStyles(this.styles[styleKey].style);
	}

	public updateStyles(newStyles: Partial<StyleOptions>): void {
		Object.keys(newStyles).forEach((key) => {
			const styleKey = key as keyof StyleOptions;
			if (newStyles[styleKey]) {
				this.styles[styleKey] = {
					...this.styles[styleKey],
					...newStyles[styleKey],
				};
			}
		});
	}

	private parseStyles(styleString: string | undefined): Partial<CSSStyleDeclaration> {
		if (!styleString) return {};

		const styles: Partial<CSSStyleDeclaration> = {};
		const stylePairs = styleString.split(";").filter((pair) => pair.trim());

		stylePairs.forEach((pair) => {
			const [key, value] = pair.split(":").map((part) => part.trim());
			if (key && value) {
				const camelKey = key.replace(/-([a-z])/g, (g) =>
					g[1].toUpperCase(),
				) as keyof CSSStyleDeclaration;
				styles[camelKey as any] = value;
			}
		});

		return styles;
	}
}
