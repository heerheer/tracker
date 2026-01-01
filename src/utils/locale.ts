export const isChinese = () => {
    const lang = navigator.language;
    return lang.toLowerCase().startsWith('zh');
};

export const getSafeLanguage = (lang: string) => {
    if (!lang) return 'en';
    return lang.replace('_', '-');
};
