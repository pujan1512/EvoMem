import React, { useState } from 'react';
import { addChange } from '../services/api';
import { toast } from 'react-toastify';

export default function ChangeForm({ defaultAuthor = '', onChangeAdded }) {
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState(defaultAuthor || 'Yash Prakash');
  const [version, setVersion] = useState('V1');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !author.trim() || !version.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await addChange({ description, author, version });
      if (res.success) {
        toast.success('Change log entry added successfully!');
        setDescription('');
        if (onChangeAdded) onChangeAdded(res.change);
      } else {
        toast.error(res.message || 'Failed to add change entry.');
      }
    } catch (err) {
      toast.error('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flat-panel" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add Change Log Entry</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label-text">Change Description</label>
          <textarea
            className="textarea-box"
            rows="2"
            placeholder="Description of changes made..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-field">
            <label className="form-label-text">Author</label>
            <input
              type="text"
              className="input-box"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label className="form-label-text">Version</label>
            <input
              type="text"
              className="input-box"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="btn-solid" style={{ marginTop: '0.5rem' }} disabled={loading}>
          {loading ? 'Saving...' : '+ Add Change'}
        </button>
      </form>
    </div>
  );
}
