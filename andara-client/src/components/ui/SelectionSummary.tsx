import React from 'react';
import './SelectionSummary.css';

export interface SelectionSummaryProps {
  selectedOriginName?: string | null;
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  selectedOriginName,
}) => {
  if (!selectedOriginName) {
    return null;
  }

  return (
    <div className="andara-selection-summary">
      <strong>Selected:</strong> {selectedOriginName}
    </div>
  );
};

