import React, { useState } from 'react';
import './Tabs.css';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTabId?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTabId,
  onTabChange,
  className = '',
}) => {
  const [activeTabId, setActiveTabId] = useState(
    defaultTabId || tabs.find((tab) => !tab.disabled)?.id || tabs[0]?.id
  );

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab && !tab.disabled) {
      setActiveTabId(tabId);
      onTabChange?.(tabId);
    }
  };

  return (
    <div className={`andara-tabs ${className}`}>
      <div className="andara-tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`andara-tab ${activeTabId === tab.id ? 'andara-tab--active' : ''} ${
              tab.disabled ? 'andara-tab--disabled' : ''
            }`}
            onClick={() => handleTabClick(tab.id)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="andara-tabs-panel"
        role="tabpanel"
        id={`tabpanel-${activeTabId}`}
        aria-labelledby={`tab-${activeTabId}`}
      >
        {activeTab?.content}
      </div>
    </div>
  );
};
