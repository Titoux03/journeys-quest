import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-1 text-xs"
      aria-label="Toggle language"
    >
      <Languages className="w-4 h-4" />
      <span className="font-medium uppercase">
        {i18n.language === 'fr' ? 'EN' : 'FR'}
      </span>
    </Button>
  );
};
