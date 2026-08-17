import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {},
            },
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        returnEmptyString: false,
        parseMissingKeyHandler: (key) => {
            const last = key.split('.').pop() || key;
            return last
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/^./, (c) => c.toUpperCase());
        },
    });

export default i18n;