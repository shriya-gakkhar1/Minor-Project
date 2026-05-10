const express = require('express');
const { predictPlacement } = require('../services/placementPredictionEngine');

const router = express.Router();

router.post('/placement', (req, res) => {
  return res.json(predictPlacement({
    student: req.body?.student || req.body || {},
    job: req.body?.job || {},
  }));
});

router.post('/role', (req, res) => {
  return res.json(predictPlacement({
    student: req.body?.student || {},
    job: req.body?.drive || req.body?.job || {},
  }));
});

module.exports = router;
