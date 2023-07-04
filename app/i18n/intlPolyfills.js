import { shouldPolyfill as shouldPolyfillLocale } from "@formatjs/intl-locale/should-polyfill";
import { shouldPolyfill as shouldPolyfillPluralRules } from "@formatjs/intl-pluralrules/should-polyfill";

/**
 * @async
 * Asynchronously loads Intl.Locale polyfills.
 */
export async function loadLocalePolyfills() {
  if (shouldPolyfillLocale()) {
    await import("@formatjs/intl-locale/polyfill.js");
  }
}

/**
 * @async
 * Asynchronously loads Intl.PluralRules polyfills for the default locale and current user locale.
 */
export async function loadPluralRulesPolyfills(defaultLocale, locale) {
  const promises = [];
  if (shouldPolyfillPluralRules(defaultLocale)) {
    await import("@formatjs/intl-pluralrules/polyfill-force.js");
    promises.push(loadIntlPluralRulesLocaleData(defaultLocale));
  }
  if (defaultLocale !== locale && shouldPolyfillPluralRules(locale)) {
    promises.push(loadIntlPluralRulesLocaleData(locale));
  }
  await Promise.all(promises);
}

async function loadIntlPluralRulesLocaleData(locale) {
  const pluralRulesLocaleData = {
    cs: () => import("@formatjs/intl-pluralrules/locale-data/cs.js"),
    da: () => import("@formatjs/intl-pluralrules/locale-data/da.js"),
    de: () => import("@formatjs/intl-pluralrules/locale-data/de.js"),
    en: () => import("@formatjs/intl-pluralrules/locale-data/en.js"),
    es: () => import("@formatjs/intl-pluralrules/locale-data/es.js"),
    fi: () => import("@formatjs/intl-pluralrules/locale-data/fi.js"),
    fr: () => import("@formatjs/intl-pluralrules/locale-data/fr.js"),
    it: () => import("@formatjs/intl-pluralrules/locale-data/it.js"),
    ja: () => import("@formatjs/intl-pluralrules/locale-data/ja.js"),
    ko: () => import("@formatjs/intl-pluralrules/locale-data/ko.js"),
    nb: () => import("@formatjs/intl-pluralrules/locale-data/nb.js"),
    nl: () => import("@formatjs/intl-pluralrules/locale-data/nl.js"),
    pl: () => import("@formatjs/intl-pluralrules/locale-data/pl.js"),
    pt: () => import("@formatjs/intl-pluralrules/locale-data/pt.js"),
    "pt-PT": () => import("@formatjs/intl-pluralrules/locale-data/pt-PT.js"),
    sv: () => import("@formatjs/intl-pluralrules/locale-data/sv.js"),
    th: () => import("@formatjs/intl-pluralrules/locale-data/th.js"),
    tr: () => import("@formatjs/intl-pluralrules/locale-data/tr.js"),
    vi: () => import("@formatjs/intl-pluralrules/locale-data/vi.js"),
    zh: () => import("@formatjs/intl-pluralrules/locale-data/zh.js"),
  };

  return (await pluralRulesLocaleData[locale]()).default;
}
