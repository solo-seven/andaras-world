import React, { useState } from 'react';
import './ContentListView.css';

interface ContentListViewProps {
  contentType: string;
}

export const ContentListView: React.FC<ContentListViewProps> = ({ contentType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items] = useState<unknown[]>([]);

  return (
    <div className="content-list-view">
      <div className="content-list-header">
        <h2>{contentType} Content</h2>
        <div className="content-list-actions">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="content-search"
          />
          <button className="btn-primary">Create New</button>
        </div>
      </div>
      
      <div className="content-list-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4}>No content items found</td>
              </tr>
            ) : (
              items.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>Active</td>
                  <td>
                    <button>View</button>
                    <button>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
