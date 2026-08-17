import React from 'react';
import { deleteChange } from '../services/api';
import { toast } from 'react-toastify';

export default function ChangeLog({ changes = [], isAdmin = false, onDeleteChange }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this change log entry?')) return;
    try {
      const res = await deleteChange(id);
      if (res.success) {
        toast.success('Change entry deleted successfully!');
        if (onDeleteChange) onDeleteChange(id);
      } else {
        toast.error(res.message || 'Failed to delete change entry.');
      }
    } catch (err) {
      toast.error('Failed to delete change entry.');
    }
  };

  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 className="changelog-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Changes History Log</span>
        <span style={{ fontSize: '0.8rem', color: '#a3a3a3', fontFamily: 'var(--font-mono)' }}>
          {changes.length} {changes.length === 1 ? 'Entry' : 'Entries'}
        </span>
      </h2>

      {changes.length === 0 ? (
        <div style={{ padding: '1rem', color: '#a3a3a3', fontSize: '0.9rem' }}>
          No changes recorded yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#0d0d0d', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: '#ffffff' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem', color: '#ffffff', fontWeight: 700 }}>Description</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#ffffff', fontWeight: 700, width: '140px' }}>Author</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#ffffff', fontWeight: 700, width: '70px', fontFamily: 'var(--font-mono)' }}>Ver</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#a3a3a3', fontWeight: 700, width: '160px', fontFamily: 'var(--font-mono)' }}>Date / Time</th>
                {isAdmin && (
                  <th style={{ padding: '0.65rem 0.85rem', color: '#ffffff', fontWeight: 700, width: '90px', textAlign: 'center' }}>Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {changes.map((item, idx) => (
                <tr key={item.id || idx} style={{ borderBottom: idx < changes.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#ffffff', fontWeight: 500, lineHeight: 1.4 }}>
                    {item.description}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#ffffff' }}>
                    {item.author}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#ffffff', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {item.version}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', color: '#888888', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {item.dateTimeStr}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center' }}>
                      <button 
                        style={{ 
                          backgroundColor: '#262626', 
                          color: '#ef4444', 
                          border: '1px solid #404040', 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: 'var(--radius)', 
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
