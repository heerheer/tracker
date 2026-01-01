
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <h1 className="text-3xl font-serif italic text-[#413A2C]">About</h1>
      
      <div className="bg-[#FCFBFC] border border-[#DBDCD7] rounded-[28px] p-8 paper-shadow space-y-8">
        <div className="space-y-4 text-center py-8">
           <div className="w-20 h-20 bg-[#E9E8E2] rounded-[24px] mx-auto flex items-center justify-center text-4xl paper-shadow border border-white">
            📜
           </div>
           <div>
            <h2 className="text-xl font-serif text-[#413A2C]">Ethereal Habits</h2>
            <p className="text-[#726C62] text-sm italic">Mindful consistency on paper.</p>
           </div>
        </div>

        <div className="border-t border-[#DBDCD7] pt-8 space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#726C62] font-medium uppercase tracking-widest text-[10px]">Version</span>
            <span className="text-[#413A2C] font-mono">1.0.4-aura</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#726C62] font-medium uppercase tracking-widest text-[10px]">Release</span>
            <span className="text-[#413A2C]">Spring '25 Edition</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[#726C62] font-medium uppercase tracking-widest text-[10px]">Repository</span>
            <a 
              href="https://github.com/heerheer/tracker" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#66AB71] hover:underline font-medium"
            >
              heerheer/tracker
            </a>
          </div>
        </div>

        <div className="pt-4 text-center">
          <p className="text-[10px] text-[#726C62] uppercase tracking-[0.2em]">Designed with love & intention</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
