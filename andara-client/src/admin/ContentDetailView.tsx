import React from 'react';
import './ContentDetailView.css';

interface ContentDetailViewProps {
  contentType: string;
  contentId: string;
  content: unknown;
}

export const ContentDetailView: React.FC<ContentDetailViewProps> = ({
  contentType,
  contentId,
  content,
}) => {
  return (
    <div className="content-detail-view">
      <div className="content-detail-header">
        <h2>{contentType} - {contentId}</h2>
        <button className="btn-primary">Edit</button>
      </div>
      
      <div className="content-detail-body">
        <pre className="content-json-viewer">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>
    </div>
  );
};
