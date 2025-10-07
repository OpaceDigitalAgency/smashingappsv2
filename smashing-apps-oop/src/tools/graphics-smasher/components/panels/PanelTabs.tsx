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
    <div className="flex border-b border-slate-200">
      {PANEL_ORDER.map((panel) => {
        const isActive = panel === activePanel;
        return (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              isActive ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {t(`panels.${panel}`)}
          </button>
        );
      })}
    </div>
  );
};

export default PanelTabs;
