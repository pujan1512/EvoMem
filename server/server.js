const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDatabase, getSequelize } = require('./config/db');
const defineModels = require('./models');

const { router: authRouter, seedAdminUsers } = require('./routes/auth');
const { router: projectRouter, seedProjectMeta } = require('./routes/project');
const { router: changesRouter, seedChangeLogs } = require('./routes/changes');
const { router: pptRouter, seedDefaultPPT } = require('./routes/ppt');
const { router: teamRouter, seedTeamMembers } = require('./routes/team');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/project', projectRouter);
app.use('/api/changes', changesRouter);
app.use('/api/ppt', pptRouter);
app.use('/api/team', teamRouter);

// Healthcheck & API Root Status
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ status: 'online', message: 'EvoMem Backend Running' });
});

// Serve frontend production build if present
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'EvoMem Backend Service Running' });
  });
}

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    const sequelize = getSequelize();
    defineModels();

    // Sync models
    await sequelize.sync();
    console.log('[Database] Table schemas synchronized successfully.');

    // Seed default data
    await seedAdminUsers();
    await seedProjectMeta();
    await seedChangeLogs();
    await seedTeamMembers();
    console.log('[Database] Default seed data initialized.');

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 EvoMem Backend Server running on port ${PORT}`);
      console.log(`👉 API Base: http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed starting server:', err);
    process.exit(1);
  }
}

startServer();
