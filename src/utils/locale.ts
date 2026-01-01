const isChinese = () => {
    const lang = navigator.language;
    return lang.toLowerCase().startsWith('zh');
};

export { isChinese };
