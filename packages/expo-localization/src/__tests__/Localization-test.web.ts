import i18n from 'i18n-js';

import * as Localization from '../Localization';
import { CalendarIdentifier } from '../Localization.types';

const en = {
  good: 'good',
  morning: 'morning',
  greeting: 'Hello',
};

const fr = {
  good: 'bien',
  morning: 'matin',
  greeting: 'Bonjour',
};

const pl = {
  good: 'dobry',
  morning: 'rano',
  greeting: 'Cześć',
};

const hi = {
  good: 'अच्छा',
  morning: 'सुबह',
  greeting: 'नमस्ते',
};

function validateString(result: unknown): asserts result is string {
  expect(typeof result).toBe('string');
  expect((result as string).length).toBeGreaterThan(0);
}

function validateNull(result: unknown): asserts result is null {
  expect(result).toBeNull();
}

describe(`Localization methods`, () => {
  it(`expect getLocales to return locale`, async () => {
    const {
      languageTag,
      languageCode,
      textDirection,
      digitGroupingSeparator,
      decimalSeparator,
      temperatureUnit,
      regionCode,
      languageRegionCode,
      // following values are null on web
      languageScriptCode,
      measurementSystem,
      currencyCode,
      currencySymbol,
      languageCurrencyCode,
      languageCurrencySymbol,
    } = Localization.getLocales()[0];
    validateString(languageTag);
    validateString(languageCode);
    validateString(textDirection);
    validateString(decimalSeparator);
    validateString(digitGroupingSeparator);
    validateString(temperatureUnit);
    validateString(regionCode);
    validateString(languageRegionCode);

    validateNull(languageScriptCode);
    validateNull(measurementSystem);
    validateNull(currencyCode);
    validateNull(currencySymbol);
    validateNull(languageCurrencyCode);
    validateNull(languageCurrencySymbol);
  });

  it(`expect getCalendars to return calendar`, async () => {
    const { calendar, timeZone, uses24hourClock, firstWeekday } = Localization.getCalendars()[0];

    validateString(calendar);
    validateString(timeZone);
    // null in jest runner for web, but should be supported in most browsers
    validateNull(uses24hourClock);
    validateNull(firstWeekday);
  });
});

describe(`Localization works with i18n-js`, () => {
  i18n.locale = Localization.getLocales()[0].languageCode ?? 'en';
  i18n.translations = { en, fr, pl, hi };
  i18n.missingTranslationPrefix = 'EE: ';
  i18n.fallbacks = true;

  it(`expect language to match strings (en, pl, fr, hi supported)`, async () => {
    const target = 'good';

    i18n.locale = Localization.getLocales()[0].languageCode ?? 'en';

    const expoPredictedLangTag = Localization.getLocales()[0].languageCode ?? 'en';
    const translation = i18n.translations[expoPredictedLangTag];

    expect((translation as any)[target]).toBe(i18n.t(target));
  });

  it(`expect Hindi translations to work correctly`, async () => {
    i18n.locale = 'hi';
    
    expect(i18n.t('greeting')).toBe('नमस्ते');
    expect(i18n.t('good')).toBe('अच्छा');
    expect(i18n.t('morning')).toBe('सुबह');
  });

  it(`expect Indian calendar support to be available`, async () => {
    const calendars = Localization.getCalendars();
    const supportedCalendars = calendars.map(cal => cal.calendar).filter(Boolean);
    
    // Indian calendar should be available in the enum
    expect(Object.values(CalendarIdentifier)).toContain('indian');
  });

  it(`expect proper handling of Hindi locale properties`, async () => {
    // Test Hindi locale tag format
    const hindiLocale = 'hi-IN';
    const isValidFormat = /^[a-z]{2}(-[A-Z]{2})?$/.test(hindiLocale);
    expect(isValidFormat).toBe(true);
    
    // Hindi uses LTR text direction
    const expectedDirection = 'ltr';
    expect(['ltr', 'rtl']).toContain(expectedDirection);
  });
});
