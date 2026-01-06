import React, { useState } from 'react';
import { importContent } from '../api/contentApi';
import './ImportWizard.css';

interface ImportWizardProps {
  contentType: string;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ contentType }) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [dryRun, setDryRun] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleImport = async () => {
    if (!files || files.length === 0) {
      alert('Please select files to import');
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const items: unknown[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const text = await file.text();
        items.push(JSON.parse(text));
      }

      const response = await importContent(contentType, items, dryRun);
      setResult(response);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Import failed' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="import-wizard">
      <h2>Import {contentType}</h2>
      
      <div className="import-wizard-form">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
            />
            {' '}Dry Run (validate only, don't import)
          </label>
        </div>
        
        <div className="form-group">
          <label>Select content files:</label>
          <input
            type="file"
            multiple
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
        
        <button
          onClick={handleImport}
          disabled={importing || !files}
          className="btn-primary"
        >
          {importing ? 'Importing...' : 'Import'}
        </button>
      </div>
      
      {result !== null && (
        <div className="import-result">
          <h3>Import Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
