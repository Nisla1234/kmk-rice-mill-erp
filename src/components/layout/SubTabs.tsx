import React from 'react';
import { useApp } from '../../context/AppContext';
import { NAV_ITEMS } from './Sidebar';

export const SubTabs: React.FC = () => {
  const { activeMain, activeSub, setActiveSub } = useApp();

  const currentMain = NAV_ITEMS.find((n) => n.key === activeMain);
  if (!currentMain || currentMain.sub.length === 0) return null;

  return (
    <div className="w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex items-center gap-2 -mx-1 px-1">
      {currentMain.sub.map((s) => {
        const isActive = activeSub === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => setActiveSub(s.key)}
            className={`subtab-pill shrink-0 ${isActive ? 'active' : ''}`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
};
