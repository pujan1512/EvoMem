const express = require('express');
const router = express.Router();
const defineModels = require('../models');

const DEFAULT_TEAM = [
  {
    id: 1,
    name: 'Yash Prakash',
    rollNo: '1024030281',
    email: 'yprakash_be24@thapar.edu',
    role: 'Frontend Developer',
    displayOrder: 1
  },
  {
    id: 2,
    name: 'Pujan Patel',
    rollNo: '1024030278',
    email: 'ppatel_be24@thapar.edu',
    role: 'Backend Developer',
    displayOrder: 2
  },
  {
    id: 3,
    name: 'Tanishk Khandelwal',
    rollNo: '1024030274',
    email: 'tkhandelwal_be24@thapar.edu',
    role: 'Frontend Developer',
    displayOrder: 3
  },
  {
    id: 4,
    name: 'Rudraksh Yadav',
    rollNo: '1024030272',
    email: 'ryadav3_be24@thapar.edu',
    role: 'AI/ML Developer',
    displayOrder: 4
  }
];

async function seedTeamMembers() {
  try {
    const { TeamMember } = defineModels();
    for (const m of DEFAULT_TEAM) {
      const existing = await TeamMember.findByPk(m.id);
      if (existing) {
        await existing.update({
          name: m.name,
          rollNo: m.rollNo,
          email: m.email,
          role: m.role
        });
      } else {
        await TeamMember.create(m);
      }
    }
  } catch (err) {
    console.error('Error seeding team members:', err);
  }
}

// GET /api/team - Fetch all 4 team members
router.get('/', async (req, res) => {
  try {
    const { TeamMember } = defineModels();
    await seedTeamMembers();
    const members = await TeamMember.findAll({ order: [['displayOrder', 'ASC']] });
    return res.json({ success: true, team: members });
  } catch (err) {
    console.error('Get team error:', err);
    return res.json({ success: true, team: DEFAULT_TEAM });
  }
});

module.exports = { router, seedTeamMembers };
