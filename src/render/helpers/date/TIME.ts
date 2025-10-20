import type { Extras } from "../../../_model";
import { CALENDAR } from "../../../const";

export default {
	init: (extras: Extras.Date.Out<any>): Extras.Date.Out<any>["TIME"] => {
		const result: Extras.Date.Out<any>["TIME"] = {} as any;
		result.suffix = getLocaleSuffix(extras.locale) as any;
		result.periods = periods(extras);
		result.activePeriod = result.periods?.[0].value;
		//
		return result;
	},
	check: (extras: Extras.Date.Out<any>) => {
		//
		const activeMode = extras.mode.active;
		if (activeMode > CALENDAR.MODE.DAY) {
			extras.TIME.cells = extras[activeMode];
		} else {
			extras.TIME.cells = null as any;
		}

		//
		// extras.TIME.periods = periods(extras);
		// if (extras.TIME.periods != null && extras.TIME.activePeriod == null) {
		// 	extras.TIME.activePeriod = extras.TIME.periods?.[0].value;
		// }
	},
	//
	options: {
		switchPeriod: (option: Extras.Date.Option, extras: Extras.Date.Out<any>) => {
			if (option.type !== CALENDAR.OPTIONS.TIME_PERIOD || extras.TIME.periods == null) {
				return;
			}
			const period = option.value;
			extras.TIME.activePeriod = period;
			for (let i = 0; i < extras.TIME.periods.length; i++) {
				const value = extras.TIME.periods[i];
				value.isSelected = value.value === period;
			}
		},
	},
};

function periods(extras: Extras.Date.Out<any>): Extras.Date.Option[] {
	if (extras.timeFormat !== "12h") {
		return null as any;
	}
	const result: Extras.Date.Option[] = [
		{
			type: CALENDAR.OPTIONS.TIME_PERIOD,
			typeName: "TIME_PERIOD",
			value: "am",
			name: "AM",
			shortName: "AM",
			isSelected: extras.TIME.activePeriod === "am",
		},
		{
			type: CALENDAR.OPTIONS.TIME_PERIOD,
			typeName: "TIME_PERIOD",
			value: "pm",
			name: "PM",
			shortName: "PM",
			isSelected: extras.TIME.activePeriod === "pm",
		},
	];
	return result;
}

//
function getLocaleSuffix(locale: string): typeof timeSuffixes.default {
	const baseLocale = locale.split("-")[0];
	return timeSuffixes[baseLocale] || timeSuffixes.default;
}
const timeSuffixes = {
	// Arabic and Middle Eastern (RTL)
	ar: {
		dir: "rtl",
		short: { hour: "س", minute: "د", second: "ث" },
		long: { hour: "ساعة", minute: "دقيقة", second: "ثانية" },
	},
	he: {
		dir: "rtl",
		short: { hour: "ש", minute: "ד", second: "ש" },
		long: { hour: "שעה", minute: "דקה", second: "שניה" },
	},
	fa: {
		dir: "rtl",
		short: { hour: "س", minute: "د", second: "ث" },
		long: { hour: "ساعت", minute: "دقیقه", second: "ثانیه" },
	},
	ur: {
		dir: "rtl",
		short: { hour: "گ", minute: "م", second: "س" },
		long: { hour: "گھنٹہ", minute: "منٹ", second: "سیکنڈ" },
	},

	// European (LTR)
	en: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "hour", minute: "minute", second: "second" },
	},
	fr: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "heure", minute: "minute", second: "seconde" },
	},
	de: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "Stunde", minute: "Minute", second: "Sekunde" },
	},
	es: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hora", minute: "minuto", second: "segundo" },
	},
	it: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "ora", minute: "minuto", second: "secondo" },
	},
	pt: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hora", minute: "minuto", second: "segundo" },
	},
	nl: {
		dir: "ltr",
		short: { hour: "u", minute: "m", second: "s" },
		long: { hour: "uur", minute: "minuut", second: "seconde" },
	},
	sv: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "timme", minute: "minut", second: "sekund" },
	},
	no: {
		dir: "ltr",
		short: { hour: "t", minute: "m", second: "s" },
		long: { hour: "time", minute: "minutt", second: "sekund" },
	},
	da: {
		dir: "ltr",
		short: { hour: "t", minute: "m", second: "s" },
		long: { hour: "time", minute: "minut", second: "sekund" },
	},
	fi: {
		dir: "ltr",
		short: { hour: "t", minute: "m", second: "s" },
		long: { hour: "tunti", minute: "minuutti", second: "sekunti" },
	},
	pl: {
		dir: "ltr",
		short: { hour: "g", minute: "m", second: "s" },
		long: { hour: "godzina", minute: "minuta", second: "sekunda" },
	},
	cs: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hodina", minute: "minuta", second: "sekunda" },
	},
	sk: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "hodina", minute: "minúta", second: "sekunda" },
	},
	hu: {
		dir: "ltr",
		short: { hour: "ó", minute: "p", second: "mp" },
		long: { hour: "óra", minute: "perc", second: "másodperc" },
	},
	ro: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "oră", minute: "minut", second: "secundă" },
	},
	bg: {
		dir: "ltr",
		short: { hour: "ч", minute: "м", second: "с" },
		long: { hour: "час", minute: "минута", second: "секунда" },
	},
	hr: {
		dir: "ltr",
		short: { hour: "h", minute: "m", second: "s" },
		long: { hour: "sat", minute: "minuta", second: "sekunda" },
	},
	sr: {
		dir: "ltr",
		short: { hour: "ч", minute: "м", second: "с" },
		long: { hour: "сат", minute: "минут", second: "секунд" },
	},

	// Asian (LTR)
	zh: {
		dir: "ltr",
		short: { hour: "时", minute: "分", second: "秒" },
		long: { hour: "小时", minute: "分钟", second: "秒" },
	},
	ja: {
		dir: "ltr",
		short: { hour: "時", minute: "分", second: "秒" },
		long: { hour: "時間", minute: "分", second: "秒" },
	},
	ko: {
		dir: "ltr",
		short: { hour: "시", minute: "분", second: "초" },
		long: { hour: "시간", minute: "분", second: "초" },
	},
	hi: {
		dir: "ltr",
		short: { hour: "घ", minute: "मि", second: "से" },
		long: { hour: "घंटा", minute: "मिनट", second: "सेकंड" },
	},
	th: {
		dir: "ltr",
		short: { hour: "ชม.", minute: "น.", second: "ว." },
		long: { hour: "ชั่วโมง", minute: "นาที", second: "วินาที" },
	},
	vi: {
		dir: "ltr",
		short: { hour: "g", minute: "p", second: "g" },
		long: { hour: "giờ", minute: "phút", second: "giây" },
	},

	// Other (LTR)
	ru: {
		dir: "ltr",
		short: { hour: "ч", minute: "м", second: "с" },
		long: { hour: "час", minute: "минута", second: "секунда" },
	},
	uk: {
		dir: "ltr",
		short: { hour: "г", minute: "х", second: "с" },
		long: { hour: "година", minute: "хвилина", second: "секунда" },
	},
	tr: {
		dir: "ltr",
		short: { hour: "s", minute: "d", second: "s" },
		long: { hour: "saat", minute: "dakika", second: "saniye" },
	},
	el: {
		dir: "ltr",
		short: { hour: "ω", minute: "λ", second: "δ" },
		long: { hour: "ώρα", minute: "λεπτό", second: "δευτερόλεπτο" },
	},

	// Default fallback
	default: {
		dir: "ltr",
		short: { hour: "H", minute: "M", second: "S" },
		long: { hour: "hour", minute: "minute", second: "second" },
	},
};
