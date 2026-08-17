const express = require('express');
const router = express.Router();
const defineModels = require('../models');
const { requireAdmin } = require('../middleware/auth');

// Seed default project metadata
async function seedProjectMeta() {
  try {
    const { ProjectMeta } = defineModels();
    const existing = await ProjectMeta.findByPk(1);
    const evoMeta = {
      id: 1,
      name: 'EvoMem',
      courseLabel: 'UCS503 Software Engineering',
      subtitle: 'Validated and Retrieval-Gated Experience Memory for Coding Agents',
      description: 'EvoMem is a validated, retrieval-gated experience memory system for autonomous coding agents, built on top of OpenHands. Rather than blindly storing and replaying raw past trajectories, EvoMem distills completed tasks into structured, sandbox-verified experience records and retrieves them using a hybrid of semantic, error-signature, and code-structure signals. A gating mechanism decides when a retrieved memory is safe to use, abstaining when the target repository has drifted too far from the memory\'s original context, and a version-aware invalidation layer retires memories once their underlying dependencies or code no longer match. The core research question is not whether agents can remember — it\'s when past experience helps, when it silently hurts, and how a system can tell the difference. We evaluate EvoMem against four baselines (no memory, OpenHands\' native memory, raw trajectory RAG, and SWE-Bench-CL-style semantic memory) on chronological, leak-free issue sequences across multiple repositories.',
      version: 'V1',
      uploadedDate: '17 August 2026',
      techStack: JSON.stringify(['OpenHands', 'Sandbox Validation', 'Hybrid Retrieval', 'Retrieval Gating', 'Version Invalidation', 'Negative-Transfer Safeguards'])
    };
    if (!existing) {
      await ProjectMeta.create(evoMeta);
    } else {
      await existing.update(evoMeta);
    }
  } catch (err) {
    console.error('Error seeding project metadata:', err);
  }
}

// GET /api/project
router.get('/', async (req, res) => {
  try {
    const { ProjectMeta, PPT } = defineModels();
    let meta = await ProjectMeta.findByPk(1);
    
    if (!meta) {
      await seedProjectMeta();
      meta = await ProjectMeta.findByPk(1);
    }

    const activePPT = await PPT.findOne({ order: [['id', 'DESC']] });

    const responseData = meta ? meta.toJSON() : {
      name: 'EvoMem',
      courseLabel: 'UCS503 Software Engineering',
      subtitle: 'Validated and Retrieval-Gated Experience Memory for Coding Agents',
      description: 'EvoMem is a validated, retrieval-gated experience memory system for autonomous coding agents, built on top of OpenHands.',
      version: 'V1',
      uploadedDate: '17 August 2026',
      techStack: JSON.stringify(['OpenHands', 'Sandbox Validation', 'Hybrid Retrieval', 'Retrieval Gating', 'Version Invalidation', 'Negative-Transfer Safeguards'])
    };

    responseData.techStackArray = typeof responseData.techStack === 'string' 
      ? JSON.parse(responseData.techStack) 
      : (responseData.techStack || ['OpenHands', 'Sandbox Validation', 'Hybrid Retrieval', 'Retrieval Gating', 'Version Invalidation', 'Negative-Transfer Safeguards']);

    responseData.hasPPT = !!activePPT;
    responseData.pptInfo = activePPT ? {
      id: activePPT.id,
      presentationName: activePPT.presentationName,
      uploadedAt: activePPT.uploadedAt,
      version: activePPT.version
    } : null;

    return res.json({ success: true, project: responseData });
  } catch (err) {
    console.error('Get project error:', err);
    return res.json({
      success: true,
      project: {
        name: 'EvoMem',
        courseLabel: 'UCS503 Software Engineering',
        subtitle: 'Validated and Retrieval-Gated Experience Memory for Coding Agents',
        description: 'EvoMem is a validated, retrieval-gated experience memory system for autonomous coding agents, built on top of OpenHands.',
        version: 'V1',
        uploadedDate: '17 August 2026',
        techStackArray: ['OpenHands', 'Sandbox Validation', 'Hybrid Retrieval', 'Retrieval Gating', 'Version Invalidation', 'Negative-Transfer Safeguards'],
        hasPPT: false
      }
    });
  }
});

// PUT /api/project (Admin only)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const { ProjectMeta } = defineModels();
    let meta = await ProjectMeta.findByPk(1);
    const { version, uploadedDate, description, techStack } = req.body;

    if (!meta) {
      meta = await ProjectMeta.create({ id: 1 });
    }

    if (version) meta.version = version;
    if (uploadedDate) meta.uploadedDate = uploadedDate;
    if (description) meta.description = description;
    if (techStack) meta.techStack = JSON.stringify(techStack);

    await meta.save();
    return res.json({ success: true, project: meta });
  } catch (err) {
    console.error('Update project error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update project data.' });
  }
});

module.exports = { router, seedProjectMeta };
