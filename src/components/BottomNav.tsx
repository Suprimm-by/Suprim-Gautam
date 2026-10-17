import React from 'react';
import { Volume2, Clock, EyeOff, Star, Compass } from 'lucide-react';
import { haptics } from '../services/haptics';

export type MainTabType = 'sounds' | 'triggers' | 'stealth' | 'favorites' | 'spatial';

interface BottomNavProps {
  currentTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onChangeTab }) => {
  const tabs = [
    { id: 'sounds' as MainTabType, label: 'Sounds', icon: Volume2 },
    { id: 'triggers' as MainTabType, label: 'Triggers', icon: Clock },
    { id: 'stealth' as MainTabType, label: 'Stealth', icon: EyeOff },
    { id: 'favorites' as MainTabType, label: 'Favorites', icon: Star },
    { id: 'spatial' as MainTabType, label: '3D Audio', icon: Compass },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#101217]/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1 max-w-lg mx-auto sm:rounded-t-2xl">
      <div className="grid grid-cols-5 items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                haptics.lightTap();
                onChangeTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors rounded-xl select-none ${
                isActive
                  ? 'text-[#00FF66]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'scale-110 bg-[#00FF66]/15' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
