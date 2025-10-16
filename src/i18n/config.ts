import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import fr from './locales/fr.json';
import en from './locales/en.json';

// Détecter la langue du navigateur et utiliser 'fr' par défaut
const getBrowserLanguage = () => {
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage) return savedLanguage;
  
  const browserLang = navigator.language || navigator.languages?.[0];
  if (browserLang?.startsWith('en')) return 'en';
  return 'fr'; // Français par défaut
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en }
    },
    lng: getBrowserLanguage(),
    fallbackLng: 'fr',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

// Sauvegarder la langue à chaque changement
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
