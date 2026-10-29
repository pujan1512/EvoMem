const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Absolute path to the EvoMem python scripts root folder (New folder (2))
const EVOMEM_PYTHON_ROOT = path.join(__dirname, '..', '..', '..', 'New folder (2)');

// Helper function to safely execute python script
function runPythonScript(scriptName, args = [], cwd = EVOMEM_PYTHON_ROOT) {
  return new Promise((resolve, reject) => {
    // Detect python executable path
    const windowsPythonPath = 'C:\\Users\\yashy\\AppData\\Local\\Python\\bin\\python.exe';
    let pythonExecutable = 'python';
    if (process.platform === 'win32' && fs.existsSync(windowsPythonPath)) {
      pythonExecutable = `"${windowsPythonPath}"`;
    } else if (process.platform !== 'win32') {
      pythonExecutable = 'python3';
    }

    const child = spawn(pythonExecutable, [scriptName, ...args], {
      cwd,
      shell: true,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, stdout, stderr });
      } else {
        resolve({ success: false, code, stdout, stderr });
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

// 1. GET /api/evomem/phases - List available phase directories and trajectory/experience/retrieval/validation files
router.get('/phases', (req, res) => {
  try {
    if (!fs.existsSync(EVOMEM_PYTHON_ROOT)) {
      return res.status(404).json({ success: false, message: 'EvoMem python repository not found' });
    }

    const items = fs.readdirSync(EVOMEM_PYTHON_ROOT, { withFileTypes: true });
    const phases = items
      .filter((item) => item.isDirectory() && (item.name.startsWith('phase-') || item.name === 'phase-1'))
      .map((item) => {
        const phasePath = path.join(EVOMEM_PYTHON_ROOT, item.name);
        const trajPath = path.join(phasePath, 'trajectory_logs', 'trajectory.json');
        const expPath = path.join(phasePath, 'experience', 'experience.json');
        const memoryPath = path.join(phasePath, 'experience', 'memory.json');
        const indexPath = path.join(phasePath, 'retrieval', 'index.json');
        const validatedPath = path.join(phasePath, 'validation', 'validated', 'memory.json');

        const solDir = path.join(phasePath, 'sol');
        const hasSolution = fs.existsSync(solDir) && fs.readdirSync(solDir).filter(f => !f.startsWith('.')).length > 0;

        return {
          id: item.name,
          name: item.name.toUpperCase().replace('-', ' '),
          hasTrajectory: fs.existsSync(trajPath),
          hasExperience: fs.existsSync(expPath),
          hasDistilled: fs.existsSync(memoryPath),
          hasMemory: fs.existsSync(memoryPath),
          hasIndex: fs.existsSync(indexPath),
          hasValidated: fs.existsSync(validatedPath),
          hasSolution
        };
      });

    res.json({ success: true, phases, evomemRoot: EVOMEM_PYTHON_ROOT });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET /api/evomem/data/:phase - Get trajectory, experience, memory.json, index.json, and validation data for a phase
router.get('/data/:phase', (req, res) => {
  try {
    const phase = req.params.phase || 'phase-1';
    const phasePath = path.join(EVOMEM_PYTHON_ROOT, phase);

    if (!fs.existsSync(phasePath)) {
      return res.status(404).json({ success: false, message: `Phase directory '${phase}' not found` });
    }

    const trajPath = path.join(phasePath, 'trajectory_logs', 'trajectory.json');
    const expPath = path.join(phasePath, 'experience', 'experience.json');
    const memoryPath = path.join(phasePath, 'experience', 'memory.json');
    const indexPath = path.join(phasePath, 'retrieval', 'index.json');
    const validatedPath = path.join(phasePath, 'validation', 'validated', 'memory.json');

    let trajectory = null;
    let experience = null;
    let memory = null;
    let index = null;
    let validatedMemory = null;
    let problemCode = null;
    let solutionCode = null;

    // Read problem directory file
    const problemDir = path.join(phasePath, 'problem');
    if (fs.existsSync(problemDir)) {
      const pFiles = fs.readdirSync(problemDir).filter((f) => !f.startsWith('.'));
      if (pFiles.length > 0) {
        const pPath = path.join(problemDir, pFiles[0]);
        if (fs.statSync(pPath).isFile()) {
          problemCode = {
            filename: pFiles[0],
            content: fs.readFileSync(pPath, 'utf8')
          };
        }
      }
    }

    // Read sol directory file
    const solDir = path.join(phasePath, 'sol');
    if (fs.existsSync(solDir)) {
      const sFiles = fs.readdirSync(solDir).filter((f) => !f.startsWith('.'));
      if (sFiles.length > 0) {
        const sPath = path.join(solDir, sFiles[0]);
        if (fs.statSync(sPath).isFile()) {
          solutionCode = {
            filename: sFiles[0],
            content: fs.readFileSync(sPath, 'utf8')
          };
        }
      }
    }

    if (fs.existsSync(trajPath)) {
      try {
        trajectory = JSON.parse(fs.readFileSync(trajPath, 'utf8'));
      } catch (e) {
        trajectory = { error: 'Failed parsing trajectory.json' };
      }
    }

    if (fs.existsSync(expPath)) {
      try {
        experience = JSON.parse(fs.readFileSync(expPath, 'utf8'));
      } catch (e) {
        experience = { error: 'Failed parsing experience.json' };
      }
    }

    if (fs.existsSync(memoryPath)) {
      try {
        memory = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
      } catch (e) {
        memory = { error: 'Failed parsing memory.json' };
      }
    }

    if (fs.existsSync(indexPath)) {
      try {
        index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      } catch (e) {
        index = { error: 'Failed parsing index.json' };
      }
    }

    if (fs.existsSync(validatedPath)) {
      try {
        validatedMemory = JSON.parse(fs.readFileSync(validatedPath, 'utf8'));
      } catch (e) {
        validatedMemory = { error: 'Failed parsing validated memory.json' };
      }
    }

    res.json({
      success: true,
      phase,
      trajectory,
      experience,
      distilled: memory || validatedMemory,
      memory,
      index,
      validatedMemory,
      problemCode,
      solutionCode
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST /api/evomem/run-orchestrator - Trigger agent orchestrator on target phase
router.post('/run-orchestrator', async (req, res) => {
  const { phase = 'phase-1' } = req.body;
  try {
    const result = await runPythonScript('orchestrate.py', [phase]);
    res.json({
      success: result.success,
      phase,
      output: result.stdout,
      error: result.stderr
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /api/evomem/extract-experience - Trigger experience extraction for a phase
router.post('/extract-experience', async (req, res) => {
  const { phase = 'phase-1' } = req.body;
  try {
    const scriptPath = path.join(phase, 'extract_experience.py');
    const result = await runPythonScript(scriptPath, []);
    res.json({
      success: result.success,
      phase,
      output: result.stdout,
      error: result.stderr
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. POST /api/evomem/distill-experience - Trigger memory distillation for a phase
router.post('/distill-experience', async (req, res) => {
  const { phase = 'phase-1' } = req.body;
  try {
    const scriptPath = path.join(phase, 'distill_experience.py');
    const result = await runPythonScript(scriptPath, []);
    res.json({
      success: result.success,
      phase,
      output: result.stdout,
      error: result.stderr
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. POST /api/evomem/validate-memory - Trigger memory validation for a phase
router.post('/validate-memory', async (req, res) => {
  const { phase = 'phase-1' } = req.body;
  try {
    const scriptPath = path.join(phase, 'validation', 'validate_experience.py');
    const cwd = path.join(EVOMEM_PYTHON_ROOT, phase, 'validation');
    const result = await runPythonScript(scriptPath, [], cwd);
    res.json({
      success: result.success,
      phase,
      output: result.stdout,
      error: result.stderr
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. POST /api/evomem/build-index - Trigger retrieval index build for a phase
router.post('/build-index', async (req, res) => {
  const { phase = 'phase-1' } = req.body;
  try {
    const scriptPath = path.join(phase, 'retrieval', 'build_index.py');
    const cwd = path.join(EVOMEM_PYTHON_ROOT, phase, 'retrieval');
    const result = await runPythonScript(scriptPath, [], cwd);
    res.json({
      success: result.success,
      phase,
      output: result.stdout,
      error: result.stderr
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. POST /api/evomem/create-problem - Create a new phase folder with a LeetCode problem template
router.post('/create-problem', (req, res) => {
  try {
    const { phaseName, problemTitle, language = 'cpp', problemCode } = req.body;
    if (!phaseName || !problemTitle || !problemCode) {
      return res.status(400).json({ success: false, message: 'phaseName, problemTitle, and problemCode are required' });
    }

    const safePhaseId = phaseName.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    const phaseDir = path.join(EVOMEM_PYTHON_ROOT, safePhaseId);
    const problemDir = path.join(phaseDir, 'problem');
    const solDir = path.join(phaseDir, 'sol');

    fs.mkdirSync(problemDir, { recursive: true });
    fs.mkdirSync(solDir, { recursive: true });

    // File extension mapping
    const extMap = { cpp: 'cpp', python: 'py', py: 'py', java: 'java', js: 'js', javascript: 'js' };
    const ext = extMap[language.toLowerCase()] || 'cpp';
    const safeTitle = problemTitle.replace(/[/\\?%*:|"<>]/g, '');
    const problemFilePath = path.join(problemDir, `${safeTitle}.${ext}`);

    fs.writeFileSync(problemFilePath, problemCode, 'utf8');

    // Copy script templates from phase-1 if missing
    const srcPhase = path.join(EVOMEM_PYTHON_ROOT, 'phase-1');
    const copyList = [
      'extract_experience.py',
      'distill_experience.py'
    ];

    copyList.forEach((file) => {
      const srcFile = path.join(srcPhase, file);
      const dstFile = path.join(phaseDir, file);
      if (fs.existsSync(srcFile) && !fs.existsSync(dstFile)) {
        fs.copyFileSync(srcFile, dstFile);
      }
    });

    // Copy retrieval and validation folders if missing
    const dirList = ['retrieval', 'validation'];
    dirList.forEach((d) => {
      const srcDir = path.join(srcPhase, d);
      const dstDir = path.join(phaseDir, d);
      if (fs.existsSync(srcDir) && !fs.existsSync(dstDir)) {
        fs.cpSync(srcDir, dstDir, { recursive: true });
      }
    });

    res.json({
      success: true,
      phaseId: safePhaseId,
      filePath: problemFilePath,
      message: `Problem '${problemTitle}' created successfully in ${safePhaseId}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { router };
