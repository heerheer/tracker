import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Quote {
    content: string;
    author: string;
}


const DailyQuote: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const api = i18n.language.startsWith('zh') ? 'https://v1.hitokoto.cn' : 'https://thequoteshub.com/api/';
        fetch(api)
            .then(res => res.json())
            .then(data => {
                setQuote({ content: data.hitokoto || data.text, author: data.from || data.author });
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch quote', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="bg-[#FCFBFC] border border-[#DBDCD7] rounded-[28px] p-8 paper-shadow text-center flex flex-col items-center justify-center space-y-4 min-h-[140px]">
                <svg className="animate-spin h-6 w-6 text-[#A3BB96]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-[10px] uppercase tracking-widest text-[#726C62] font-medium opacity-50">{t('widgets.quote-loading')}</p>
            </section>
        );
    }

    if (!quote) return null;

    return (
        <section className="bg-[#FCFBFC] border border-[#DBDCD7] rounded-[28px] p-8 paper-shadow text-center space-y-4">
            <p className="text-[#413A2C] font-serif italic text-lg leading-relaxed">"{quote.content}"</p>
            <div className="flex items-center justify-center gap-2">
                <div className="h-px w-4 bg-[#DBDCD7]" />
                <p className="text-[10px] uppercase tracking-widest text-[#726C62] font-medium">{quote.author}</p>
                <div className="h-px w-4 bg-[#DBDCD7]" />
            </div>
        </section>
    );
};

export default DailyQuote;
