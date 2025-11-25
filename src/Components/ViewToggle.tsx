import React from 'react';

interface Props {
  viewMode: 'treemap' | 'list';
  onViewChange: (mode: 'treemap' | 'list') => void;
}

export const ViewToggle: React.FC<Props> = ({ viewMode, onViewChange }) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={() => onViewChange('treemap')}
        style={{
          padding: '10px 20px',
          marginRight: 10,
          background: viewMode === 'treemap' ? '#007bff' : '#fff',
          color: viewMode === 'treemap' ? '#fff' : '#000',
          border: '1px solid #007bff',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Treemap View
      </button>
      <button
        onClick={() => onViewChange('list')}
        style={{
          padding: '10px 20px',
          background: viewMode === 'list' ? '#007bff' : '#fff',
          color: viewMode === 'list' ? '#fff' : '#000',
          border: '1px solid #007bff',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        List View
      </button>
    </div>
  );
};