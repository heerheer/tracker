import React, { useState, useEffect, useRef } from 'react';
import { Habit } from '@/types';
import { useTranslation } from 'react-i18next';
import { getSafeLanguage } from '@/utils/locale';

interface HeatmapProps {
    habits: Habit[];
}

const Heatmap: React.FC<HeatmapProps> = ({ habits }) => {
    const { t, i18n } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [daysToShow, setDaysToShow] = useState(35);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                // Each column is 10px (w-2.5) + 4px (gap-1) = 14px
                const cellWidth = 10;
                const gap = 4;
                const columns = Math.floor((width + gap) / (cellWidth + gap));
                // Show at least 2 weeks, max whatever fits
                setDaysToShow(Math.max(14, columns * 7));
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section className="bg-card border border-border rounded-[28px] p-5 paper-shadow space-y-3">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t('widgets.heatmap-title')}</h3>
                <span className="text-[10px] text-primary/70 font-medium">{t('widgets.heatmap-subtitle')}</span>
            </div>
            <div ref={containerRef} className="flex justify-center w-full">
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {Array.from({ length: daysToShow }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (daysToShow - 1 - i));
                        const formattedDate = new Intl.DateTimeFormat(getSafeLanguage(i18n.language), {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                        }).format(date);

                        const dateStr = date.toISOString().split('T')[0];

                        const loggedCount = habits.reduce((acc, h) => acc + (h.logs.some(l => l.date === dateStr) ? 1 : 0), 0);
                        const totalCount = habits.length;
                        const ratio = totalCount > 0 ? loggedCount / totalCount : 0;

                        let colorClass = 'bg-secondary/40';
                        if (ratio > 0.75) colorClass = 'bg-primary';
                        else if (ratio > 0.4) colorClass = 'bg-primary/70';
                        else if (ratio > 0) colorClass = 'bg-primary/30';

                        return (
                            <div
                                key={`${daysToShow}-${i}`}
                                className={`w-2.5 h-2.5 rounded-[2px] ${colorClass} transition-colors duration-500`}
                                title={`${formattedDate}: ${loggedCount}/${totalCount}`}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Heatmap;
