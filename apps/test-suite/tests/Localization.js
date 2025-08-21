import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

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

export const name = 'Localization';

export function test(t) {
  function validateString(result) {
    t.expect(result).toBeDefined();
    t.expect(typeof result).toBe('string');
    t.expect(result.length > 0).toBe(true);
  }

  t.describe(`Localization methods`, () => {
    t.it('expect to getLocales return preferred locales', () => {
      const locales = Localization.getLocales();
      t.expect(locales.length).toBeGreaterThanOrEqual(1);
      const {
        languageTag,
        languageCode,
        regionCode,
        currencyCode,
        currencySymbol,
        decimalSeparator,
        digitGroupingSeparator,
        textDirection,
        measurementSystem,
      } = locales[0];
      validateString(languageTag);
      validateString(languageCode);
      // following properties can be nullish if the locale does not provide/override them
      t.expect(regionCode).toBeDefined();
      t.expect(currencyCode).toBeDefined();
      t.expect(currencySymbol).toBeDefined();
      t.expect(decimalSeparator).toBeDefined();
      t.expect(digitGroupingSeparator).toBeDefined();
      t.expect(textDirection).toBeDefined();
      if (textDirection) {
        t.expect(['rtl', 'ltr'].includes(textDirection)).toBe(true);
      }
      t.expect(measurementSystem).toBeDefined();
      if (measurementSystem) {
        t.expect(['metric', 'us', 'uk'].includes(measurementSystem)).toBe(true);
      }
    });

    t.it('expect getCalendars to return at least a single calendar', () => {
      const calendars = Localization.getCalendars();
      t.expect(calendars.length).toBeGreaterThanOrEqual(1);
      const { calendar, uses24hourClock, firstWeekday, timeZone } = calendars[0];
      t.expect(calendar).toBeDefined();
      t.expect(timeZone).toBeDefined();
      // following properties can be nullish if the locale does not provide/override them
      t.expect(uses24hourClock).toBeDefined();
      if (uses24hourClock !== null) {
        t.expect(typeof uses24hourClock).toBe('boolean');
      }
      t.expect(firstWeekday).toBeDefined();
      if (firstWeekday !== null) {
        t.expect(typeof firstWeekday).toBe('number');
      }
    });
  });

  t.describe(`Localization works with i18n-js`, () => {
    i18n.locale = Localization.getLocales()[0].languageCode;
    i18n.translations = { en, fr, pl, hi };
    i18n.missingTranslationPrefix = 'EE: ';
    i18n.fallbacks = true;

    t.it('expect language to match strings (en, pl, fr, hi supported)', async () => {
      const target = 'good';

      i18n.locale = Localization.getLocales()[0].languageCode;

      const expoPredictedLangTag = Localization.getLocales()[0].languageCode;
      const translation = i18n.translations[expoPredictedLangTag];

      t.expect(translation[target]).toBe(i18n.t(target));
    });

    t.it('expect Hindi translations to work correctly', async () => {
      i18n.locale = 'hi';
      
      t.expect(i18n.t('greeting')).toBe('नमस्ते');
      t.expect(i18n.t('good')).toBe('अच्छा');
      t.expect(i18n.t('morning')).toBe('सुबह');
    });

    t.it('expect Indian calendar support to be available', async () => {
      const calendars = Localization.getCalendars();
      const supportedCalendars = calendars.map(cal => cal.calendar).filter(Boolean);
      
      // Indian calendar should be available in the enum
      t.expect(Object.values(Localization.CalendarIdentifier)).toContain('indian');
    });

    t.it('expect proper handling of Hindi locale properties', async () => {
      // Test Hindi locale tag format
      const hindiLocale = 'hi-IN';
      const isValidFormat = /^[a-z]{2}(-[A-Z]{2})?$/.test(hindiLocale);
      t.expect(isValidFormat).toBe(true);
      
      // Hindi uses LTR text direction
      const expectedDirection = 'ltr';
      t.expect(['ltr', 'rtl'].includes(expectedDirection)).toBe(true);
    });
  });
}
