const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

function defineModels() {
  const sequelize = getSequelize();

  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'admin' }
  });

  const ProjectMeta = sequelize.define('ProjectMeta', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, defaultValue: 'EvoMem' },
    courseLabel: { type: DataTypes.STRING, defaultValue: 'UCS503 Software Engineering' },
    subtitle: { type: DataTypes.STRING, defaultValue: 'Validated and Retrieval-Gated Experience Memory for Coding Agents' },
    description: { type: DataTypes.TEXT, defaultValue: 'EvoMem is a validated, retrieval-gated experience memory system for autonomous coding agents, built on top of OpenHands. Rather than blindly storing and replaying raw past trajectories, EvoMem distills completed tasks into structured, sandbox-verified experience records and retrieves them using a hybrid of semantic, error-signature, and code-structure signals. A gating mechanism decides when a retrieved memory is safe to use, abstaining when the target repository has drifted too far from the memory\'s original context, and a version-aware invalidation layer retires memories once their underlying dependencies or code no longer match. The core research question is not whether agents can remember — it\'s when past experience helps, when it silently hurts, and how a system can tell the difference. We evaluate EvoMem against four baselines (no memory, OpenHands\' native memory, raw trajectory RAG, and SWE-Bench-CL-style semantic memory) on chronological, leak-free issue sequences across multiple repositories.' },
    version: { type: DataTypes.STRING, defaultValue: 'V1' },
    uploadedDate: { type: DataTypes.STRING, defaultValue: '17 August 2026' },
    techStack: { type: DataTypes.TEXT, defaultValue: JSON.stringify(['OpenHands', 'Sandbox Validation', 'Hybrid Retrieval', 'Retrieval Gating', 'Version Invalidation', 'Negative-Transfer Safeguards']) }
  });

  const ChangeLog = sequelize.define('ChangeLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    author: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.STRING, allowNull: false },
    dateTimeStr: { type: DataTypes.STRING, allowNull: false }
  });

  const PPT = sequelize.define('PPT', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    presentationName: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Presentation' },
    originalFilePath: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    pdfFilePath: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    fileSize: { type: DataTypes.INTEGER, defaultValue: 0 },
    version: { type: DataTypes.STRING, defaultValue: 'V1' },
    uploadedBy: { type: DataTypes.STRING, defaultValue: 'Yash Prakash' },
    uploadedAt: { type: DataTypes.STRING, allowNull: false, defaultValue: '10 Aug 2026' }
  });

  const TeamMember = sequelize.define('TeamMember', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    rollNo: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false },
    displayOrder: { type: DataTypes.INTEGER, defaultValue: 1 }
  });

  return { User, ProjectMeta, ChangeLog, PPT, TeamMember };
}

module.exports = defineModels;
