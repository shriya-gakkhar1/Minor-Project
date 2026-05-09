const express = require('express');
const router = express.Router();
const { getPlacements } = require('../controllers/placementController');

// test route
router.get('/test-placement', (req, res) => {
  res.send('Placement route working');
});

// real route
router.get('/placements', getPlacements);

module.exports = router;