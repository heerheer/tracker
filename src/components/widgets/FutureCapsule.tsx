import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface FutureCapsuleProps {
    title: string;
    description?: string;
    targetDate: string;
    onEdit?: () => void;
}

const FutureCapsule: React.FC<FutureCapsuleProps> = ({ title, description, targetDate, onEdit }) => {
    const { t } = useTranslation();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });

    useEffect(() => {
        const calculateTime = () => {
            const target = new Date(targetDate);
            const diff = target.getTime() - Date.now();
            const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
            const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
            setTimeLeft({ days, hours });
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000 * 60 * 60); // Update every hour
        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <section
            onClick={onEdit}
            className="bg-[#66AB71] rounded-[28px] p-8 paper-shadow text-white relative overflow-hidden group cursor-pointer active:scale-95 transition-transform duration-300"
        >
            <div className="absolute top-0 right-0 p-4 opacity-20 text-4xl transform rotate-12 group-hover:scale-110 transition-transform duration-500">⏳</div>
            <div className="relative z-10 space-y-4">
                <div className="space-y-1 font-serif">
                    <h3 className="text-xs uppercase tracking-widest font-bold opacity-80">{title}</h3>
                    {description && <p className="text-[10px] opacity-70 font-medium">{description}</p>}
                </div>
                <div className="flex gap-4 items-baseline">
                    <div className="flex flex-col">
                        <span className="text-5xl font-serif">{timeLeft.days}</span>
                        <span className="text-[10px] uppercase tracking-tighter opacity-70">{t('widgets.days')}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-serif">{timeLeft.hours}</span>
                        <span className="text-[10px] uppercase tracking-tighter opacity-70">{t('widgets.hours')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FutureCapsule;
