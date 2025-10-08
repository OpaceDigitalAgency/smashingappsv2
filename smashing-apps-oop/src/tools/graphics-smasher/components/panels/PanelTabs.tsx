import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGraphicsStore } from '../../state/graphicsStore';
import type { PanelTab } from '../../types';

const PANEL_ORDER: PanelTab[] = ['layers', 'adjustments', 'history', 'properties', 'assets'];

const PanelTabs: React.FC = () => {
  const { t } = useTranslation();
  const activePanel = useGraphicsStore((state) => state.activePanel);
  const setActivePanel = useGraphicsStore((state) => state.setActivePanel);

  return (
    <div className="flex border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white flex-shrink-0 overflow-x-auto">
      {PANEL_ORDER.map((panel) => {
        const isActive = panel === activePanel;
        return (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`relative flex-shrink-0 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
              isActive
                ? 'text-indigo-600'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            {t(`panels.${panel}`)}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PanelTabs;
