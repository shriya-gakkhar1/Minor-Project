const express = require('express');
const { predictCampusStats } = require('../services/campusPredictorEngine');

const router = express.Router();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStatus(value) {
  const key = String(value || '').toLowerCase();
  if (key.includes('select') || key.includes('place') || key.includes('offer') || key.includes('hire')) return 'Selected';
  if (key.includes('interview') || key.includes('shortlist')) return 'Interview';
  if (key.includes('reject')) return 'Rejected';
  return 'Applied';
}

function safeRate(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(1));
}

router.post('/student-predict', (req, res) => {
  const body = req.body || {};

  const tier = toNumber(body.tier, 2);
  const cgpa = toNumber(body.cgpa, 0);
  const internships = toNumber(body.internships, 0);
  const projects = toNumber(body.no_of_projects, 0);
  const langs = toNumber(body.no_of_programming_languages, 0);
  const dsa = toNumber(body.dsa, 0);
  const webDev = toNumber(body.web_dev, 0);
  const ml = toNumber(body['Machine Learning'] ?? body.machine_learning, 0);
  const cloud = toNumber(body.cloud, 0);
  const hackathon = toNumber(body.is_participate_hackathon, 0);
  const extracurricular = toNumber(body.is_participated_extracurricular, 0);

  const score =
    cgpa * 7.5 +
    internships * 4 +
    projects * 2.8 +
    langs * 1.7 +
    (dsa ? 9 : 0) +
    (webDev ? 7 : 0) +
    (ml ? 6 : 0) +
    (cloud ? 5 : 0) +
    (hackathon ? 3 : 0) +
    (extracurricular ? 2 : 0) +
    (tier <= 1 ? 10 : tier === 2 ? 5 : 0);

  const placementProbability = clamp(Number((score / 1.6).toFixed(1)), 5, 98);
  const predictedSalary = Number((2.4 + placementProbability / 20 + internships * 0.35 + projects * 0.18 + ml * 0.6).toFixed(2));

  return res.json({
    is_placed: placementProbability >= 55 ? 1 : 0,
    placement_probability: placementProbability,
    predicted_salary: predictedSalary,
    top_improvement_factors: [
      'Improve CGPA consistency',
      'Increase project depth',
      'Strengthen DSA for interview rounds',
      'Add role-aligned internship experience',
    ],
    model_used: 'node-ml-stub-v1',
  });
});

router.post('/campus-predict', (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];

  const prediction = predictCampusStats(rows);
  if (!prediction.ok) {
    return res.status(400).json({
      message: prediction.error,
    });
  }

  return res.json(prediction.data);
});

router.post('/resume-parse', (req, res) => {
  const filename = String(req.body?.filename || 'resume.pdf').toLowerCase();

  return res.json({
    inferred_name: filename.replace(/\.[^.]+$/, ''),
    inferred_branch: filename.includes('ece') ? 'ECE' : filename.includes('it') ? 'IT' : 'CSE',
    flags: {
      dsa: filename.includes('dsa') ? 1 : 0,
      web_dev: filename.includes('web') || filename.includes('mern') ? 1 : 0,
      machine_learning: filename.includes('ml') || filename.includes('machine') ? 1 : 0,
      cloud: filename.includes('cloud') || filename.includes('aws') ? 1 : 0,
    },
    internships: filename.includes('intern') ? 1 : 0,
    no_of_projects: filename.includes('project') ? 3 : 2,
  });
});

router.post('/recommend-skills', (req, res) => {
  const body = req.body || {};
  const suggestions = [];

  if (!toNumber(body.dsa, 0)) suggestions.push('Data Structures and Algorithms');
  if (!toNumber(body.web_dev, 0)) suggestions.push('Web Development Projects');
  if (!toNumber(body['Machine Learning'] ?? body.machine_learning, 0)) suggestions.push('Machine Learning Basics');
  if (!toNumber(body.cloud, 0)) suggestions.push('Cloud Fundamentals');
  if (toNumber(body.no_of_projects, 0) < 3) suggestions.push('Build at least 3 quality projects');
  if (toNumber(body.internships, 0) < 1) suggestions.push('Gain internship experience');

  return res.json({
    recommended_skills: suggestions,
    source: 'node-ml-stub-v1',
  });
});

module.exports = router;
