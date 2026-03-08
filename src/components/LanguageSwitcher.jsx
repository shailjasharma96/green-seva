import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="language-switcher">
            <Globe size={18} />
            <select
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
                className="lang-select"
            >
                <option value="en">{t('languages.en')}</option>
                <option value="hi">{t('languages.hi')}</option>
            </select>
        </div>
    );
};

export default LanguageSwitcher;
