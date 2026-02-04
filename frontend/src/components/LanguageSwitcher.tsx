import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import i18nInstance from '../i18n';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const currentLang = i18n?.language || i18nInstance.language || 'es';
    const newLang = currentLang === 'es' ? 'en' : 'es';
    if (i18n && typeof i18n.changeLanguage === 'function') {
      i18n.changeLanguage(newLang);
    } else if (i18nInstance && typeof i18nInstance.changeLanguage === 'function') {
      i18nInstance.changeLanguage(newLang);
    }
  };

  return (
    <Tooltip title={i18n.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}>
      <IconButton
        onClick={toggleLanguage}
        sx={{
          color: 'text.secondary',
          transition: 'all 0.3s',
          '&:hover': {
            color: 'primary.main',
            transform: 'scale(1.1)',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
          },
        }}
      >
        <LanguageIcon />
      </IconButton>
    </Tooltip>
  );
};

export default LanguageSwitcher;
