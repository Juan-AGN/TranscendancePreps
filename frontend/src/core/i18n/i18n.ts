import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locals/es.json';
import en from './locals/en.json';
import fr from './locals/fr.json';


i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            es: {translation: es },
            en: {translation: en },
            fr: {translation: fr },
        },
        fallbackLng: 'en',
        supportedLngs: ['es', 'en', 'fr'],
        detection: {
            order: ['localStorage'],
            caches: ['localStorage'],
        },
        interpolation: {
            escapeValue: false,
        },
    })

export default i18n;