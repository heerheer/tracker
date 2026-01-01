
import React from 'react';
import { TabType } from '../types';

interface DockProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Dock: React.FC<DockProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: '✦' },
    { id: 'records', label: 'Records', icon: '▤' },
    { id: 'settings', label: 'About', icon: '⚙' },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
      <nav className="bg-[#FCFBFC]/90 backdrop-blur-xl border border-[#DBDCD7] rounded-full p-2 flex items-center gap-3 paper-shadow">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`
              relative w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ease-out
              ${activeTab === tab.id 
                ? 'bg-[#66AB71] text-white shadow-lg shadow-[#66AB71]/30 scale-110' 
                : 'text-[#726C62] hover:bg-[#E9E8E2] hover:text-[#413A2C]'}
            `}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Dock;
