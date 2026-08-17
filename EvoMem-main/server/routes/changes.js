const express = require('express');
const router = express.Router();
const defineModels = require('../models');
const { requireAdmin } = require('../middleware/auth');

// Seed initial changes
async function seedChangeLogs() {
  try {
    const { ChangeLog } = defineModels();
    const count = await ChangeLog.count();
    if (count === 0) {
      await ChangeLog.bulkCreate([
        {
          description: 'Added responsive Team Page with interactive hover cards and roll number details.',
          author: 'Yash Prakash',
          version: 'V1',
          dateTimeStr: '10 Aug 2026 · 11:30 PM'
        },
        {
          description: 'Integrated PowerPoint presentation upload and embedded slide viewer modal.',
          author: 'Yash Prakash',
          version: 'V1',
          dateTimeStr: '10 Aug 2026 · 09:15 PM'
        },
        {
          description: 'Implemented solid grey & red theme UI design system adhering strictly to zero gradients directive.',
          author: 'Team Member 3',
          version: 'V1',
          dateTimeStr: '09 Aug 2026 · 04:20 PM'
        },
        {
          description: 'Initial project setup with React, Express, MySQL database, and JWT role-based access control.',
          author: 'Team Member 2',
          version: 'V1',
          dateTimeStr: '08 Aug 2026 · 02:00 PM'
        }
      ]);
    }
  } catch (err) {
    console.error('Error seeding changelogs:', err);
  }
}

// GET /api/changes - Returns change items newest first
router.get('/', async (req, res) => {
  try {
    const { ChangeLog } = defineModels();
    const changes = await ChangeLog.findAll({
      order: [['id', 'DESC']]
    });
    return res.json({ success: true, changes });
  } catch (err) {
    console.error('Get changes error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch changes' });
  }
});

// POST /api/changes - Admin only
router.post('/', requireAdmin, async (req, res) => {
  const { description, author, version } = req.body;

  if (!description || !author || !version) {
    return res.status(400).json({ success: false, message: 'Description, author, and version are required.' });
  }

  try {
    const { ChangeLog } = defineModels();
    
    // Format timestamp: 10 Aug 2026 · 11:30 PM
    const now = new Date();
    const day = now.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const dateTimeStr = `${day} ${month} ${year} · ${hours}:${minutes} ${ampm}`;

    const newChange = await ChangeLog.create({
      description: description.trim(),
      author: author.trim(),
      version: version.trim(),
      dateTimeStr
    });

    return res.status(201).json({ success: true, change: newChange });
  } catch (err) {
    console.error('Add change error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add change log entry.' });
  }
});

// DELETE /api/changes/:id - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { ChangeLog } = defineModels();
    const item = await ChangeLog.findByPk(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Change entry not found.' });
    }

    await item.destroy();
    return res.json({ success: true, message: 'Change entry deleted successfully.', id: parseInt(id, 10) });
  } catch (err) {
    console.error('Delete change error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete change entry.' });
  }
});

module.exports = { router, seedChangeLogs };
