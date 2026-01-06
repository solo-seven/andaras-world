import React, { useState } from 'react';
import './ContentEditor.css';

interface ContentEditorProps {
  contentType: string;
  initialContent?: unknown;
  schema?: unknown;
  onSave: (content: unknown) => Promise<void>;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  contentType,
  initialContent,
  onSave,
}) => {
  const [content, setContent] = useState(
    JSON.stringify(initialContent || {}, null, 2)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const parsed = JSON.parse(content);
      await onSave(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-editor">
      <div className="content-editor-header">
        <h2>Edit {contentType}</h2>
        <div className="content-editor-actions">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="content-editor-error">
          {error}
        </div>
      )}
      
      <div className="content-editor-body">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="content-editor-textarea"
          spellCheck={false}
        />
        <p className="content-editor-hint">
          Note: Schema-driven form generation will be implemented with @rjsf/core
        </p>
      </div>
    </div>
  );
};
