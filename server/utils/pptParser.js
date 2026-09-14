const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const xml2js = require('xml2js');

/**
 * Parses a .pptx file and extracts slide content (titles, text nodes, bullet points, paragraphs, background colors)
 */
async function parsePPTX(filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileData);

    // Find all slide XML files inside ppt/slides/
    const slideFiles = [];
    zip.forEach((relativePath) => {
      if (relativePath.match(/^ppt\/slides\/slide\d+\.xml$/i)) {
        slideFiles.push(relativePath);
      }
    });

    // Sort slide files numerically (slide1.xml, slide2.xml, ...)
    slideFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });

    if (slideFiles.length === 0) {
      return generateFallbackSlides(path.basename(filePath));
    }

    const slides = [];
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });

    for (let i = 0; i < slideFiles.length; i++) {
      const slidePath = slideFiles[i];
      const xmlContent = await zip.file(slidePath).async('text');
      const parsedXml = await parser.parseStringPromise(xmlContent);

      // Extract text content from XML tags (a:t)
      const textNodes = [];
      extractTextNodes(parsedXml, textNodes);

      // Extract background color if present
      let bgColor = null;
      try {
        const xmlString = JSON.stringify(parsedXml);
        const hexMatch = xmlString.match(/"val":"([0-9A-Fa-f]{6})"/);
        if (hexMatch && hexMatch[1]) {
          bgColor = `#${hexMatch[1]}`;
        }
      } catch (e) {}

      const slideTitle = textNodes[0] || `Slide ${i + 1}`;
      const bodyTexts = textNodes.slice(1);

      // Separate bullets vs paragraphs
      const bullets = [];
      const paragraphs = [];

      bodyTexts.forEach((text) => {
        if (text.length > 0) {
          if (text.length < 140 && !text.endsWith('.')) {
            bullets.push(text);
          } else {
            paragraphs.push(text);
          }
        }
      });

      slides.push({
        slideNumber: i + 1,
        title: slideTitle,
        bullets: bullets.length > 0 ? bullets : (bodyTexts.length > 0 ? bodyTexts : ['Key topic details and discussion points']),
        paragraphs: paragraphs,
        subtitle: `EvoMem Presentation Deck - Slide ${i + 1}`,
        bgColor: bgColor || null
      });
    }

    return slides;
  } catch (err) {
    console.error('[PPT Parser Error]', err);
    return generateFallbackSlides(path.basename(filePath));
  }
}

/**
 * Recursively extracts text elements from parsed PPTX XML
 */
function extractTextNodes(obj, results = []) {
  if (!obj) return;
  if (typeof obj === 'string') {
    return;
  }

  for (const key in obj) {
    if (key === 'a:t' || key === 't') {
      const val = obj[key];
      if (typeof val === 'string' && val.trim().length > 0) {
        results.push(val.trim());
      } else if (val && val._ && typeof val._ === 'string') {
        results.push(val._.trim());
      }
    } else if (typeof obj[key] === 'object') {
      extractTextNodes(obj[key], results);
    }
  }
}

/**
 * Generates clean presentation slides fallback
 */
function generateFallbackSlides(fileName) {
  return [
    {
      slideNumber: 1,
      title: 'EvoMem – Validated and Retrieval-Gated Experience Memory for Coding Agents',
      subtitle: fileName || 'UCS503 Software Engineering Course Project',
      bullets: [
        'Software Engineering Final Research Project Presentation',
        'Validated and Retrieval-Gated Experience Memory for Autonomous Coding Agents',
        'Presented by Yash Prakash, Pujan Patel, Tanishk Khandelwal & Rudraksh Yadav'
      ],
      paragraphs: [
        'EvoMem is built on top of OpenHands to distill completed tasks into structured, sandbox-verified experience records with hybrid retrieval and abstention.'
      ],
      bgColor: '#0f172a'
    },
    {
      slideNumber: 2,
      title: 'Problem Motivation & Trajectory Transfer',
      subtitle: 'Experience Memory in Autonomous Coding Agents',
      bullets: [
        'Raw trajectory replay silently hurts performance when repos drift over time',
        'Traditional RAG lacks sandbox validation, version invalidation, and transfer gating',
        'EvoMem evaluates when past experience helps vs. silently harms coding agents'
      ],
      paragraphs: [
        'EvoMem provides a retrieval-gated experience memory system that abstains when transfer looks unsafe or low-confidence.'
      ],
      bgColor: '#1e293b'
    },
    {
      slideNumber: 3,
      title: 'System Architecture & Engineering Stack',
      subtitle: 'Modular RESTful API & Component Framework',
      bullets: [
        'Frontend: React 18, Vite SPA, Tailwind/Vanilla CSS with Dark/Light Themes',
        'Backend Engine: Node.js & Express.js REST API with JWT Authentication',
        'Data Layer: Relational SQLite & MySQL Engine with Sequelize ORM',
        'Media Processing: PPTX ZIP Parser & XML Data Extractor'
      ],
      paragraphs: [
        'Engineered adhering to strict separation of concerns, defensive error boundaries, and zero external binary dependencies.'
      ],
      bgColor: '#0f172a'
    },
    {
      slideNumber: 4,
      title: 'Core Features & Roadmap V2',
      subtitle: 'Live Demonstration & Future Milestones',
      bullets: [
        'Role-Based Admin Access with JWT Authorization Token Headers',
        'PowerPoint Deck Upload & Viewer with Dark/Light Canvas Themes',
        'Real-time Persistent Changelog System with Author Attribution',
        'Interactive Team Spotlight Cards & Course Milestone Timeline'
      ],
      paragraphs: [
        'Future iterations (V2) will incorporate machine-learning based predictive focus scoring and multi-workspace sync.'
      ],
      bgColor: '#1e293b'
    }
  ];
}

module.exports = { parsePPTX, generateFallbackSlides };
