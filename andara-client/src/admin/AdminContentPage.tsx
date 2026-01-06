import React, { useState } from 'react';
import { ContentListView } from './ContentListView';
import { ContentDetailView } from './ContentDetailView';
import { ContentEditor } from './ContentEditor';
import { ImportWizard } from './ImportWizard';
import './AdminContentPage.css';

export const AdminContentPage: React.FC = () => {
  const [selectedContentType, setSelectedContentType] = useState<string>('ITEM_TEMPLATE');
  const [view, setView] = useState<'list' | 'detail' | 'edit' | 'import'>('list');
  const [selectedContent] = useState<unknown>(null);

  const contentTypes = [
    'ITEM_TEMPLATE',
    'SKILL_DEFINITION',
    'ABILITY_DEFINITION',
    'RECIPE',
    'REGION_DEFINITION',
    'ZONE_TEMPLATE',
    'POI_TEMPLATE',
    'NPC_TEMPLATE',
    'FACTION_DEFINITION',
    'ENCOUNTER_TEMPLATE',
    'DIALOGUE_TREE',
  ];

  return (
    <div className="admin-content-page">
      <div className="admin-sidebar">
        <h2>Content Management</h2>
        <nav>
          {contentTypes.map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedContentType(type);
                setView('list');
              }}
              className={selectedContentType === type ? 'active' : ''}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </nav>
        <div className="admin-actions">
          <button onClick={() => setView('import')} className="btn-primary">
            Import Content
          </button>
        </div>
      </div>
      
      <div className="admin-content-area">
        {view === 'list' && (
          <ContentListView contentType={selectedContentType} />
        )}
        {view === 'detail' && selectedContent !== null && (
          <ContentDetailView
            contentType={selectedContentType}
            contentId=""
            content={selectedContent}
          />
        )}
        {view === 'edit' && (
          <ContentEditor
            contentType={selectedContentType}
            onSave={async () => {
              // TODO: Implement save
            }}
          />
        )}
        {view === 'import' && (
          <ImportWizard contentType={selectedContentType} />
        )}
      </div>
    </div>
  );
};
