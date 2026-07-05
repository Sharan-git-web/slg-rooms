const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

router.get('/daily', revenueController.getDailyRevenue);
router.get('/weekly', revenueController.getWeeklyRevenue);
router.get('/monthly', revenueController.getMonthlyRevenue);
router.get('/trends', revenueController.getTrends);
router.get('/sources', revenueController.getSources);

module.exports = router;
